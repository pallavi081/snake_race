import { useState, useEffect, useCallback } from 'react';
import { physicsLevels, PhysicsLevel } from '../levels.ts';
import { Position } from '../types/game';
import { TileType } from '../tiles';

const GRAVITY = 0.5;
const TERMINAL_VELOCITY = 10;
const MOVE_SPEED = 5;

interface PhysicsGameState {
  currentLevelIndex: number;
  level: PhysicsLevel;
  snake: { pos: Position, vel: { x: number, y: number } };
  food: Position[];
  isLevelComplete: boolean;
  isLevelFailed: boolean;
}

export const usePhysicsGame = () => {
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [gameState, setGameState] = useState<PhysicsGameState>(() => {
    const level = physicsLevels[currentLevelIndex];
    return {
      currentLevelIndex,
      level,
      snake: { pos: level.initialSnake[0], vel: { x: 0, y: 0 } },
      food: [...level.foodPositions],
      isLevelComplete: false,
      isLevelFailed: false,
    };
  });

  const moveHorizontal = (direction: 'LEFT' | 'RIGHT') => {
    setGameState(prev => ({
      ...prev,
      snake: {
        ...prev.snake,
        vel: { ...prev.snake.vel, x: direction === 'LEFT' ? -MOVE_SPEED : MOVE_SPEED },
      },
    }));
  };

  const gameLoop = useCallback(() => {
    setGameState(prev => {
      let { pos, vel } = prev.snake;

      // Apply gravity
      vel.y += GRAVITY;
      if (vel.y > TERMINAL_VELOCITY) {
        vel.y = TERMINAL_VELOCITY;
      }

      // Update position
      pos.x += vel.x;
      pos.y += vel.y;
      
      // Basic ground collision
      if (pos.y > (prev.level.gridSize * 20) - 20) {
        pos.y = (prev.level.gridSize * 20) - 20;
        vel.y = 0;
      }

      return {
        ...prev,
        snake: { pos, vel },
      };
    });
  }, []);

  useEffect(() => {
    const loop = setInterval(gameLoop, 1000 / 60); // 60 FPS
    return () => clearInterval(loop);
  }, [gameLoop]);

  return {
    gameState,
    moveHorizontal,
  };
};
