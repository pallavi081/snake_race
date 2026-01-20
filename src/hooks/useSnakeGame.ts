import { useState, useEffect, useCallback, useRef } from 'react';
import { useSound } from './useSound';
import { GameState, Direction, Position, PowerUpType, Difficulty, Settings } from '../types/game';
import storage from '../utils/storage';
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
  checkEventItemCollision,
  generateEventItem,
  calculateScore,
  getGameSpeed,
  getOppositeDirection,
  LEVEL_THRESHOLD,
  COMBO_TIME_LIMIT,
  POWER_UP_DURATION,
  GRID_SIZE
} from '../utils/gameLogic';

import { getSkinById, getThemeById } from '../data/skins';
import { checkAchievements, GameEvent } from '../utils/achievementLogic';
import { Achievement } from '../data/achievements';

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
  const player = storage.getPlayer();
  const skin = getSkinById(player.selectedSkin);
  const theme = getThemeById(player.selectedTheme);

  return {
    foodColor: theme.foodColor,
    snakeHeadColor: skin.color,
    snakeBodyColor: skin.color,
    bgColor: theme.bgColor,
    gridColor: theme.gridColor,
    borderColor: theme.borderColor,
  };
};

export const useSnakeGame = (activeEvent: string | null = null) => {
  const [difficulty, setDifficultyState] = useState<Difficulty>('Medium');
  const [unlockedAchievements, setUnlockedAchievements] = useState<Achievement[]>([]);
  const [canvasDimensions, setCanvasDimensions] = useState(getInitialCanvasDimensions());
  const [settings, setSettings] = useState<Settings>(getInitialSettings());
  const [isPaused, setIsPaused] = useState(false);
  const [customObstacles, setCustomObstacles] = useState<Position[]>([]);

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
    eventItems: [],
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

  const loadCustomLevel = useCallback((obstacles: Position[]) => {
    setCustomObstacles(obstacles);
  }, []);

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
      eventItems: [],
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

      // Remove expired power-ups and event items
      const activePowerUps = prevState.powerUps.filter(powerUp => powerUp.expiresAt > currentTime);
      const activeEventItems = prevState.eventItems.filter(item => item.expiresAt > currentTime);

      // Check if active power-up expired
      const activePowerUp = currentTime < prevState.powerUpEndTime ? prevState.activePowerUp : null;

      // Check collisions
      const hitObstacle = customObstacles.some(obs => obs.x === head.x && obs.y === head.y);

      if (checkWallCollision(head, prevState.canvasWidth, prevState.canvasHeight) || checkSelfCollision(newSnake) || hitObstacle) {
        playSound(150, 0.5);
        if (navigator.vibrate) navigator.vibrate(200);

        const newHighScore = Math.max(prevState.score, prevState.highScore);
        if (newHighScore > prevState.highScore) {
          localStorage.setItem(HIGH_SCORE_KEY, newHighScore.toString());
        }

        // Save to storage
        storage.addLeaderboardEntry({
          name: storage.getPlayer().name,
          score: prevState.score,
          level: prevState.level,
          kills: 0, // No kills in classic mode
          mode: 'Classic'
        });

        const player = storage.getPlayer();
        storage.savePlayer({
          totalScore: player.totalScore + prevState.score,
          gamesPlayed: player.gamesPlayed + 1,
          coins: player.coins + Math.floor(prevState.score / 10), // 1 coin per 10 points
          lastPlayDate: new Date().toDateString()
        });

        storage.updateStreak();

        // Check Achievements
        const newAchievements = checkAchievements({
          type: 'GAME_OVER',
          mode: 'classic',
          score: prevState.score,
          level: prevState.level,
          length: newSnake.length
        });

        if (newAchievements.length > 0) {
          setUnlockedAchievements(prev => [...prev, ...newAchievements]);
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

      // Check event item collision
      const collectedEventItem = checkEventItemCollision(head, activeEventItems);
      let newEventItems = activeEventItems;
      let scoreBonus = 0;

      if (collectedEventItem) {
        playSound(1000, 0.3); // High pitched ping
        if (navigator.vibrate) navigator.vibrate([30, 30, 30]);
        newEventItems = activeEventItems.filter(e => e !== collectedEventItem);
        scoreBonus = 50; // Bonus for collecting event items

        // Track collection for achievements (custom event)
        checkAchievements({
          type: 'GAME_OVER', // Using existing types for now, will broaden if needed
          mode: 'classic',
          score: prevState.score + scoreBonus,
          level: prevState.level,
          length: newSnake.length
        });
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

        // Generate new event item occasionally if an event is active
        if (activeEvent) {
          const newEventItem = generateEventItem(finalSnake, newFood, newPowerUps, newEventItems, prevState.canvasWidth, prevState.canvasHeight, activeEvent);
          if (newEventItem) {
            newEventItems.push(newEventItem);
          }
        }

        return {
          ...prevState,
          snake: finalSnake,
          food: newFood,
          score: newScore + scoreBonus,
          level: newLevel,
          speed: getGameSpeed(newLevel, newActivePowerUp, prevState.difficulty),
          powerUps: newPowerUps,
          eventItems: newEventItems,
          activePowerUp: newActivePowerUp,
          powerUpEndTime: newPowerUpEndTime,
          particles: [...updatedParticles, ...createParticles(head.x, head.y, collectedEventItem ? '#fbbf24' : '#22c55e')],
          combo: newCombo,
          lastFoodTime: currentTime
        };
      }

      // Even if food is not collected, we still update eventItems and powerUps
      return {
        ...prevState,
        snake: newSnake,
        powerUps: newPowerUps,
        eventItems: newEventItems,
        score: prevState.score + scoreBonus,
        activePowerUp: newActivePowerUp,
        powerUpEndTime: newPowerUpEndTime,
        particles: updatedParticles,
        speed: getGameSpeed(prevState.level, newActivePowerUp, prevState.difficulty)
      };
    });
  }, [playSound, customObstacles]);

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
    loadCustomLevel,
    unlockedAchievements,
    clearAchievements: () => setUnlockedAchievements([])
  };
}