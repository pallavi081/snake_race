import { useState, useEffect, useCallback, useRef } from 'react';
import Peer, { DataConnection } from 'peerjs';
import { Position, Direction } from '../types/game';
import { Achievement } from '../data/achievements';
import { useSound } from '../hooks/useSound';
import { registerPublicRoom, updatePublicRoom, deletePublicRoom, getAvailablePublicRooms, registerBattleRoom, getBattleRoom, deleteBattleRoom } from '../utils/cloudStorage';

export interface Snake {
  id: string;
  name: string;
  color: string;
  body: Position[];
  angle: number; // In radians
  targetAngle: number;
  score: number;
  isDead: boolean;
  isBot: boolean;
  isPlayer: boolean;
  level: number;
  xp: number;
  kills: number;
  shield: boolean;
  speedBoost: boolean;
  doubleXp: boolean;
  magnet: boolean;
  novaMeter: number; // 0-100
  isNovaActive: boolean;
  selectedHat?: string;
  selectedTrail?: string;
  selectedSkin?: string;
}

export type PowerUpType = 'speed' | 'shield' | 'doubleXp' | 'magnet' | 'bomb';

export interface PowerUp {
  id: string;
  type: PowerUpType;
  position: Position;
  expiresAt: number;
}

export interface BattleGameState {
  snakes: Snake[];
  foods: Position[];
  powerUps: PowerUp[];
  gameStarted: boolean;
  gameOver: boolean;
  winner: string | null;
  roomId: string | null;
  canvasWidth: number;
  canvasHeight: number;
  waitingForPlayers: boolean;
  myId: string | null;
  isConnected: boolean;
  isPrivate: boolean;
  gameTime: number;
  startTime?: number;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  connectedPeers: number;
  eliminatedPlayers: { id: string; name: string; time: number; killedBy?: string }[];
  lastBlast?: { x: number; y: number; time: number };
}

interface PeerMessage {
  type: 'JOIN' | 'PLAYER_LIST' | 'GAME_STATE' | 'DIRECTION' | 'START' | 'PLAYER_LEFT';
  payload: any;
  senderId: string;
}

const BOARD_WIDTH = 1200;
const BOARD_HEIGHT = 900;
const INITIAL_SNAKE_LENGTH = 5;
const POWER_UP_TYPES: PowerUpType[] = ['speed', 'shield', 'doubleXp', 'magnet', 'bomb'];

export const SNAKE_COLORS = [
  { name: 'Green', color: '#22c55e' },
  { name: 'Blue', color: '#3b82f6' },
  { name: 'Red', color: '#ef4444' },
  { name: 'Purple', color: '#a855f7' },
  { name: 'Pink', color: '#ec4899' },
  { name: 'Orange', color: '#f97316' },
  { name: 'Cyan', color: '#06b6d4' },
  { name: 'Yellow', color: '#eab308' },
];

const LEVEL_XP = [0, 100, 250, 500, 800, 1200, 1700, 2500, 3500, 5000];
const BASE_SPEED = 2.5; // Adjusted for RAF (distance per frame)
const MIN_SPEED = 1.2;

