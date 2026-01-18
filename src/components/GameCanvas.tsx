import React, { useEffect, useRef } from 'react';
import { GameState, PowerUpType } from '../types/game.ts';
import { GRID_SIZE } from '../utils/gameLogic.ts';

interface GameCanvasProps {
  gameState: GameState;
}

const getPowerUpColor = (type: PowerUpType) => {
  const colors = {
    speed: '#3b82f6',
    slow: '#8b5cf6',
    double: '#f59e0b',
    shrink: '#06b6d4'
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

const GameCanvas: React.FC<GameCanvasProps> = ({ gameState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { canvasWidth, canvasHeight, settings } = gameState;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw grid
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 0.5;
    
    for (let x = 0; x <= canvasWidth; x += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasHeight);
      ctx.stroke();
    }
    
    for (let y = 0; y <= canvasHeight; y += GRID_SIZE) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvasWidth, y);
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
        ctx.fillStyle = settings.snakeHeadColor;
        ctx.shadowColor = settings.snakeHeadColor;
        ctx.shadowBlur = 10;
      } else {
        // Snake body
        ctx.fillStyle = settings.snakeBodyColor;
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
    ctx.fillStyle = settings.foodColor;
    ctx.shadowColor = settings.foodColor;
    ctx.shadowBlur = 15;
    ctx.fillRect(
      gameState.food.x * GRID_SIZE + 2,
      gameState.food.y * GRID_SIZE + 2,
      GRID_SIZE - 4,
      GRID_SIZE - 4
    );
    
    // Draw power-ups
    gameState.powerUps.forEach(powerUp => {
      const color = getPowerUpColor(powerUp.type);
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
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(
        getPowerUpSymbol(powerUp.type),
        powerUp.position.x * GRID_SIZE + GRID_SIZE / 2,
        powerUp.position.y * GRID_SIZE + GRID_SIZE / 2 + 4
      );
    });
    
    ctx.shadowBlur = 0;
  }, [gameState.snake, gameState.food, gameState.powerUps, gameState.particles, canvasWidth, canvasHeight, settings]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        className="border-2 border-gray-600 rounded-lg shadow-lg"
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