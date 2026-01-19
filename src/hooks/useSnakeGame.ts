import { useState, useEffect, useCallback, useRef } from 'react';
import { useSound } from './useSound';
import { GameState, Direction, Position, PowerUpType, Difficulty, Settings } from '../types/game.ts';
import {
  INITIAL_SNAKE,
  generateFood,
  generatePowerUp,
  createParticles,
  updateParticles,
  moveSnake,
  checkWallCollision,
  checkSelfCollision,
  checkFoodCollision,
  checkPowerUpCollision,
  calculateScore,
  getGameSpeed,
  getOppositeDirection,
  LEVEL_THRESHOLD,
  COMBO_TIME_LIMIT,
  POWER_UP_DURATION,
  GRID_SIZE
} from '../utils/gameLogic.ts';

const HIGH_SCORE_KEY = 'snake-high-score';
const SETTINGS_KEY = 'snake-settings';

const getInitialCanvasDimensions = () => {
  const isMobile = window.innerWidth < 768;
  const size = isMobile ? window.innerWidth * 0.9 : 400;
  return {
    width: Math.floor(size / GRID_SIZE) * GRID_SIZE,
    height: Math.floor(size / GRID_SIZE) * GRID_SIZE,
  };
};

const getInitialSettings = (): Settings => {
  const savedSettings = localStorage.getItem(SETTINGS_KEY);
  if (savedSettings) {
    return JSON.parse(savedSettings);
  }
  return {
    foodColor: '#ef4444',
    snakeHeadColor: '#4ade80',
    snakeBodyColor: '#22c55e',
  };
};

