import React, { useEffect, useRef } from 'react';
import { PhysicsGameState } from '../hooks/usePhysicsGame';
import { TileType } from '../tiles';

interface PhysicsCanvasProps {
  gameState: PhysicsGameState;
}

const PhysicsCanvas: React.FC<PhysicsCanvasProps> = ({ gameState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { level, snake } = gameState;
  const gridSize = 20;
  const canvasSize = level.gridSize * gridSize;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // Draw tiles
    level.tiles.forEach((row, y) => {
      row.forEach((tile, x) => {
        if (tile.type === TileType.Platform) {
          ctx.fillStyle = '#888';
          ctx.fillRect(x * gridSize, y * gridSize, gridSize, gridSize);
        }
      });
    });
    
    // Draw snake
    ctx.fillStyle = '#4ade80';
    ctx.fillRect(snake.pos.x, snake.pos.y, gridSize, gridSize);

  }, [level, snake, canvasSize]);

  return (
    <canvas
      ref={canvasRef}
      width={canvasSize}
      height={canvasSize}
      className="border-2 border-gray-600 rounded-lg"
    />
  );
};

export default PhysicsCanvas;