export const useBattleGame = () => {
  const { playExplosionSound, playSound } = useSound();
  const [unlockedAchievements, setUnlockedAchievements] = useState<Achievement[]>([]);
  const [gameState, setGameState] = useState<BattleGameState>({
    snakes: [],
    foods: [],
    powerUps: [],
    gameStarted: false,
    gameOver: false,
    winner: null,
    roomId: null,
    canvasWidth: BOARD_WIDTH,
    canvasHeight: BOARD_HEIGHT,
    waitingForPlayers: false,
    myId: null,
    isConnected: false,
    isPrivate: false,
    gameTime: 0,
    startTime: 0,
    connectionStatus: 'disconnected',
    connectedPeers: 0,
    eliminatedPlayers: [],
  });

  // Cleanup on unmount or mode change
  useEffect(() => {
    return () => {
      if (isHostRef.current && myIdRef.current && gameState.roomId) {
        console.log('🧹 Cleaning up room signaling:', gameState.roomId);
        deletePublicRoom(gameState.roomId);
        deleteBattleRoom(gameState.roomId);
      }
      if (peerRef.current) {
        peerRef.current.destroy();
      }
    };
  }, [gameState.roomId]);

  const peerRef = useRef<Peer | null>(null);
  const connectionsRef = useRef<Map<string, DataConnection>>(new Map());
  const isHostRef = useRef(false);
  const myIdRef = useRef<string | null>(null);
  const targetAngleRef = useRef<number>(0);
  const gameLoopRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const speedRef = useRef(1.5); // Movement per frame
  const GRID_SIZE = 20;

  const generateRandomPosition = (): Position => ({
    x: Math.floor(Math.random() * (BOARD_WIDTH / GRID_SIZE)),
    y: Math.floor(Math.random() * (BOARD_HEIGHT / GRID_SIZE))
  });

  const createInitialSnake = (startPos: Position): Position[] => {
    const body: Position[] = [];
    for (let i = 0; i < INITIAL_SNAKE_LENGTH; i++) {
      body.push({ x: startPos.x, y: startPos.y + i });
    }
    return body;
  };

  const calculateLevel = (xp: number): number => {
    for (let i = LEVEL_XP.length - 1; i >= 0; i--) {
      if (xp >= LEVEL_XP[i]) return i + 1;
    }
    return 1;
  };

  const getXpForNextLevel = (level: number): number => {
    if (level >= LEVEL_XP.length) return LEVEL_XP[LEVEL_XP.length - 1];
    return LEVEL_XP[level];
  };

  // Send message to all peers
  const broadcast = useCallback((message: Omit<PeerMessage, 'senderId'>) => {
    const fullMessage = { ...message, senderId: myIdRef.current || 'unknown' };
    connectionsRef.current.forEach((conn) => {
      if (conn.open) {
        console.log('📤 Broadcasting to', conn.peer, message.type);
        conn.send(fullMessage);
      }
    });
  }, []);

  // Handle incoming messages
  const handleMessage = useCallback((message: PeerMessage) => {
    console.log('📨 Message:', message.type, message.payload);

    switch (message.type) {
      case 'JOIN':
        // New player joined (host only)
        if (isHostRef.current) {
          const { name, color, peerId, selectedHat, selectedTrail, selectedSkin } = message.payload;
          const startPos = generateRandomPosition();
          const newSnake: Snake = {
            id: peerId,
            name,
            color,
            body: createInitialSnake(startPos),
            angle: Math.PI * 1.5, // Facing UP
            targetAngle: Math.PI * 1.5,
            isDead: false,
            isBot: false,
            isPlayer: false,
            score: 0,
            level: 1,
            xp: 0,
            kills: 0,
            shield: false,
            speedBoost: false,
            doubleXp: false,
            magnet: false,
            novaMeter: 0,
            isNovaActive: false,
            selectedHat,
            selectedTrail,
            selectedSkin
          };

          setGameState(prev => {
            const updatedSnakes = [...prev.snakes, newSnake];
            const updated = { ...prev, snakes: updatedSnakes, connectedPeers: prev.connectedPeers + 1 };

            // Send full player list to all connected peers immediately
            const playerListMsg = { type: 'PLAYER_LIST' as const, payload: updatedSnakes, senderId: myIdRef.current || 'host' };
            connectionsRef.current.forEach((c) => {
              if (c.open) {
                console.log('📤 Sending player list to', c.peer);
                c.send(playerListMsg);
              }
            });

            return updated;
          });
        }
        break;

      case 'PLAYER_LIST':
        // Received player list from host
        setGameState(prev => ({
          ...prev,
          snakes: message.payload,
          connectedPeers: message.payload.length - 1
        }));
        break;

      case 'GAME_STATE':
        // Full game state sync (clients receive this from host)
        if (!isHostRef.current) {
          setGameState(prev => ({
            ...prev,
            ...message.payload,
            myId: prev.myId // Keep our ID
          }));
        }
        break;

      case 'DIRECTION':
        // Player changed direction
        const { playerId, targetAngle } = message.payload;
        setGameState(prev => ({
          ...prev,
          snakes: prev.snakes.map(s =>
            s.id === playerId ? { ...s, targetAngle } : s
          )
        }));
        break;

      case 'START':
        setGameState(prev => ({ ...prev, gameStarted: true, waitingForPlayers: false }));
        break;

      case 'PLAYER_LEFT':
        setGameState(prev => ({
          ...prev,
          snakes: prev.snakes.filter(s => s.id !== message.payload.peerId),
          connectedPeers: Math.max(0, prev.connectedPeers - 1)
        }));
        break;
    }
  }, [broadcast]);

  // Setup connection handlers
  const setupConnection = useCallback((conn: DataConnection) => {
    conn.on('open', () => {
      console.log('✅ Connected to:', conn.peer);
      connectionsRef.current.set(conn.peer, conn);
      setGameState(prev => ({ ...prev, connectionStatus: 'connected', isConnected: true }));
    });

    conn.on('data', (data) => handleMessage(data as PeerMessage));

    conn.on('close', () => {
      console.log('🚪 Disconnected:', conn.peer);
      connectionsRef.current.delete(conn.peer);
      if (isHostRef.current) {
        broadcast({ type: 'PLAYER_LEFT', payload: { peerId: conn.peer } });
      }
      setGameState(prev => ({
        ...prev,
        snakes: prev.snakes.filter(s => s.id !== conn.peer),
        connectedPeers: connectionsRef.current.size
      }));
    });
  }, [handleMessage, broadcast]);

  // Create room (become host)
  const createRoom = useCallback((playerName: string, playerColor: string, isPrivate: boolean = false, selectedHat?: string, selectedTrail?: string, selectedSkin?: string) => {
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const myId = `host-${roomId}`;
    isHostRef.current = true;
    myIdRef.current = myId;

    // Cleanup any existing peer
    if (peerRef.current) {
      peerRef.current.destroy();
    }

    setGameState(prev => ({ ...prev, connectionStatus: 'connecting' }));

    // Create peer with random ID for maximum reliability
    const peer = new Peer({
      host: '0.peerjs.com',
      port: 443,
      secure: true,
      debug: 1,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
          { urls: 'stun:stun3.l.google.com:19302' },
          { urls: 'stun:stun.l.google.com:19305' },
        ]
      }
    });

    // Timeout cleanup
    const timeout = setTimeout(() => {
      if (peerRef.current && !peerRef.current.open && !peerRef.current.destroyed) {
        console.error('❌ Create Room timeout: Signaling server took too long');
        peerRef.current.destroy();
        setGameState(prev => ({ ...prev, connectionStatus: 'error' }));
      }
    }, 15000);

    peerRef.current = peer;

    peer.on('open', async (dynamicPeerId) => {
      clearTimeout(timeout);
      console.log('🎮 Host peer opened with dynamic ID:', dynamicPeerId);

      // Register the mapping in Firestore so clients can find us
      await registerBattleRoom(roomId, dynamicPeerId, isPrivate, playerName);

      const startPos = generateRandomPosition();
      const playerSnake: Snake = {
        id: myId,
        name: playerName,
        body: createInitialSnake(startPos),
        color: playerColor,
        angle: Math.PI * 1.5,
        targetAngle: Math.PI * 1.5,
        isDead: false,
        isBot: false,
        isPlayer: true,
        score: 0,
        level: 1,
        xp: 0,
        kills: 0,
        shield: false,
        speedBoost: false,
        doubleXp: false,
        magnet: false,
        novaMeter: 0,
        isNovaActive: false,
        selectedHat,
        selectedTrail,
        selectedSkin
      };

      setGameState(prev => ({
        ...prev,
        roomId,
        myId,
        snakes: [playerSnake],
        waitingForPlayers: true,
        isPrivate,
        isConnected: true,
        connectionStatus: 'connected',
        gameTime: 0
      }));

      // Register public room in Firestore
      if (!isPrivate) {
        registerPublicRoom(roomId, `snake-${roomId}`, playerName, false);
      }
    });

    peer.on('connection', (conn) => {
      console.log('🔗 Incoming connection:', conn.peer);
      setupConnection(conn);
    });

    peer.on('error', (err) => {
      console.error('❌ Peer error:', err);
      setGameState(prev => ({ ...prev, connectionStatus: 'error' }));
    });

    return roomId;
  }, [setupConnection, broadcast]);

  // Join room
  const joinRoom = useCallback((playerName: string, playerColor: string, roomId: string, selectedHat?: string, selectedTrail?: string, selectedSkin?: string) => {
    const myId = `player-${Date.now()}`;
    isHostRef.current = false;
    myIdRef.current = myId;

    // Cleanup any existing peer
    if (peerRef.current) {
      peerRef.current.destroy();
    }

    setGameState(prev => ({ ...prev, connectionStatus: 'connecting', roomId, myId }));

    const peer = new Peer(myId, {
      host: '0.peerjs.com',
      port: 443,
      secure: true,
      debug: 1,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
          { urls: 'stun:stun3.l.google.com:19302' },
          { urls: 'stun:stun.l.google.com:19305' },
        ]
      }
    });

    // Timeout cleanup
    const timeout = setTimeout(() => {
      if (peerRef.current && !peerRef.current.destroyed && (gameState.connectionStatus === 'connecting' || gameState.connectionStatus === 'disconnected')) {
        console.error('❌ Join Room timeout');
        peerRef.current.destroy();
        setGameState(prev => ({ ...prev, connectionStatus: 'error' }));
      }
    }, 15000);

    peerRef.current = peer;

    peer.on('open', async (myDynamicId) => {
      console.log('🎮 Client peer opened, looking up host for room:', roomId);

      try {
        // Look up the host's actual dynamic Peer ID from Firestore
        const roomData = await getBattleRoom(roomId);

        if (!roomData || !roomData.hostPeerId) {
          console.error('❌ Room not found in Firestore:', roomId);
          clearTimeout(timeout);
          alert('Room not found. Please check the Room ID.');
          peer.destroy();
          setGameState(prev => ({ ...prev, connectionStatus: 'error' }));
          return;
        }

        clearTimeout(timeout);
        const hostPeerId = roomData.hostPeerId;
        console.log('🔗 Connecting to host dynamic ID:', hostPeerId);

        const conn = peer.connect(hostPeerId, { reliable: true });

        conn.on('open', () => {
          console.log('✅ Connection to host opened!');
          connectionsRef.current.set(conn.peer, conn);

          // Send join message
          const joinMsg = {
            type: 'JOIN',
            payload: { name: playerName, color: playerColor, peerId: myId, selectedHat, selectedTrail, selectedSkin },
            senderId: myId
          };
          console.log('📤 Sending JOIN:', joinMsg);
          conn.send(joinMsg);

          setGameState(prev => ({
            ...prev,
            waitingForPlayers: true,
            isConnected: true,
            connectionStatus: 'connected'
          }));
        });

        conn.on('data', (data) => {
          console.log('📨 Received from host:', data);
          handleMessage(data as PeerMessage);
        });

        conn.on('close', () => {
          console.log('🚪 Connection closed');
          connectionsRef.current.delete(conn.peer);
          setGameState(prev => ({ ...prev, isConnected: false, connectionStatus: 'disconnected' }));
        });

        conn.on('error', (err) => console.error('❌ Conn error:', err));
      } catch (error) {
        console.error('❌ Signaling error:', error);
        clearTimeout(timeout);
        setGameState(prev => ({ ...prev, connectionStatus: 'error' }));
      }
    });

    peer.on('error', (err) => {
      console.error('❌ Join error:', err);
      if (err.type === 'peer-unavailable') {
        alert('Room not found. Check the Room ID or the host may have left.');
      }
      setGameState(prev => ({ ...prev, connectionStatus: 'error' }));
    });
  }, [handleMessage]);

  // Find and join a public quick match room
  const findQuickMatch = useCallback(async (playerName: string, playerColor: string, selectedHat?: string, selectedTrail?: string, selectedSkin?: string) => {
    setGameState(prev => ({ ...prev, connectionStatus: 'connecting' }));

    const availableRooms = await getAvailablePublicRooms();

    if (availableRooms.length > 0) {
      // Join the first available room
      const room = availableRooms[0];
      joinRoom(playerName, playerColor, room.roomId, selectedHat, selectedTrail, selectedSkin);
    } else {
      // Create a new public room if none found
      createRoom(playerName, playerColor, false, selectedHat, selectedTrail, selectedSkin);
    }
  }, [joinRoom, createRoom]);

  // Start game (host only)
  const startGame = useCallback(() => {
    if (!isHostRef.current) return;

    speedRef.current = BASE_SPEED;

    // Generate initial food and power-ups
    const foods: Position[] = [];
    for (let i = 0; i < 40; i++) foods.push(generateRandomPosition());

    const powerUps: PowerUp[] = [];
    for (let i = 0; i < 5; i++) {
      powerUps.push({
        id: `powerup-${Date.now()}-${i}`,
        position: generateRandomPosition(),
        type: POWER_UP_TYPES[Math.floor(Math.random() * POWER_UP_TYPES.length)],
        expiresAt: Date.now() + 30000
      });
    }

    setGameState(prev => ({
      ...prev,
      gameStarted: true,
      waitingForPlayers: false,
      foods,
      powerUps,
      gameTime: 0,
      startTime: Date.now()
    }));

    // Tell all clients to start
    broadcast({ type: 'START', payload: {} });

    // Update room status in Firestore
    if (gameState.roomId) {
      if (!gameState.isPrivate) {
        updatePublicRoom(gameState.roomId, { status: 'active' });
      }
      // Update universal signaling status
      updatePublicRoom(gameState.roomId, { status: 'active' }); // Note: Using updatePublicRoom as generic status updater for battle_rooms as well if needed or centralize it
    }
  }, [broadcast, gameState.isPrivate, gameState.roomId]);

  // Change angle based on direction input
  const changeDirection = useCallback((newDirection: Direction) => {
    let targetAngle = targetAngleRef.current;
    switch (newDirection) {
      case 'UP': targetAngle = -Math.PI / 2; break;
      case 'DOWN': targetAngle = Math.PI / 2; break;
      case 'LEFT': targetAngle = Math.PI; break;
      case 'RIGHT': targetAngle = 0; break;
    }

    targetAngleRef.current = targetAngle;
    broadcast({
      type: 'DIRECTION',
      payload: { playerId: gameState.myId, targetAngle }
    });
  }, [broadcast, gameState.myId]);

  // Activate Nova Mode (Boom Blaster)
  const activateNovaMode = useCallback(() => {
    setGameState(prev => {
      const mySnake = prev.snakes.find(s => s.id === prev.myId);
      if (!mySnake || mySnake.isDead || mySnake.novaMeter < 100 || mySnake.isNovaActive) return prev;

      // Broadcast Nova activation
      broadcast({ type: 'GAME_STATE', payload: { ...prev, snakes: prev.snakes.map(s => s.id === prev.myId ? { ...s, isNovaActive: true } : s) } });

      return {
        ...prev,
        snakes: prev.snakes.map(s => s.id === prev.myId ? { ...s, isNovaActive: true, novaMeter: 0 } : s)
      };
    });
  }, [broadcast]);

  // Reset game
  const resetGame = useCallback(() => {
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    speedRef.current = BASE_SPEED;

    setGameState(prev => ({
      ...prev,
      gameStarted: false,
      gameOver: false,
      winner: null,
      powerUps: [],
      gameTime: 0,
      snakes: prev.snakes.map(s => ({
        ...s,
        isDead: false,
        body: createInitialSnake(generateRandomPosition()),
        angle: Math.PI * 1.5,
        targetAngle: Math.PI * 1.5,
        speedBoost: false,
        shield: false,
        doubleXp: false,
        magnet: false,
        novaMeter: 0,
        isNovaActive: false,
        score: 0,
      }))
    }));
  }, []);

  // Game Loop (HOST ONLY runs the game loop and syncs state to clients)
  // Game Loop (HOST ONLY runs the game loop and syncs state to clients)
  useEffect(() => {
    if (!gameState.gameStarted || gameState.gameOver || !isHostRef.current) return;

    const speedInterval = setInterval(() => {
      speedRef.current = Math.max(MIN_SPEED, speedRef.current - 0.02);
      setGameState(prev => ({ ...prev, gameTime: prev.gameTime + 1 }));
    }, 1000);

    const runGameLoop = (timestamp: number) => {
      if (!lastUpdateRef.current) lastUpdateRef.current = timestamp;
      const dt = timestamp - lastUpdateRef.current;
      lastUpdateRef.current = timestamp;

      setGameState(prev => {
        if (!prev.gameStarted || prev.gameOver) return prev;

        let newFoods = [...prev.foods];
        if (newFoods.length < 60 && Math.random() < 0.2) {
          newFoods.push({
            x: Math.random() * (prev.canvasWidth / 20),
            y: Math.random() * (prev.canvasHeight / 20)
          });
        }

        let newPowerUps = prev.powerUps.filter(p => p.expiresAt > Date.now());
        if (newPowerUps.length < 6 && Math.random() < 0.03) {
          newPowerUps.push({
            id: `powerup-${Date.now()}`,
            position: {
              x: Math.random() * (prev.canvasWidth / 20),
              y: Math.random() * (prev.canvasHeight / 20)
            },
            type: POWER_UP_TYPES[Math.floor(Math.random() * POWER_UP_TYPES.length)],
            expiresAt: Date.now() + 30000
          });
        }

        let newSnakes = prev.snakes.map(snake => {
          if (snake.isDead) return snake;

          let currentAngle = snake.angle;
          let targetAngle = snake.targetAngle;

          if (snake.isPlayer && snake.id === prev.myId) {
            targetAngle = targetAngleRef.current;
          }

          let angleDiff = targetAngle - currentAngle;
          while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
          while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;

          const turnSpeed = 0.12;
          if (Math.abs(angleDiff) > turnSpeed) {
            currentAngle += Math.sign(angleDiff) * turnSpeed;
          } else {
            currentAngle = targetAngle;
          }

          const moveSpeed = snake.speedBoost ? speedRef.current * 1.6 : speedRef.current;
          const head = {
            x: snake.body[0].x + Math.cos(currentAngle) * moveSpeed * (dt / 16.67),
            y: snake.body[0].y + Math.sin(currentAngle) * moveSpeed * (dt / 16.67)
          };

          const newBody = [head, ...snake.body];
          const desiredLength = 10 + (snake.score / 15);
          const SEG_DISTANCE = 0.4;
          const filteredBody = [head];
          let lastAdded = head;

          for (let i = 1; i < newBody.length; i++) {
            const seg = newBody[i];
            const dist = Math.sqrt((seg.x - lastAdded.x) ** 2 + (seg.y - lastAdded.y) ** 2);
            if (dist >= SEG_DISTANCE) {
              filteredBody.push(seg);
              lastAdded = seg;
            }
            if (filteredBody.length >= desiredLength) break;
          }

          return { ...snake, body: filteredBody, angle: currentAngle, targetAngle };
        });

        // Collision detection
        const GRID_SCALER = 20;
        newSnakes = newSnakes.map((snake) => {
          if (snake.isDead) return snake;
          const head = snake.body[0];

          if (head.x < 0 || head.x > prev.canvasWidth / GRID_SCALER || head.y < 0 || head.y > prev.canvasHeight / GRID_SCALER) {
            if (snake.shield) return { ...snake, shield: false };
            if (snake.id === prev.myId) playSound(200, 0.3, 'sawtooth');
            return { ...snake, isDead: true };
          }

          for (const other of newSnakes) {
            if (other.isDead) continue;
            const hit = other.body.some((seg, idx) => {
              if (other.id === snake.id && idx < 8) return false;
              const dist = Math.sqrt((seg.x - head.x) ** 2 + (seg.y - head.y) ** 2);
              return dist < 0.6;
            });
            if (hit) {
              if (snake.shield) return { ...snake, shield: false };
              if (snake.id === prev.myId) playSound(150, 0.4, 'sawtooth');
              return { ...snake, isDead: true };
            }
          }

          const headX = head.x;
          const headY = head.y;
          const initialFoodCount = newFoods.length;
          newFoods = newFoods.filter(f => {
            const dist = Math.sqrt((f.x - headX) ** 2 + (f.y - headY) ** 2);
            return dist > 1.0;
          });

          if (newFoods.length < initialFoodCount) {
            const eatenCount = initialFoodCount - newFoods.length;
            const xpGain = eatenCount * 12 * snake.level;
            const newXp = snake.xp + xpGain;
            if (snake.id === prev.myId) playSound(800, 0.05, 'sine', 0.05);
            return { ...snake, score: snake.score + (eatenCount * 10), xp: newXp, level: calculateLevel(newXp) };
          }

          const headX_pu = head.x;
          const headY_pu = head.y;
          const pi = newPowerUps.findIndex(p => {
            const dist = Math.sqrt((p.position.x - headX_pu) ** 2 + (p.position.y - headY_pu) ** 2);
            return dist < 1.2;
          });

          if (pi !== -1) {
            const pu = newPowerUps[pi];
            newPowerUps.splice(pi, 1);
            if (snake.id === prev.myId) playSound(1200, 0.1, 'sine', 0.1);
            switch (pu.type) {
              case 'speed': return { ...snake, speedBoost: true, score: snake.score + 25 };
              case 'shield': return { ...snake, shield: true, score: snake.score + 50 };
              case 'doubleXp': return { ...snake, doubleXp: true, score: snake.score + 30 };
              case 'magnet': return { ...snake, magnet: true, score: snake.score + 40 };
              case 'bomb':
                const nb = [...snake.body];
                for (let i = 0; i < 5; i++) nb.push({ ...snake.body[snake.body.length - 1] });
                return { ...snake, body: nb, score: snake.score + 60 };
            }
          }

          let newNovaMeter = snake.novaMeter;
          if (!snake.isNovaActive && newNovaMeter < 100) {
            newNovaMeter = Math.min(100, newNovaMeter + 0.05);
          }

          return { ...snake, novaMeter: newNovaMeter };
        });

        const activeNovaSnakes = newSnakes.filter(s => s.isNovaActive);
        let goldenGems: Position[] = [];
        let blastPos: Position | null = null;

        if (activeNovaSnakes.length > 0) {
          const BLAST_RADIUS = 5;
          blastPos = activeNovaSnakes[0].body[0];
          activeNovaSnakes.forEach(novaSnake => {
            const head = novaSnake.body[0];
            newSnakes = newSnakes.map(target => {
              if (target.id === novaSnake.id || target.isDead) return target;
              const isHit = target.body.some(seg => {
                const dist = Math.sqrt((seg.x - head.x) ** 2 + (seg.y - head.y) ** 2);
                return dist <= BLAST_RADIUS;
              });
              if (isHit) {
                target.body.forEach(seg => {
                  if (Math.random() < 0.6) goldenGems.push(seg);
                });
                return { ...target, isDead: true };
              }
              return target;
            });
          });
          newSnakes = newSnakes.map(s => ({ ...s, isNovaActive: false }));
        }

        if (goldenGems.length > 0) newFoods = [...newFoods, ...goldenGems];
        const lastBlast = blastPos ? { x: blastPos.x, y: blastPos.y, time: Date.now() } : prev.lastBlast;
        if (blastPos) playExplosionSound();

        const newlyEliminated: { id: string; name: string; time: number; killedBy?: string }[] = [];
        newSnakes.forEach((snake, idx) => {
          const wasAlive = prev.snakes[idx] && !prev.snakes[idx].isDead;
          if (wasAlive && snake.isDead) {
            const killer = newSnakes.find(s => s.id !== snake.id && s.kills > (prev.snakes.find(ps => ps.id === s.id)?.kills || 0));
            newlyEliminated.push({ id: snake.id, name: snake.name, time: prev.gameTime, killedBy: killer?.name });
          }
        });

        const eliminatedPlayers = [...prev.eliminatedPlayers, ...newlyEliminated];
        const alive = newSnakes.filter(s => !s.isDead);
        let winner = prev.winner;
        let gameOver: boolean = prev.gameOver;

        if (alive.length === 1 && prev.snakes.length > 1) {
          const winnerSnake = alive[0];
          const sizeBonus = winnerSnake.body.length * 5;
          const timeBonus = prev.gameTime * 2;
          const totalScore = winnerSnake.score + sizeBonus + timeBonus + 500;
          const winnerIdx = newSnakes.findIndex(s => s.id === winnerSnake.id);
          if (winnerIdx !== -1) newSnakes[winnerIdx] = { ...newSnakes[winnerIdx], score: totalScore };
          winner = winnerSnake.name;
          gameOver = true;
        } else if (alive.length === 0) {
          gameOver = true;
        }

        const newState = { ...prev, snakes: newSnakes, foods: newFoods, powerUps: newPowerUps, gameOver, winner, eliminatedPlayers, lastBlast };
        if (isHostRef.current) broadcast({ type: 'GAME_STATE', payload: newState });
        return newState;
      });

      gameLoopRef.current = requestAnimationFrame(runGameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(runGameLoop);

    return () => {
      clearInterval(speedInterval);
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameState.gameStarted, gameState.gameOver, broadcast, playExplosionSound, playSound]);

  // Keyboard controls
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') changeDirection('UP');
      if (e.key === 'ArrowDown') changeDirection('DOWN');
      if (e.key === 'ArrowLeft') changeDirection('LEFT');
      if (e.key === 'ArrowRight') changeDirection('RIGHT');
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [changeDirection]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (peerRef.current) {
        if (isHostRef.current && gameState.roomId) {
          deletePublicRoom(gameState.roomId);
        }
        peerRef.current.destroy();
      }
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameState.roomId]);

  return {
    gameState,
    changeDirection,
    createRoom,
    joinRoom,
    startGame,
    resetGame,
    getXpForNextLevel,
    findQuickMatch,
    activateNovaMode,
    SNAKE_COLORS,
    unlockedAchievements,
    clearAchievements: () => setUnlockedAchievements([])
  };
};