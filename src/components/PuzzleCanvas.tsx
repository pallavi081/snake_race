import React, { useEffect, useRef } from 'react';
import { PuzzleLevel } from '../levels';
import { Position } from '../types/game';

interface PuzzleCanvasProps {
  level: PuzzleLevel;
  snake: Position[];
  food: Position[];
}

const PuzzleCanvas: React.FC<PuzzleCanvasProps> = ({ level, snake, food }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { gridSize } = level;
  const canvasSize = gridSize * 20; // 20 is the size of each grid cell

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // Draw grid
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 0.5;
    for (let x = 0; x <= canvasSize; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvasSize);
      ctx.stroke();
    }
    for (let y = 0; y <= canvasSize; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvasSize, y);
      ctx.stroke();
    }

    // Draw obstacles
    ctx.fillStyle = '#555';
    level.obstaclePositions.forEach(obs => {
      ctx.fillRect(obs.x * 20, obs.y * 20, 20, 20);
    });

    // Draw food
    ctx.fillStyle = '#ef4444';
    food.forEach(f => {
      ctx.fillRect(f.x * 20 + 2, f.y * 20 + 2, 16, 16);
    });

    // Draw snake
    snake.forEach((segment, index) => {
      ctx.fillStyle = index === 0 ? '#4ade80' : '#22c55e';
      ctx.fillRect(segment.x * 20 + 1, segment.y * 20 + 1, 18, 18);
    });

  }, [level, snake, food, canvasSize]);

  return (
    <canvas
      ref={canvasRef}
      width={canvasSize}
      height={canvasSize}
      className="border-2 border-gray-600 rounded-lg max-w-full h-auto shadow-2xl"
    />
  );
};

export default PuzzleCanvas;
