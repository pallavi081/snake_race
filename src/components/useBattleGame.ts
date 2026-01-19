
import { useState, useEffect, useCallback, useRef } from 'react';
import Peer, { DataConnection } from 'peerjs';
import { Position, Direction } from '../types/game';
import { checkWallCollision, getOppositeDirection, GRID_SIZE } from '../utils/gameLogic';
import { Achievement } from '../data/achievements';

export interface Snake {
  id: string;
  name: string;
  color: string;
  body: Position[];
  direction: Direction;
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
const BASE_SPEED = 180;
const MIN_SPEED = 80;

export const useBattleGame = () => {
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
  });

  const peerRef = useRef<Peer | null>(null);
  const connectionsRef = useRef<Map<string, DataConnection>>(new Map());
  const isHostRef = useRef(false);
  const myIdRef = useRef<string | null>(null);
  const directionRef = useRef<Direction>('UP');
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const speedRef = useRef(BASE_SPEED);

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
          const { name, color, peerId } = message.payload;
          const startPos = generateRandomPosition();
          const newSnake: Snake = {
            id: peerId,
            name,
            color,
            body: createInitialSnake(startPos),
            direction: 'UP',
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
            magnet: false
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
        const { playerId, direction } = message.payload;
        setGameState(prev => ({
          ...prev,
          snakes: prev.snakes.map(s =>
            s.id === playerId ? { ...s, direction } : s
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
  const createRoom = useCallback((playerName: string, playerColor: string, isPrivate: boolean = false) => {
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const myId = `host-${roomId}`;
    isHostRef.current = true;
    myIdRef.current = myId;

    setGameState(prev => ({ ...prev, connectionStatus: 'connecting' }));

    // Create peer with room ID
    const peer = new Peer(`snake-${roomId}`, {
      debug: 1,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ]
      }
    });

    peerRef.current = peer;

    peer.on('open', (id) => {
      console.log('🎮 Host peer opened:', id);

      const startPos = generateRandomPosition();
      const playerSnake: Snake = {
        id: myId,
        name: playerName,
        body: createInitialSnake(startPos),
        color: playerColor,
        direction: 'UP',
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
        magnet: false
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
  }, [setupConnection]);

  // Join room
  const joinRoom = useCallback((playerName: string, playerColor: string, roomId: string) => {
    const myId = `player-${Date.now()}`;
    isHostRef.current = false;
    myIdRef.current = myId;

    setGameState(prev => ({ ...prev, connectionStatus: 'connecting', roomId, myId }));

    const peer = new Peer(myId, {
      debug: 2, // More verbose logging
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ]
      }
    });

    peerRef.current = peer;

    peer.on('open', () => {
      console.log('🎮 Client peer opened, connecting to host...');
      const hostPeerId = `snake-${roomId}`;
      console.log('🔗 Connecting to host peer:', hostPeerId);

      const conn = peer.connect(hostPeerId, { reliable: true });

      conn.on('open', () => {
        console.log('✅ Connection to host opened!');
        connectionsRef.current.set(conn.peer, conn);

        // Send join message
        const joinMsg = {
          type: 'JOIN',
          payload: { name: playerName, color: playerColor, peerId: myId },
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
    });

    peer.on('error', (err) => {
      console.error('❌ Join error:', err);
      if (err.type === 'peer-unavailable') {
        alert('Room not found. Check the Room ID or the host may have left.');
      }
      setGameState(prev => ({ ...prev, connectionStatus: 'error' }));
    });
  }, [handleMessage]);

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
  }, [broadcast]);

  // Change direction
  const changeDirection = useCallback((newDirection: Direction) => {
    if (getOppositeDirection(directionRef.current) !== newDirection) {
      directionRef.current = newDirection;

      // Broadcast direction change to all peers
      broadcast({
        type: 'DIRECTION',
        payload: { playerId: gameState.myId, direction: newDirection }
      });
    }
  }, [broadcast, gameState.myId]);

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
        direction: 'UP' as Direction,
        speedBoost: false,
        shield: false,
        doubleXp: false,
        magnet: false,
        score: 0,
      }))
    }));
  }, []);

  // Game Loop (HOST ONLY runs the game loop and syncs state to clients)
  useEffect(() => {
    if (!gameState.gameStarted || gameState.gameOver || !isHostRef.current) return;

    const speedInterval = setInterval(() => {
      speedRef.current = Math.max(MIN_SPEED, speedRef.current - 2);
      setGameState(prev => ({ ...prev, gameTime: prev.gameTime + 1 }));
    }, 1000);

    const runGameLoop = () => {
      setGameState(prev => {
        if (!prev.gameStarted || prev.gameOver) return prev;

        // Game logic (same as before but simplified)
        let newFoods = [...prev.foods];
        if (newFoods.length < 40 && Math.random() < 0.15) {
          newFoods.push(generateRandomPosition());
        }

        let newPowerUps = prev.powerUps.filter(p => p.expiresAt > Date.now());
        if (newPowerUps.length < 6 && Math.random() < 0.03) {
          newPowerUps.push({
            id: `powerup-${Date.now()}`,
            position: generateRandomPosition(),
            type: POWER_UP_TYPES[Math.floor(Math.random() * POWER_UP_TYPES.length)],
            expiresAt: Date.now() + 30000
          });
        }

        let newSnakes = prev.snakes.map(snake => {
          if (snake.isDead) return snake;

          let currentDir = snake.direction;
          if (snake.isPlayer && snake.id === prev.myId) {
            currentDir = directionRef.current;
          }

          const head = { ...snake.body[0] };
          switch (currentDir) {
            case 'UP': head.y -= 1; break;
            case 'DOWN': head.y += 1; break;
            case 'LEFT': head.x -= 1; break;
            case 'RIGHT': head.x += 1; break;
          }

          return { ...snake, body: [head, ...snake.body], direction: currentDir };
        });

        // Collision detection
        newSnakes = newSnakes.map(snake => {
          if (snake.isDead) return snake;
          const head = snake.body[0];

          if (checkWallCollision(head, prev.canvasWidth, prev.canvasHeight)) {
            if (snake.shield) return { ...snake, shield: false };
            return { ...snake, isDead: true };
          }

          for (const other of prev.snakes) {
            if (other.isDead) continue;
            const hit = other.body.some((seg, idx) => {
              if (other.id === snake.id && idx === 0) return false;
              return seg.x === head.x && seg.y === head.y;
            });
            if (hit) {
              if (snake.shield) return { ...snake, shield: false };
              if (other.id !== snake.id) {
                const ki = newSnakes.findIndex(s => s.id === other.id);
                if (ki !== -1) {
                  newSnakes[ki] = {
                    ...newSnakes[ki],
                    kills: newSnakes[ki].kills + 1,
                    xp: newSnakes[ki].xp + 50,
                    score: newSnakes[ki].score + 100
                  };
                }
              }
              return { ...snake, isDead: true };
            }
          }

          // Food collision
          const fi = newFoods.findIndex(f => f.x === head.x && f.y === head.y);
          if (fi !== -1) {
            newFoods.splice(fi, 1);
            const xpGain = 10 * snake.level;
            const newXp = snake.xp + xpGain;
            return { ...snake, score: snake.score + 10, xp: newXp, level: calculateLevel(newXp) };
          } else {
            snake.body.pop();
          }

          // Power-up collision
          const pi = newPowerUps.findIndex(p => p.position.x === head.x && p.position.y === head.y);
          if (pi !== -1) {
            const pu = newPowerUps[pi];
            newPowerUps.splice(pi, 1);
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

          return snake;
        });

        // Winner check
        const alive = newSnakes.filter(s => !s.isDead);
        let winner = prev.winner;
        let gameOver = prev.gameOver;

        if (alive.length === 1 && prev.snakes.length > 1) {
          winner = alive[0].name;
          gameOver = true;
        } else if (alive.length === 0) {
          gameOver = true;
        }

        const newState = { ...prev, snakes: newSnakes, foods: newFoods, powerUps: newPowerUps, gameOver, winner };

        // Sync state to clients
        if (isHostRef.current) {
          broadcast({ type: 'GAME_STATE', payload: newState });
        }

        return newState;
      });

      gameLoopRef.current = setTimeout(runGameLoop, speedRef.current);
    };

    gameLoopRef.current = setTimeout(runGameLoop, speedRef.current);

    return () => {
      clearInterval(speedInterval);
      if (gameLoopRef.current) clearTimeout(gameLoopRef.current);
    };
  }, [gameState.gameStarted, gameState.gameOver, broadcast]);

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
      connectionsRef.current.forEach(conn => conn.close());
      if (peerRef.current) peerRef.current.destroy();
      if (gameLoopRef.current) clearTimeout(gameLoopRef.current);
    };
  }, []);

  return {
    gameState,
    changeDirection,
    createRoom,
    joinRoom,
    startGame,
    resetGame,
    getXpForNextLevel,
    SNAKE_COLORS,
    unlockedAchievements,
    clearAchievements: () => setUnlockedAchievements([])
  };
};