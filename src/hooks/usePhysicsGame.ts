import { useState, useEffect, useCallback } from 'react';
import { useSound } from './useSound';
import { physicsLevels, PhysicsLevel } from '../levels';
import { Position } from '../types/game';
import { TileType } from '../tiles';

const GRAVITY = 0.6;
const TERMINAL_VELOCITY = 12;
const MOVE_SPEED = 5;
const JUMP_FORCE = -12;
const TILE_SIZE = 20;

interface PhysicsGameState {
  currentLevelIndex: number;
  level: PhysicsLevel;
  snake: { pos: Position, vel: { x: number, y: number } };
  food: Position[];
  isLevelComplete: boolean;
  isLevelFailed: boolean;
  canJump: boolean;
  gameStarted: boolean;
}

export const usePhysicsGame = () => {
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [gameState, setGameState] = useState<PhysicsGameState>(() => {
    const level = physicsLevels[currentLevelIndex];
    return {
      currentLevelIndex,
      level,
      snake: { pos: { x: level.initialSnake[0].x * TILE_SIZE, y: level.initialSnake[0].y * TILE_SIZE }, vel: { x: 0, y: 0 } },
      food: level.foodPositions.map(p => ({ x: p.x * TILE_SIZE, y: p.y * TILE_SIZE })),
      isLevelComplete: false,
      isLevelFailed: false,
      canJump: false,
      gameStarted: false
    };
  });

  const { playSound } = useSound();

  const moveHorizontal = (direction: 'LEFT' | 'RIGHT') => {
    setGameState(prev => ({
      ...prev,
      snake: {
        ...prev.snake,
        vel: { ...prev.snake.vel, x: direction === 'LEFT' ? -MOVE_SPEED : MOVE_SPEED },
      },
    }));
  };

  const stopHorizontal = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      snake: {
        ...prev.snake,
        vel: { ...prev.snake.vel, x: 0 },
      },
    }));
  }, []);

  const jump = useCallback(() => {
    setGameState(prev => {
      if (prev.canJump) {
        return {
          ...prev,
          snake: {
            ...prev.snake,
            vel: { ...prev.snake.vel, y: JUMP_FORCE }
          },
          canJump: false
        };
      }
      return prev;
    });
  }, []);

  const startGame = useCallback(() => {
    setGameState(prev => ({ ...prev, gameStarted: true }));
  }, []);

  const gameLoop = useCallback(() => {
    setGameState(prev => {
      if (!prev.gameStarted || prev.isLevelComplete || prev.isLevelFailed) return prev;

      let { pos, vel } = prev.snake;
      let canJump = false;

      // Apply gravity
      vel.y += GRAVITY;
      if (vel.y > TERMINAL_VELOCITY) {
        vel.y = TERMINAL_VELOCITY;
      }

      // Proposed new position
      let newX = pos.x + vel.x;
      let newY = pos.y + vel.y;

      // Collision Detection (Simplified AABB vs Grid)
      const checkCollision = (x: number, y: number) => {
        const gridX = Math.floor(x / TILE_SIZE);
        const gridY = Math.floor(y / TILE_SIZE);
        if (gridY < 0 || gridY >= prev.level.tiles.length || gridX < 0 || gridX >= prev.level.tiles[0].length) {
          return TileType.Empty;
        }
        return prev.level.tiles[gridY][gridX].type;
      };

      // Check floor/ceiling
      if (vel.y > 0) { // Falling
        const tileBL = checkCollision(newX, newY + TILE_SIZE);
        const tileBR = checkCollision(newX + TILE_SIZE - 1, newY + TILE_SIZE);
        if (tileBL === TileType.Solid || tileBL === TileType.Platform || tileBR === TileType.Solid || tileBR === TileType.Platform) {
          newY = (Math.floor((newY + TILE_SIZE) / TILE_SIZE)) * TILE_SIZE - TILE_SIZE;
          vel.y = 0;
          canJump = true;
        }
      } else if (vel.y < 0) { // Jumping up
        const tileTL = checkCollision(newX, newY);
        const tileTR = checkCollision(newX + TILE_SIZE - 1, newY);
        if (tileTL === TileType.Solid || tileTR === TileType.Solid) {
          newY = (Math.floor(newY / TILE_SIZE) + 1) * TILE_SIZE;
          vel.y = 0;
        }
      }

      // Check walls
      if (vel.x > 0) { // Moving right
        const tileTR = checkCollision(newX + TILE_SIZE, newY);
        const tileBR = checkCollision(newX + TILE_SIZE, newY + TILE_SIZE - 1);
        if (tileTR === TileType.Solid || tileBR === TileType.Solid) {
          newX = (Math.floor((newX + TILE_SIZE) / TILE_SIZE)) * TILE_SIZE - TILE_SIZE;
          vel.x = 0;
        }
      } else if (vel.x < 0) { // Moving left
        const tileTL = checkCollision(newX, newY);
        const tileBL = checkCollision(newX, newY + TILE_SIZE - 1);
        if (tileTL === TileType.Solid || tileBL === TileType.Solid) {
          newX = (Math.floor(newX / TILE_SIZE) + 1) * TILE_SIZE;
          vel.x = 0;
        }
      }

      // Check Food
      let newFood = [...prev.food];
      const foodIndex = newFood.findIndex(f =>
        Math.abs(f.x - newX) < TILE_SIZE && Math.abs(f.y - newY) < TILE_SIZE
      );
      if (foodIndex !== -1) {
        newFood.splice(foodIndex, 1);
        playSound(440, 0.1, 'square');
        if (navigator.vibrate) navigator.vibrate(50);
      }

      // Check Level Complete
      const isComplete = newFood.length === 0;

      // Check Fall off map
      const isFailed = newY > prev.level.tiles.length * TILE_SIZE;
      if (isFailed && !prev.isLevelFailed) {
        playSound(150, 0.5, 'sawtooth');
        if (navigator.vibrate) navigator.vibrate(200);
      }

      return {
        ...prev,
        snake: { pos: { x: newX, y: newY }, vel },
        food: newFood,
        canJump,
        isLevelComplete: isComplete,
        isLevelFailed: isFailed
      };
    });
  }, []);

  useEffect(() => {
    const loop = setInterval(gameLoop, 1000 / 60); // 60 FPS
    return () => clearInterval(loop);
  }, [gameLoop]);

  const loadCustomLevel = useCallback((level: PhysicsLevel) => {
    setGameState({
      currentLevelIndex: -1,
      level,
      snake: { pos: { x: level.initialSnake[0].x * TILE_SIZE, y: level.initialSnake[0].y * TILE_SIZE }, vel: { x: 0, y: 0 } },
      food: level.foodPositions.map(p => ({ x: p.x * TILE_SIZE, y: p.y * TILE_SIZE })),
      isLevelComplete: false,
      isLevelFailed: false,
      canJump: false,
      gameStarted: false
    });
  }, []);

  return {
    gameState,
    moveHorizontal,
    stopHorizontal,
    jump,
    startGame,
    loadCustomLevel,
    resetLevel: () => setGameState(prev => {
      const level = prev.level;
      return {
        currentLevelIndex: prev.currentLevelIndex,
        level,
        snake: { pos: { x: level.initialSnake[0].x * TILE_SIZE, y: level.initialSnake[0].y * TILE_SIZE }, vel: { x: 0, y: 0 } },
        food: level.foodPositions.map(p => ({ x: p.x * TILE_SIZE, y: p.y * TILE_SIZE })),
        isLevelComplete: false,
        isLevelFailed: false,
        canJump: false,
        gameStarted: false
      }
    })
  };
};
