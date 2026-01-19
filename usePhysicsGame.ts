import { useState, useEffect, useCallback, useRef } from 'react';

interface PhysicsObject {
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'solid' | 'platform';
}

interface PhysicsState {
  snakeHead: { x: number; y: number; vx: number; vy: number };
  snakeBody: { x: number; y: number }[];
  platforms: PhysicsObject[];
  food: { x: number; y: number };
  score: number;
  gameOver: boolean;
  gameStarted: boolean;
}

const GRAVITY = 0.5;
const JUMP_FORCE = -10;
const MOVE_SPEED = 5;
const TERMINAL_VELOCITY = 12;

export const usePhysicsGame = (canvasWidth: number, canvasHeight: number) => {
  const [gameState, setGameState] = useState<PhysicsState>({
    snakeHead: { x: 50, y: 50, vx: 0, vy: 0 },
    snakeBody: [],
    platforms: [
      { x: 0, y: 350, width: 800, height: 50, type: 'solid' }, // Ground
      { x: 200, y: 250, width: 100, height: 20, type: 'platform' },
      { x: 400, y: 150, width: 100, height: 20, type: 'platform' },
    ],
    food: { x: 250, y: 200 },
    score: 0,
    gameOver: false,
    gameStarted: false,
  });

  const gameLoopRef = useRef<NodeJS.Timeout>();
  const lastTimeRef = useRef<number>(0);
  const historyRef = useRef<{ x: number; y: number }[]>([]);

  const spawnFood = useCallback((platforms: PhysicsObject[]) => {
    const platform = platforms[Math.floor(Math.random() * platforms.length)];
    return {
      x: platform.x + Math.random() * (platform.width - 20),
      y: platform.y - 30
    };
  }, []);

  const jump = useCallback(() => {
    setGameState(prev => {
      if (!prev.gameStarted || prev.gameOver) return prev;
      // Only jump if close to something below (simplified ground check)
      return {
        ...prev,
        snakeHead: { ...prev.snakeHead, vy: JUMP_FORCE }
      };
    });
  }, []);

  const moveHorizontal = useCallback((direction: 'LEFT' | 'RIGHT') => {
    setGameState(prev => {
      if (!prev.gameStarted || prev.gameOver) return prev;
      return {
        ...prev,
        snakeHead: { 
          ...prev.snakeHead, 
          vx: direction === 'LEFT' ? -MOVE_SPEED : MOVE_SPEED 
        }
      };
    });
  }, []);

  const stopHorizontal = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      snakeHead: { ...prev.snakeHead, vx: 0 }
    }));
  }, []);

  const updatePhysics = useCallback(() => {
    setGameState(prev => {
      if (!prev.gameStarted || prev.gameOver) return prev;

      let { x, y, vx, vy } = prev.snakeHead;

      // Apply Gravity
      vy += GRAVITY;
      if (vy > TERMINAL_VELOCITY) vy = TERMINAL_VELOCITY;

      // Apply Velocity
      x += vx;
      y += vy;

      // Collision with platforms
      let onGround = false;
      for (const plat of prev.platforms) {
        if (
          x + 20 > plat.x &&
          x < plat.x + plat.width &&
          y + 20 > plat.y &&
          y + 20 < plat.y + plat.height + vy + 2 // Check slightly ahead
        ) {
          if (vy > 0 && y + 20 <= plat.y + 10) { // Landing on top
            y = plat.y - 20;
            vy = 0;
            onGround = true;
          }
        }
      }

      // Screen boundaries
      if (x < 0) x = 0;
      if (x > canvasWidth - 20) x = canvasWidth - 20;
      if (y > canvasHeight) {
        // Fell off screen
        return { ...prev, gameOver: true };
      }

      // Food Collision
      let newScore = prev.score;
      let newFood = prev.food;
      let newBody = [...prev.snakeBody];
      
      const dx = x - prev.food.x;
      const dy = y - prev.food.y;
      if (Math.sqrt(dx*dx + dy*dy) < 30) {
        newScore += 10;
        newFood = spawnFood(prev.platforms);
        // Grow snake
        newBody.push({ x: -100, y: -100 }); // Placeholder, will be updated by history
      }

      // Update Body (Follow logic)
      historyRef.current.unshift({ x, y });
      if (historyRef.current.length > 500) historyRef.current.pop(); // Limit history

      const spacing = 10; // Frames/distance between segments
      newBody = newBody.map((_, i) => {
        const index = (i + 1) * 5; // 5 frames delay per segment
        return historyRef.current[index] || historyRef.current[historyRef.current.length - 1];
      });

      return {
        ...prev,
        snakeHead: { x, y, vx, vy },
        snakeBody: newBody,
        score: newScore,
        food: newFood
      };
    });
  }, [canvasWidth, canvasHeight, spawnFood]);

  useEffect(() => {
    if (gameState.gameStarted && !gameState.gameOver) {
      gameLoopRef.current = setInterval(updatePhysics, 1000 / 60);
    }
    return () => clearInterval(gameLoopRef.current);
  }, [gameState.gameStarted, gameState.gameOver, updatePhysics]);

  const startGame = () => setGameState(prev => ({ ...prev, gameStarted: true, gameOver: false, score: 0, snakeBody: [] }));
  const resetGame = () => {
    historyRef.current = [];
    setGameState(prev => ({
      ...prev,
      snakeHead: { x: 50, y: 50, vx: 0, vy: 0 },
      snakeBody: [],
      score: 0,
      gameOver: false,
      gameStarted: false
    }));
  };

  return { gameState, startGame, resetGame, jump, moveHorizontal, stopHorizontal };
};