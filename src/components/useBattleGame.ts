import { useState, useEffect, useCallback, useRef } from 'react';
import { Position, Direction } from '../types/game';
import { checkWallCollision, getOppositeDirection, GRID_SIZE } from '../utils/gameLogic.ts';

export interface Snake {
  id: string;
  name: string;
  body: Position[];
  color: string;
  direction: Direction;
  isDead: boolean;
  isPlayer: boolean;
  score: number;
  level: number;
  xp: number;
  kills: number;
  speedBoost: boolean;
  shield: boolean;
  doubleXp: boolean;
}

export type PowerUpType = 'speed' | 'shield' | 'doubleXp' | 'magnet' | 'bomb';

export interface PowerUp {
  id: string;
  position: Position;
  type: PowerUpType;
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
  gameTime: number; // seconds since game started
}

// Larger map for battle royale feel
const BOARD_WIDTH = 1200;
const BOARD_HEIGHT = 900;
const INITIAL_SNAKE_LENGTH = 5;
const BOT_NAMES = ['Viper', 'Python', 'Cobra', 'Anaconda', 'Mamba', 'Sidewinder', 'Rattler', 'Boa', 'Asp', 'Krait'];
const POWER_UP_TYPES: PowerUpType[] = ['speed', 'shield', 'doubleXp', 'magnet', 'bomb'];

// Snake color options
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

// Level thresholds
const LEVEL_XP = [0, 100, 250, 500, 800, 1200, 1700, 2500, 3500, 5000];

// Speed settings - starts slow, gets faster
const BASE_SPEED = 180; // Start slow (higher = slower)
const MIN_SPEED = 80;   // Max speed cap
const SPEED_DECREASE_PER_SECOND = 2; // Gets faster over time

