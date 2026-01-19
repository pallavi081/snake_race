import { useState, useEffect, useRef, useCallback } from 'react';
import Peer, { DataConnection } from 'peerjs';

export interface PeerMessage {
    type: 'JOIN' | 'STATE_UPDATE' | 'START_GAME' | 'DIRECTION' | 'PLAYER_LEFT';
    payload: any;
    senderId: string;
    timestamp: number;
}

interface UsePeerConnectionProps {
    onMessage: (message: PeerMessage) => void;
    onPeerConnected: (peerId: string) => void;
    onPeerDisconnected: (peerId: string) => void;
}

export const usePeerConnection = ({ onMessage, onPeerConnected, onPeerDisconnected }: UsePeerConnectionProps) => {
    const [myPeerId, setMyPeerId] = useState<string | null>(null);
    const [isHost, setIsHost] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [connectedPeers, setConnectedPeers] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    const peerRef = useRef<Peer | null>(null);
    const connectionsRef = useRef<Map<string, DataConnection>>(new Map());

    // Initialize Peer
    const initializePeer = useCallback((roomId?: string) => {
        // Clean up existing peer
        if (peerRef.current) {
            peerRef.current.destroy();
        }

        // Use room ID as peer ID for host, or generate random for joiners
        const peerId = roomId ? `snake-room-${roomId}` : `snake-player-${Math.random().toString(36).substr(2, 9)}`;

        const peer = new Peer(peerId, {
            debug: 1, // Minimal logging
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:stun1.l.google.com:19302' },
                ]
            }
        });

        peerRef.current = peer;

        peer.on('open', (id) => {
            console.log('📡 Peer opened:', id);
            setMyPeerId(id);
            setIsConnected(true);
            setError(null);
        });

        peer.on('connection', (conn) => {
            console.log('🔗 Incoming connection from:', conn.peer);
            handleConnection(conn);
        });

        peer.on('error', (err) => {
            console.error('❌ Peer error:', err);
            if (err.type === 'peer-unavailable') {
                setError('Room not found. The host may have left.');
            } else if (err.type === 'unavailable-id') {
                setError('Room ID already in use. Try a different one.');
            } else {
                setError(`Connection error: ${err.message}`);
            }
        });

        peer.on('disconnected', () => {
            console.log('📴 Peer disconnected');
            setIsConnected(false);
        });

        return peer;
    }, []);

    // Handle a new connection
    const handleConnection = useCallback((conn: DataConnection) => {
        conn.on('open', () => {
            console.log('✅ Connection opened with:', conn.peer);
            connectionsRef.current.set(conn.peer, conn);
            setConnectedPeers(Array.from(connectionsRef.current.keys()));
            onPeerConnected(conn.peer);
        });

        conn.on('data', (data) => {
            const message = data as PeerMessage;
            console.log('📨 Received:', message.type, 'from', message.senderId);
            onMessage(message);
        });

        conn.on('close', () => {
            console.log('🚪 Connection closed:', conn.peer);
            connectionsRef.current.delete(conn.peer);
            setConnectedPeers(Array.from(connectionsRef.current.keys()));
            onPeerDisconnected(conn.peer);
        });

        conn.on('error', (err) => {
            console.error('Connection error with', conn.peer, err);
        });
    }, [onMessage, onPeerConnected, onPeerDisconnected]);

    // Create a room (become host)
    const createRoom = useCallback((roomId: string) => {
        setIsHost(true);
        initializePeer(roomId);
        return roomId;
    }, [initializePeer]);

    // Join a room (connect to host)
    const joinRoom = useCallback((roomId: string) => {
        setIsHost(false);
        const peer = initializePeer();

        // Wait for peer to be ready, then connect to host
        peer.on('open', () => {
            const hostPeerId = `snake-room-${roomId}`;
            console.log('🔌 Connecting to host:', hostPeerId);

            const conn = peer.connect(hostPeerId, { reliable: true });
            handleConnection(conn);
        });

        return roomId;
    }, [initializePeer, handleConnection]);

    // Send message to all connected peers
    const broadcast = useCallback((message: Omit<PeerMessage, 'senderId' | 'timestamp'>) => {
        const fullMessage: PeerMessage = {
            ...message,
            senderId: myPeerId || 'unknown',
            timestamp: Date.now()
        };

        connectionsRef.current.forEach((conn, peerId) => {
            if (conn.open) {
                conn.send(fullMessage);
            } else {
                console.warn('⚠️ Connection not open to', peerId);
            }
        });
    }, [myPeerId]);

    // Send message to specific peer
    const sendToPeer = useCallback((peerId: string, message: Omit<PeerMessage, 'senderId' | 'timestamp'>) => {
        const conn = connectionsRef.current.get(peerId);
        if (conn && conn.open) {
            const fullMessage: PeerMessage = {
                ...message,
                senderId: myPeerId || 'unknown',
                timestamp: Date.now()
            };
            conn.send(fullMessage);
        }
    }, [myPeerId]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            connectionsRef.current.forEach(conn => conn.close());
            if (peerRef.current) {
                peerRef.current.destroy();
            }
        };
    }, []);

    return {
        myPeerId,
        isHost,
        isConnected,
        connectedPeers,
        error,
        createRoom,
        joinRoom,
        broadcast,
        sendToPeer
    };
};
