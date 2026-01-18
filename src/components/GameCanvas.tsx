import React, { useEffect, useRef } from 'react';
<<<<<<< HEAD
import { GameState, PowerUpType } from '../types/game.ts';
import { GRID_SIZE, CANVAS_WIDTH, CANVAS_HEIGHT } from '../utils/gameLogic.ts';
=======
import { GameState, PowerUpType } from '../types/game';
import { GRID_SIZE, CANVAS_WIDTH, CANVAS_HEIGHT } from '../utils/gameLogic';
>>>>>>> a0b0b786f9f3ca227ce67875933ce8a530515cbb

interface GameCanvasProps {
  gameState: GameState;
  isDarkMode: boolean;
}

const getPowerUpColor = (type: PowerUpType, isDarkMode: boolean) => {
  const colors = {
    speed: isDarkMode ? '#3b82f6' : '#2563eb',
    slow: isDarkMode ? '#8b5cf6' : '#7c3aed',
    double: isDarkMode ? '#f59e0b' : '#d97706',
    shrink: isDarkMode ? '#06b6d4' : '#0891b2'
  };
  return colors[type];
};

const getPowerUpSymbol = (type: PowerUpType) => {
  const symbols = {
    speed: '⚡',
    slow: '🐌',
    double: '2x',
    shrink: '↓'
  };
  return symbols[type];
};

const GameCanvas: React.FC<GameCanvasProps> = ({ gameState, isDarkMode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = isDarkMode ? '#1a1a1a' : '#f8f9fa';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw grid
    ctx.strokeStyle = isDarkMode ? '#333' : '#e0e0e0';
    ctx.lineWidth = 0.5;
    
    for (let x = 0; x <= CANVAS_WIDTH; x += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_HEIGHT);
      ctx.stroke();
    }
    
    for (let y = 0; y <= CANVAS_HEIGHT; y += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }

    // Draw particles
    gameState.particles.forEach(particle => {
      const alpha = particle.life / particle.maxLife;
      ctx.fillStyle = particle.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
      ctx.fillRect(particle.x - 1, particle.y - 1, 2, 2);
    });

    // Draw snake
    gameState.snake.forEach((segment, index) => {
      if (index === 0) {
        // Snake head
        ctx.fillStyle = isDarkMode ? '#4ade80' : '#22c55e';
        ctx.shadowColor = isDarkMode ? '#4ade80' : '#22c55e';
        ctx.shadowBlur = 10;
      } else {
        // Snake body
        const intensity = 1 - (index / gameState.snake.length) * 0.3;
        ctx.fillStyle = isDarkMode ? 
          `rgba(34, 197, 94, ${intensity})` : 
          `rgba(21, 128, 61, ${intensity})`;
        ctx.shadowBlur = 0;
      }
      
      ctx.fillRect(
        segment.x * GRID_SIZE + 1,
        segment.y * GRID_SIZE + 1,
        GRID_SIZE - 2,
        GRID_SIZE - 2
      );
    });

    // Draw food
    ctx.fillStyle = isDarkMode ? '#ef4444' : '#dc2626';
    ctx.shadowColor = isDarkMode ? '#ef4444' : '#dc2626';
    ctx.shadowBlur = 15;
    ctx.fillRect(
      gameState.food.x * GRID_SIZE + 2,
      gameState.food.y * GRID_SIZE + 2,
      GRID_SIZE - 4,
      GRID_SIZE - 4
    );
    
    // Draw power-ups
    gameState.powerUps.forEach(powerUp => {
      const color = getPowerUpColor(powerUp.type, isDarkMode);
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
      
      // Draw power-up background
      ctx.fillRect(
        powerUp.position.x * GRID_SIZE + 1,
        powerUp.position.y * GRID_SIZE + 1,
        GRID_SIZE - 2,
        GRID_SIZE - 2
      );
      
      // Draw power-up symbol
      ctx.shadowBlur = 0;
      ctx.fillStyle = isDarkMode ? '#ffffff' : '#000000';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(
        getPowerUpSymbol(powerUp.type),
        powerUp.position.x * GRID_SIZE + GRID_SIZE / 2,
        powerUp.position.y * GRID_SIZE + GRID_SIZE / 2 + 4
      );
    });
    
    ctx.shadowBlur = 0;
  }, [gameState.snake, gameState.food, gameState.powerUps, gameState.particles, isDarkMode]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="border-2 border-gray-300 dark:border-gray-600 rounded-lg shadow-lg"
        style={{ imageRendering: 'pixelated' }}
      />
      
      {!gameState.gameStarted && !gameState.gameOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 rounded-lg">
          <p className="text-white text-xl font-bold mb-2">Snake Game</p>
          <p className="text-white text-sm">Press SPACE to start</p>
        </div>
      )}
      
      {gameState.gameOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 rounded-lg">
          <p className="text-white text-2xl font-bold mb-2">Game Over!</p>
          <p className="text-white text-lg mb-2">Score: {gameState.score}</p>
          <p className="text-white text-md mb-2">Level: {gameState.level}</p>
          <p className="text-white text-sm">Press SPACE to restart</p>
        </div>
      )}
      
      {/* Active Power-up Indicator */}
      {gameState.activePowerUp && (
        <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
          {getPowerUpSymbol(gameState.activePowerUp)} Active
        </div>
      )}
    </div>
  );
};

export default GameCanvas;