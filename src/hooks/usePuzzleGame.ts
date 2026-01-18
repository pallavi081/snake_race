import { useState, useEffect, useCallback } from 'react';
import { puzzleLevels, PuzzleLevel } from '../levels.ts';
import { Position, Direction } from '../types/game';
import { getOppositeDirection } from '../utils/gameLogic.ts';

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
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [gameState, setGameState] = useState<PuzzleGameState>(() => {
    const level = puzzleLevels[currentLevelIndex];
    return {
      currentLevelIndex,
      level,
      snake: level.initialSnake,
      food: [...level.foodPositions],
      movesLeft: level.maxMoves,
      isLevelComplete: false,
      isLevelFailed: false,
      direction: 'RIGHT',
    };
  });

  const changeDirection = (newDirection: Direction) => {
    if (getOppositeDirection(gameState.direction) !== newDirection) {
      setGameState(prev => ({ ...prev, direction: newDirection }));
    }
  };

  const moveSnakeAndCheck = useCallback(() => {
    setGameState(prev => {
      if (prev.isLevelComplete || prev.isLevelFailed || prev.movesLeft <= 0) {
        return prev;
      }

      const newSnake = [...prev.snake];
      const head = { ...newSnake[0] };

      switch (prev.direction) {
        case 'UP': head.y -= 1; break;
        case 'DOWN': head.y += 1; break;
        case 'LEFT': head.x -= 1; break;
        case 'RIGHT': head.x += 1; break;
      }

      // Check wall collision
      if (head.x < 0 || head.x >= prev.level.gridSize || head.y < 0 || head.y >= prev.level.gridSize) {
        return { ...prev, isLevelFailed: true };
      }

      // Check obstacle collision
      if (prev.level.obstaclePositions.some(obs => obs.x === head.x && obs.y === head.y)) {
        return { ...prev, isLevelFailed: true };
      }

      // Check self collision
      if (newSnake.some(seg => seg.x === head.x && seg.y === head.y)) {
        return { ...prev, isLevelFailed: true };
      }
      
      newSnake.unshift(head);

      // Check food collision
      const foodIndex = prev.food.findIndex(f => f.x === head.x && f.y === head.y);
      let newFood = [...prev.food];
      if (foodIndex > -1) {
        newFood.splice(foodIndex, 1);
      } else {
        newSnake.pop();
      }

      const isLevelComplete = newFood.length === 0;
      const movesLeft = prev.movesLeft - 1;
      const isLevelFailed = movesLeft <= 0 && !isLevelComplete;

      return {
        ...prev,
        snake: newSnake,
        food: newFood,
        movesLeft,
        isLevelComplete,
        isLevelFailed,
      };
    });
  }, []);

  const restartLevel = useCallback(() => {
    setGameState(() => {
      const level = puzzleLevels[currentLevelIndex];
      return {
        currentLevelIndex,
        level,
        snake: level.initialSnake,
        food: [...level.foodPositions],
        movesLeft: level.maxMoves,
        isLevelComplete: false,
        isLevelFailed: false,
        direction: 'RIGHT',
      };
    });
  }, [currentLevelIndex]);

  const goToNextLevel = useCallback(() => {
    const nextLevelIndex = currentLevelIndex + 1;
    if (nextLevelIndex < puzzleLevels.length) {
      setCurrentLevelIndex(nextLevelIndex);
      setGameState(() => {
        const level = puzzleLevels[nextLevelIndex];
        return {
          currentLevelIndex: nextLevelIndex,
          level,
          snake: level.initialSnake,
          food: [...level.foodPositions],
          movesLeft: level.maxMoves,
          isLevelComplete: false,
          isLevelFailed: false,
          direction: 'RIGHT',
        };
      });
    } else {
      // All levels complete
      setGameState(prev => ({...prev, isLevelComplete: true}));
    }
  }, [currentLevelIndex]);
  
  // This hook is for keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp': e.preventDefault(); changeDirection('UP'); moveSnakeAndCheck(); break;
        case 'ArrowDown': e.preventDefault(); changeDirection('DOWN'); moveSnakeAndCheck(); break;
        case 'ArrowLeft': e.preventDefault(); changeDirection('LEFT'); moveSnakeAndCheck(); break;
        case 'ArrowRight': e.preventDefault(); changeDirection('RIGHT'); moveSnakeAndCheck(); break;
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [changeDirection, moveSnakeAndCheck]);

  return {
    gameState,
    changeDirection,
    moveSnakeAndCheck,
    restartLevel,
    goToNextLevel,
  };
};
