import { useState, useCallback } from 'react';
import { useSound } from '../hooks/useSound';
import { puzzleLevels, PuzzleLevel } from '../levels';
import { Position, Direction } from '../types/game';

interface PuzzleGameState {
  currentLevelIndex: number;
  level: PuzzleLevel;
  snake: Position[];
  food: Position[];
  movesLeft: number;
  isLevelComplete: boolean;
  isLevelFailed: boolean;
  direction: Direction;
}

export const usePuzzleGame = () => {
  const [gameState, setGameState] = useState<PuzzleGameState>(() => {
    const level = puzzleLevels[0];
    return {
      currentLevelIndex: 0,
      level,
      snake: [...level.initialSnake],
      food: [...level.foodPositions],
      movesLeft: level.maxMoves,
      isLevelComplete: false,
      isLevelFailed: false,
      direction: 'RIGHT'
    };
  });

  const { playSound } = useSound();

  const changeDirection = useCallback((newDirection: Direction) => {
    setGameState(prev => {
      // Prevent 180 degree turns
      const isOpposite = 
        (newDirection === 'UP' && prev.direction === 'DOWN') ||
        (newDirection === 'DOWN' && prev.direction === 'UP') ||
        (newDirection === 'LEFT' && prev.direction === 'RIGHT') ||
        (newDirection === 'RIGHT' && prev.direction === 'LEFT');
      
      if (isOpposite) return prev;
      return { ...prev, direction: newDirection };
    });
  }, []);

  const moveSnakeAndCheck = useCallback(() => {
    setGameState(prev => {
      if (prev.isLevelComplete || prev.isLevelFailed) return prev;
      if (prev.movesLeft <= 0) return { ...prev, isLevelFailed: true };

      const head = { ...prev.snake[0] };
      switch (prev.direction) {
        case 'UP': head.y -= 1; break;
        case 'DOWN': head.y += 1; break;
        case 'LEFT': head.x -= 1; break;
        case 'RIGHT': head.x += 1; break;
      }

      // Check bounds
      if (head.x < 0 || head.x >= prev.level.gridSize || head.y < 0 || head.y >= prev.level.gridSize) {
        playSound(150, 0.3, 'sawtooth');
        return { ...prev, isLevelFailed: true, movesLeft: prev.movesLeft - 1 };
      }

      // Check obstacles
      if (prev.level.obstaclePositions.some(obs => obs.x === head.x && obs.y === head.y)) {
        playSound(150, 0.3, 'sawtooth');
        return { ...prev, isLevelFailed: true, movesLeft: prev.movesLeft - 1 };
      }

      // Check self collision
      if (prev.snake.some(seg => seg.x === head.x && seg.y === head.y)) {
        playSound(150, 0.3, 'sawtooth');
        return { ...prev, isLevelFailed: true, movesLeft: prev.movesLeft - 1 };
      }

      const newSnake = [head, ...prev.snake];
      let newFood = [...prev.food];
      let foodEaten = false;

      // Check food
      const foodIndex = newFood.findIndex(f => f.x === head.x && f.y === head.y);
      if (foodIndex !== -1) {
        playSound(440, 0.1, 'square');
        newFood.splice(foodIndex, 1);
        foodEaten = true;
      } else {
        newSnake.pop();
      }

      const isComplete = newFood.length === 0;
      const isFailed = !isComplete && prev.movesLeft - 1 === 0;

      return {
        ...prev,
        snake: newSnake,
        food: newFood,
        movesLeft: prev.movesLeft - 1,
        isLevelComplete: isComplete,
        isLevelFailed: isFailed
      };
    });
  }, []);

  const restartLevel = useCallback(() => {
    setGameState(prev => {
      const level = puzzleLevels[prev.currentLevelIndex];
      return {
        ...prev,
        level,
        snake: [...level.initialSnake],
        food: [...level.foodPositions],
        movesLeft: level.maxMoves,
        isLevelComplete: false,
        isLevelFailed: false,
        direction: 'RIGHT'
      };
    });
  }, []);

  const goToNextLevel = useCallback(() => {
    setGameState(prev => {
      const nextIndex = (prev.currentLevelIndex + 1) % puzzleLevels.length;
      const level = puzzleLevels[nextIndex];
      return {
        currentLevelIndex: nextIndex,
        level,
        snake: [...level.initialSnake],
        food: [...level.foodPositions],
        movesLeft: level.maxMoves,
        isLevelComplete: false,
        isLevelFailed: false,
        direction: 'RIGHT'
      };
    });
  }, []);

  return {
    gameState,
    changeDirection,
    moveSnakeAndCheck,
    restartLevel,
    goToNextLevel
  };
};