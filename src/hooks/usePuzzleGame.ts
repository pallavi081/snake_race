import { useState, useEffect, useCallback } from 'react';
import { useSound } from './useSound';
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
  history: Omit<PuzzleGameState, 'history'>[];
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
      history: [],
    };
  });

  const { playSound } = useSound();

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

      // Create snapshot for history (excluding history itself)
      const { history, ...currentState } = prev;
      const newHistory = [...history, currentState];

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
        playSound(150, 0.3, 'sawtooth');
        if (navigator.vibrate) navigator.vibrate(200);
        return { ...prev, isLevelFailed: true };
      }

      // Check obstacle collision
      if (prev.level.obstaclePositions.some(obs => obs.x === head.x && obs.y === head.y)) {
        playSound(150, 0.3, 'sawtooth');
        if (navigator.vibrate) navigator.vibrate(200);
        return { ...prev, isLevelFailed: true };
      }

      // Check self collision
      if (newSnake.some(seg => seg.x === head.x && seg.y === head.y)) {
        playSound(150, 0.3, 'sawtooth');
        if (navigator.vibrate) navigator.vibrate(200);
        return { ...prev, isLevelFailed: true };
      }
      
      newSnake.unshift(head);

      // Check food collision
      const foodIndex = prev.food.findIndex(f => f.x === head.x && f.y === head.y);
      let newFood = [...prev.food];
      if (foodIndex > -1) {
        newFood.splice(foodIndex, 1);
        playSound(440, 0.1, 'square');
        if (navigator.vibrate) navigator.vibrate(50);
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
        history: newHistory,
      };
    });
  }, []);

  const undo = useCallback(() => {
    setGameState(prev => {
      if (prev.history.length === 0 || prev.isLevelComplete || prev.isLevelFailed) return prev;
      
      const previousState = prev.history[prev.history.length - 1];
      const newHistory = prev.history.slice(0, -1);
      
      return { ...previousState, history: newHistory };
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
        history: [],
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
          history: [],
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
        case 'Backspace': case 'z': e.preventDefault(); undo(); break;
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
    undo,
  };
};