export const useBattleGame = () => {
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
  });

  const directionRef = useRef<Direction>('UP');
  const botIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const speedRef = useRef(BASE_SPEED);

  useEffect(() => {
    const timer = setTimeout(() => {
      setGameState(prev => ({ ...prev, isConnected: true }));
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    return () => {
      if (botIntervalRef.current) clearInterval(botIntervalRef.current);
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, []);

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

  const createRoom = useCallback((playerName: string, playerColor: string, isPrivate: boolean = false) => {
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const myId = 'player-' + Date.now();
    const startPos = generateRandomPosition();

    const playerSnake: Snake = {
      id: myId,
      name: playerName,
      body: createInitialSnake(startPos),
      color: playerColor,
      direction: 'UP',
      isDead: false,
      isPlayer: true,
      score: 0,
      level: 1,
      xp: 0,
      kills: 0,
      speedBoost: false,
      shield: false,
      doubleXp: false
    };

    setGameState(prev => ({
      ...prev,
      roomId,
      myId,
      snakes: [playerSnake],
      waitingForPlayers: true,
      isPrivate,
      gameTime: 0
    }));

    if (!isPrivate) {
      let botCount = 0;
      botIntervalRef.current = setInterval(() => {
        if (botCount >= 5) {
          if (botIntervalRef.current) clearInterval(botIntervalRef.current);
          return;
        }
        addBot();
        botCount++;
      }, 800);
    }
  }, []);

  const joinRoom = useCallback((playerName: string, playerColor: string, roomId: string) => {
    const myId = 'player-' + Date.now();
    const startPos = generateRandomPosition();

    const playerSnake: Snake = {
      id: myId,
      name: playerName,
      body: createInitialSnake(startPos),
      color: playerColor,
      direction: 'UP',
      isDead: false,
      isPlayer: true,
      score: 0,
      level: 1,
      xp: 0,
      kills: 0,
      speedBoost: false,
      shield: false,
      doubleXp: false
    };

    setGameState(prev => ({
      ...prev,
      roomId,
      myId,
      snakes: [...prev.snakes, playerSnake],
      waitingForPlayers: true
    }));
  }, []);

  const addBot = () => {
    setGameState(prev => {
      if (prev.gameStarted || prev.isPrivate) return prev;
      const name = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
      const colorIdx = (prev.snakes.length) % SNAKE_COLORS.length;
      const color = SNAKE_COLORS[colorIdx].color;
      const startPos = generateRandomPosition();
      const botLevel = Math.floor(Math.random() * 3) + 1;

      const bot: Snake = {
        id: `bot-${Date.now()}-${Math.random()}`,
        name,
        body: createInitialSnake(startPos),
        color,
        direction: ['UP', 'DOWN', 'LEFT', 'RIGHT'][Math.floor(Math.random() * 4)] as Direction,
        isDead: false,
        isPlayer: false,
        score: 0,
        level: botLevel,
        xp: LEVEL_XP[botLevel - 1] || 0,
        kills: 0,
        speedBoost: false,
        shield: false,
        doubleXp: false
      };
      return { ...prev, snakes: [...prev.snakes, bot] };
    });
  };

  const startGame = useCallback(() => {
    if (botIntervalRef.current) clearInterval(botIntervalRef.current);
    speedRef.current = BASE_SPEED;

    setGameState(prev => {
      const foods: Position[] = [];
      for (let i = 0; i < 40; i++) {
        foods.push(generateRandomPosition());
      }
      const powerUps: PowerUp[] = [];
      for (let i = 0; i < 5; i++) {
        powerUps.push({
          id: `powerup-${Date.now()}-${i}`,
          position: generateRandomPosition(),
          type: POWER_UP_TYPES[Math.floor(Math.random() * POWER_UP_TYPES.length)],
          expiresAt: Date.now() + 30000
        });
      }
      return { ...prev, gameStarted: true, waitingForPlayers: false, foods, powerUps, gameTime: 0 };
    });
    directionRef.current = 'UP';
  }, []);

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
        doubleXp: false
      }))
    }));
  }, []);

  const changeDirection = useCallback((newDirection: Direction) => {
    if (getOppositeDirection(directionRef.current) !== newDirection) {
      directionRef.current = newDirection;
    }
  }, []);

  // Game Loop with dynamic speed
  useEffect(() => {
    if (!gameState.gameStarted || gameState.gameOver) return;

    // Speed increases over time
    const speedInterval = setInterval(() => {
      speedRef.current = Math.max(MIN_SPEED, speedRef.current - SPEED_DECREASE_PER_SECOND);
      setGameState(prev => ({ ...prev, gameTime: prev.gameTime + 1 }));
    }, 1000);

    // Dynamic game loop
    const runGameLoop = () => {
      setGameState(prev => {
        if (!prev.gameStarted || prev.gameOver) return prev;

        // Auto-spawn food
        let newFoods = [...prev.foods];
        if (newFoods.length < 40 && Math.random() < 0.15) {
          newFoods.push(generateRandomPosition());
        }

        // Auto-spawn power-ups
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
          if (snake.isPlayer) {
            currentDir = directionRef.current;
          } else {
            // Bot AI
            let nearestFood = prev.foods[0];
            let minDist = 9999;
            prev.foods.forEach(f => {
              const dist = Math.abs(f.x - snake.body[0].x) + Math.abs(f.y - snake.body[0].y);
              if (dist < minDist) { minDist = dist; nearestFood = f; }
            });

            if (nearestFood) {
              const randomChance = Math.max(0.02, 0.12 - (snake.level * 0.02));
              if (Math.random() > randomChance) {
                if (nearestFood.x > snake.body[0].x && currentDir !== 'LEFT') currentDir = 'RIGHT';
                else if (nearestFood.x < snake.body[0].x && currentDir !== 'RIGHT') currentDir = 'LEFT';
                else if (nearestFood.y > snake.body[0].y && currentDir !== 'UP') currentDir = 'DOWN';
                else if (nearestFood.y < snake.body[0].y && currentDir !== 'DOWN') currentDir = 'UP';
              } else {
                const dirs: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
                currentDir = dirs[Math.floor(Math.random() * 4)];
              }
            }
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

        // Collisions
        newSnakes = newSnakes.map(snake => {
          if (snake.isDead) return snake;
          const head = snake.body[0];

          // Wall
          if (checkWallCollision(head, prev.canvasWidth, prev.canvasHeight)) {
            if (snake.shield) return { ...snake, shield: false };
            return { ...snake, isDead: true };
          }

          // Snake collision
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
                if (ki !== -1 && !newSnakes[ki].isDead) {
                  const xpGain = 50 + snake.level * 10;
                  const newXp = newSnakes[ki].xp + xpGain;
                  newSnakes[ki] = {
                    ...newSnakes[ki],
                    xp: newXp,
                    level: calculateLevel(newXp),
                    kills: newSnakes[ki].kills + 1,
                    score: newSnakes[ki].score + 100
                  };
                }
              }
              return { ...snake, isDead: true };
            }
          }

          // Food
          const fi = newFoods.findIndex(f => f.x === head.x && f.y === head.y);
          if (fi !== -1) {
            newFoods.splice(fi, 1);
            const mult = snake.doubleXp ? 2 : 1;
            const xpGain = 10 * snake.level * mult;
            const newXp = snake.xp + xpGain;
            return { ...snake, score: snake.score + 10 * snake.level, xp: newXp, level: calculateLevel(newXp) };
          } else {
            snake.body.pop();
          }

          // Power-up
          const pi = newPowerUps.findIndex(p => p.position.x === head.x && p.position.y === head.y);
          if (pi !== -1) {
            const pu = newPowerUps[pi];
            newPowerUps.splice(pi, 1);
            switch (pu.type) {
              case 'speed': return { ...snake, speedBoost: true, score: snake.score + 25 };
              case 'shield': return { ...snake, shield: true, score: snake.score + 50 };
              case 'doubleXp': return { ...snake, doubleXp: true, score: snake.score + 30 };
              case 'magnet': return { ...snake, xp: snake.xp + 50, score: snake.score + 40 };
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

        return { ...prev, snakes: newSnakes, foods: newFoods, powerUps: newPowerUps, gameOver, winner };
      });

      // Schedule next frame with current speed
      gameLoopRef.current = setTimeout(runGameLoop, speedRef.current);
    };

    gameLoopRef.current = setTimeout(runGameLoop, speedRef.current);

    return () => {
      clearInterval(speedInterval);
      if (gameLoopRef.current) clearTimeout(gameLoopRef.current);
    };
  }, [gameState.gameStarted, gameState.gameOver]);

  // Keyboard
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

  return { gameState, changeDirection, createRoom, joinRoom, startGame, resetGame, getXpForNextLevel, SNAKE_COLORS };
};