export const useSnakeGame = () => {
  const [difficulty, setDifficultyState] = useState<Difficulty>('Medium');
  const [canvasDimensions, setCanvasDimensions] = useState(getInitialCanvasDimensions());
  const [settings, setSettings] = useState<Settings>(getInitialSettings());
  const [isPaused, setIsPaused] = useState(false);

  const [gameState, setGameState] = useState<GameState>({
    snake: INITIAL_SNAKE,
    food: generateFood(INITIAL_SNAKE, canvasDimensions.width, canvasDimensions.height),
    direction: 'RIGHT',
    score: 0,
    gameOver: false,
    gameStarted: false,
    highScore: parseInt(localStorage.getItem(HIGH_SCORE_KEY) || '0'),
    level: 1,
    speed: getGameSpeed(1, null, difficulty),
    powerUps: [],
    activePowerUp: null,
    powerUpEndTime: 0,
    particles: [],
    combo: 0,
    lastFoodTime: 0,
    difficulty: difficulty,
    canvasWidth: canvasDimensions.width,
    canvasHeight: canvasDimensions.height,
    settings: settings,
  });

  useEffect(() => {
    const handleResize = () => {
      setCanvasDimensions(getInitialCanvasDimensions());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const setDifficulty = (newDifficulty: Difficulty) => {
    setDifficultyState(newDifficulty);
    setGameState(prev => ({
      ...prev,
      difficulty: newDifficulty,
      speed: getGameSpeed(prev.level, prev.activePowerUp, newDifficulty)
    }));
  };

  const updateSettings = (newSettings: Settings) => {
    setSettings(newSettings);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
    setGameState(prev => ({
      ...prev,
      settings: newSettings,
    }));
  };

  const { soundEnabled, toggleSound, playSound } = useSound();

  const gameLoopRef = useRef<NodeJS.Timeout>();
  const directionRef = useRef<Direction>('RIGHT');

  const togglePause = useCallback(() => {
    if (gameState.gameStarted && !gameState.gameOver) {
      setIsPaused(prev => !prev);
    }
  }, [gameState.gameStarted, gameState.gameOver]);

  const resetGame = useCallback(() => {
    const initialSnake = INITIAL_SNAKE;
    setGameState({
      snake: initialSnake,
      food: generateFood(initialSnake, canvasDimensions.width, canvasDimensions.height),
      direction: 'RIGHT',
      score: 0,
      gameOver: false,
      gameStarted: false,
      highScore: parseInt(localStorage.getItem(HIGH_SCORE_KEY) || '0'),
      level: 1,
      speed: getGameSpeed(1, null, difficulty),
      powerUps: [],
      activePowerUp: null,
      powerUpEndTime: 0,
      particles: [],
      combo: 0,
      lastFoodTime: 0,
      difficulty: difficulty,
      canvasWidth: canvasDimensions.width,
      canvasHeight: canvasDimensions.height,
      settings: settings,
    });
    directionRef.current = 'RIGHT';
    setIsPaused(false);
  }, [difficulty, canvasDimensions, settings]);

  const startGame = useCallback(() => {
    setGameState(prev => ({ ...prev, gameStarted: true }));
    setIsPaused(false);
  }, []);

  const changeDirection = useCallback((newDirection: Direction) => {
    if (getOppositeDirection(directionRef.current) !== newDirection) {
      directionRef.current = newDirection;
      setGameState(prev => ({ ...prev, direction: newDirection }));
    }
  }, []);

  const gameLoop = useCallback(() => {
    setGameState(prevState => {
      if (prevState.gameOver || !prevState.gameStarted) {
        return prevState;
      }

      const newSnake = moveSnake(prevState.snake, directionRef.current);
      const head = newSnake[0];
      const currentTime = Date.now();
      
      // Update particles
      const updatedParticles = updateParticles(prevState.particles);
      
      // Remove expired power-ups
      const activePowerUps = prevState.powerUps.filter(powerUp => powerUp.expiresAt > currentTime);
      
      // Check if active power-up expired
      const activePowerUp = currentTime < prevState.powerUpEndTime ? prevState.activePowerUp : null;

      // Check collisions
      if (checkWallCollision(head, prevState.canvasWidth, prevState.canvasHeight) || checkSelfCollision(newSnake)) {
        playSound(150, 0.5);
        if (navigator.vibrate) navigator.vibrate(200);
        const newHighScore = Math.max(prevState.score, prevState.highScore);
        if (newHighScore > prevState.highScore) {
          localStorage.setItem(HIGH_SCORE_KEY, newHighScore.toString());
        }
        return {
          ...prevState,
          gameOver: true,
          highScore: newHighScore,
          particles: [...updatedParticles, ...createParticles(head.x, head.y, '#ef4444')]
        };
      }
      
      // Check power-up collision
      const collectedPowerUp = checkPowerUpCollision(head, activePowerUps);
      let newActivePowerUp = activePowerUp;
      let newPowerUpEndTime = prevState.powerUpEndTime;
      let newPowerUps = activePowerUps;
      
      if (collectedPowerUp) {
        playSound(800, 0.2);
        newActivePowerUp = collectedPowerUp.type;
        newPowerUpEndTime = currentTime + POWER_UP_DURATION;
        newPowerUps = activePowerUps.filter(p => p !== collectedPowerUp);
      }

      // Check food collision
      if (checkFoodCollision(head, prevState.food)) {
        playSound(440, 0.1);
        if (navigator.vibrate) navigator.vibrate(50);
        
        // Calculate combo
        const timeSinceLastFood = currentTime - prevState.lastFoodTime;
        const newCombo = timeSinceLastFood < COMBO_TIME_LIMIT ? prevState.combo + 1 : 1;
        
        // Calculate score with combo and level multipliers
        const baseScore = newActivePowerUp === 'double' ? 20 : 10;
        const scoreIncrease = calculateScore(baseScore, newCombo, prevState.level);
        const newScore = prevState.score + scoreIncrease;
        
        // Calculate level
        const newLevel = Math.floor(newScore / LEVEL_THRESHOLD) + 1;
        
        const grownSnake = [...newSnake, newSnake[newSnake.length - 1]];
        const newFood = generateFood(grownSnake, prevState.canvasWidth, prevState.canvasHeight);
        
        // Handle shrink power-up
        let finalSnake = grownSnake;
        if (newActivePowerUp === 'shrink' && grownSnake.length > 3) {
          finalSnake = grownSnake.slice(0, -2); // Remove 2 segments instead of growing
        }
        
        // Generate new power-up occasionally
        const newPowerUp = generatePowerUp(finalSnake, newFood, prevState.canvasWidth, prevState.canvasHeight);
        if (newPowerUp) {
          newPowerUps.push(newPowerUp);
        }
        
        return {
          ...prevState,
          snake: finalSnake,
          food: newFood,
          score: newScore,
          level: newLevel,
          speed: getGameSpeed(newLevel, newActivePowerUp, prevState.difficulty),
          powerUps: newPowerUps,
          activePowerUp: newActivePowerUp,
          powerUpEndTime: newPowerUpEndTime,
          particles: [...updatedParticles, ...createParticles(head.x, head.y, '#22c55e')],
          combo: newCombo,
          lastFoodTime: currentTime
        };
      }

      return {
        ...prevState,
        snake: newSnake,
        powerUps: newPowerUps,
        activePowerUp: newActivePowerUp,
        powerUpEndTime: newPowerUpEndTime,
        particles: updatedParticles,
        speed: getGameSpeed(prevState.level, newActivePowerUp, prevState.difficulty)
      };
    });
  }, [playSound]);

  useEffect(() => {
    if (gameState.gameStarted && !gameState.gameOver && !isPaused) {
      gameLoopRef.current = setInterval(gameLoop, gameState.speed);
    } else {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    }

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameLoop, gameState.gameStarted, gameState.gameOver, gameState.speed, isPaused]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameState.gameStarted && !gameState.gameOver && e.code === 'Space') {
        startGame();
        return;
      }

      if (gameState.gameOver && e.code === 'Space') {
        resetGame();
        return;
      }

      if (!gameState.gameStarted || gameState.gameOver) return;

      if (e.code === 'Escape' || e.code === 'KeyP') {
        togglePause();
        return;
      }

      if (!isPaused) switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          changeDirection('UP');
          break;
        case 'ArrowDown':
          e.preventDefault();
          changeDirection('DOWN');
          break;
        case 'ArrowLeft':
          e.preventDefault();
          changeDirection('LEFT');
          break;
        case 'ArrowRight':
          e.preventDefault();
          changeDirection('RIGHT');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState.gameStarted, gameState.gameOver, changeDirection, startGame, resetGame, isPaused, togglePause]);

  return {
    gameState,
    startGame,
    resetGame,
    changeDirection,
    soundEnabled,
    toggleSound,
    difficulty,
    setDifficulty,
    settings,
    updateSettings,
    isPaused,
    togglePause,
  };
}