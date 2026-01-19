import React, { useEffect, useRef, useState } from 'react';
import { BattleGameState, PowerUpType } from './useBattleGame';
import { Theme } from '../data/skins';

interface BattleCanvasProps {
  gameState: BattleGameState;
  theme: Theme;
}

const POWER_UP_COLORS: Record<PowerUpType, string> = {
  speed: '#22d3ee',
  shield: '#a855f7',
  doubleXp: '#fbbf24',
  magnet: '#ec4899',
  bomb: '#ef4444'
};

const POWER_UP_ICONS: Record<PowerUpType, string> = {
  speed: '⚡',
  shield: '🛡️',
  doubleXp: '2X',
  magnet: '🧲',
  bomb: '💣'
};

const BattleCanvas: React.FC<BattleCanvasProps> = ({ gameState, theme }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const minimapRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gridSize = 20;

  // Viewport settings - show only area around player
  const [viewportSize, setViewportSize] = useState({ width: 400, height: 300 });

  // Responsive viewport - fill as much screen as possible
  useEffect(() => {
    const updateViewport = () => {
      const width = Math.min(window.innerWidth - 16, 800);
      const height = Math.min(window.innerHeight * 0.65, 600);
      setViewportSize({ width, height });
    };
    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  // Minimap settings
  const MINIMAP_SIZE = 100;
  const minimapScale = MINIMAP_SIZE / Math.max(gameState.canvasWidth, gameState.canvasHeight);

  const mySnake = gameState.snakes.find(s => s.id === gameState.myId);

  // Main Canvas - Viewport following player
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate camera position (center on player)
    let cameraX = 0;
    let cameraY = 0;

    if (mySnake && !mySnake.isDead) {
      const head = mySnake.body[0];
      cameraX = head.x * gridSize - viewportSize.width / 2;
      cameraY = head.y * gridSize - viewportSize.height / 2;

      // Clamp camera to map bounds
      cameraX = Math.max(0, Math.min(cameraX, gameState.canvasWidth - viewportSize.width));
      cameraY = Math.max(0, Math.min(cameraY, gameState.canvasHeight - viewportSize.height));
    }

    // Clear
    ctx.fillStyle = theme.bgColor;
    ctx.fillRect(0, 0, viewportSize.width, viewportSize.height);

    // Save context and translate for camera
    ctx.save();
    ctx.translate(-cameraX, -cameraY);

    // Grid
    ctx.strokeStyle = theme.gridColor;
    ctx.lineWidth = 1;
    for (let i = 0; i <= gameState.canvasWidth; i += gridSize) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, gameState.canvasHeight); ctx.stroke();
    }
    for (let i = 0; i <= gameState.canvasHeight; i += gridSize) {
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(gameState.canvasWidth, i); ctx.stroke();
    }

    // Map border
    ctx.strokeStyle = theme.borderColor;
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, gameState.canvasWidth, gameState.canvasHeight);

    // Power-ups
    gameState.powerUps.forEach(powerUp => {
      const x = powerUp.position.x * gridSize;
      const y = powerUp.position.y * gridSize;

      ctx.shadowColor = POWER_UP_COLORS[powerUp.type];
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(x + gridSize / 2, y + gridSize / 2, gridSize / 2, 0, Math.PI * 2);
      ctx.fillStyle = POWER_UP_COLORS[powerUp.type];
      ctx.fill();

      ctx.shadowBlur = 0;
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(POWER_UP_ICONS[powerUp.type], x + gridSize / 2, y + gridSize / 2);
    });
    ctx.shadowBlur = 0;

    // Food
    ctx.fillStyle = '#fbbf24';
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 8;
    gameState.foods.forEach(food => {
      ctx.beginPath();
      ctx.arc(food.x * gridSize + gridSize / 2, food.y * gridSize + gridSize / 2, gridSize / 3, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.shadowBlur = 0;

    // Snakes
    gameState.snakes.forEach(snake => {
      if (snake.isDead) return;

      ctx.fillStyle = snake.color;
      snake.body.forEach((seg, idx) => {
        if (idx === 0) {
          ctx.shadowColor = snake.color;
          ctx.shadowBlur = 10;
        } else {
          ctx.shadowBlur = 0;
        }
        const radius = idx === 0 ? gridSize / 2 : gridSize / 2 - 2;
        ctx.beginPath();
        ctx.arc(seg.x * gridSize + gridSize / 2, seg.y * gridSize + gridSize / 2, radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Shield indicator
      const head = snake.body[0];
      if (snake.shield) {
        ctx.strokeStyle = '#a855f7';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(head.x * gridSize + gridSize / 2, head.y * gridSize + gridSize / 2, gridSize / 2 + 5, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Name tag
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 11px Arial';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000';
      ctx.shadowBlur = 3;
      ctx.fillText(`${snake.name}`, head.x * gridSize + gridSize / 2, head.y * gridSize - 10);
      ctx.font = '9px Arial';
      ctx.fillStyle = '#fbbf24';
      ctx.fillText(`Lv.${snake.level}`, head.x * gridSize + gridSize / 2, head.y * gridSize - 22);
      ctx.shadowBlur = 0;
    });

    ctx.restore();

  }, [gameState, viewportSize, mySnake]);

  // Minimap
  useEffect(() => {
    const minimap = minimapRef.current;
    if (!minimap) return;
    const ctx = minimap.getContext('2d');
    if (!ctx) return;

    const mapW = gameState.canvasWidth * minimapScale;
    const mapH = gameState.canvasHeight * minimapScale;

    // Background
    ctx.fillStyle = '#0a0f1a';
    ctx.fillRect(0, 0, MINIMAP_SIZE, MINIMAP_SIZE);

    // Center the map
    const offsetX = (MINIMAP_SIZE - mapW) / 2;
    const offsetY = (MINIMAP_SIZE - mapH) / 2;

    // Map border
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 1;
    ctx.strokeRect(offsetX, offsetY, mapW, mapH);

    // Food
    ctx.fillStyle = '#fbbf2480';
    gameState.foods.forEach(food => {
      const x = offsetX + food.x * gridSize * minimapScale;
      const y = offsetY + food.y * gridSize * minimapScale;
      ctx.fillRect(x, y, 2, 2);
    });

    // Power-ups
    gameState.powerUps.forEach(powerUp => {
      ctx.fillStyle = POWER_UP_COLORS[powerUp.type];
      const x = offsetX + powerUp.position.x * gridSize * minimapScale;
      const y = offsetY + powerUp.position.y * gridSize * minimapScale;
      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fill();
    });

    // Snakes
    gameState.snakes.forEach(snake => {
      if (snake.isDead) return;
      ctx.fillStyle = snake.color;

      // Draw snake as line
      snake.body.forEach((seg, idx) => {
        const x = offsetX + seg.x * gridSize * minimapScale;
        const y = offsetY + seg.y * gridSize * minimapScale;
        const size = idx === 0 ? 4 : 2;
        ctx.fillRect(x - size / 2, y - size / 2, size, size);
      });

      // Highlight player with pulsing circle
      if (snake.id === gameState.myId) {
        const head = snake.body[0];
        const x = offsetX + head.x * gridSize * minimapScale;
        const y = offsetY + head.y * gridSize * minimapScale;
        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.stroke();
      }
    });

    // Viewport indicator
    if (mySnake && !mySnake.isDead) {
      const head = mySnake.body[0];
      let camX = head.x * gridSize - viewportSize.width / 2;
      let camY = head.y * gridSize - viewportSize.height / 2;
      camX = Math.max(0, Math.min(camX, gameState.canvasWidth - viewportSize.width));
      camY = Math.max(0, Math.min(camY, gameState.canvasHeight - viewportSize.height));

      ctx.strokeStyle = '#ffffff60';
      ctx.lineWidth = 1;
      ctx.strokeRect(
        offsetX + camX * minimapScale,
        offsetY + camY * minimapScale,
        viewportSize.width * minimapScale,
        viewportSize.height * minimapScale
      );
    }

  }, [gameState, minimapScale, viewportSize, mySnake]);

  return (
    <div className="flex flex-col items-center w-full" ref={containerRef}>
      {/* Main viewport canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={viewportSize.width}
          height={viewportSize.height}
          className="border-2 border-gray-600 rounded-lg shadow-2xl"
        />

        {/* Minimap overlay */}
        <div className="absolute top-2 right-2 bg-black/90 p-1 rounded-lg border border-blue-500">
          <canvas
            ref={minimapRef}
            width={MINIMAP_SIZE}
            height={MINIMAP_SIZE}
            className="block rounded"
          />
          <div className="text-[7px] text-center text-gray-400 mt-0.5">
            <span className="text-green-400">●</span>You
            <span className="text-yellow-400 ml-1">●</span>Food
          </div>
        </div>

        {/* Alive counter */}
        <div className="absolute top-2 left-2 bg-black/80 px-2 py-1 rounded text-xs text-white">
          🏆 {gameState.snakes.filter(s => !s.isDead).length}/{gameState.snakes.length}
        </div>
      </div>

      {/* Active power-ups */}
      {mySnake && (mySnake.shield || mySnake.speedBoost || mySnake.doubleXp) && (
        <div className="flex gap-2 mt-2 text-xs">
          {mySnake.shield && <span className="bg-purple-600/80 px-2 py-0.5 rounded">🛡️ Shield</span>}
          {mySnake.speedBoost && <span className="bg-cyan-600/80 px-2 py-0.5 rounded">⚡ Speed</span>}
          {mySnake.doubleXp && <span className="bg-yellow-600/80 px-2 py-0.5 rounded">2X XP</span>}
        </div>
      )}
    </div>
  );
};

export default BattleCanvas;