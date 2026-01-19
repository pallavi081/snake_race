import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, RefreshCw, Play, HelpCircle } from 'lucide-react';
import { usePhysicsGame } from '../hooks/usePhysicsGame';
import PhysicsInstructions from './PhysicsInstructions';

interface PhysicsGameProps {
  onBack: () => void;
}

const PhysicsGame: React.FC<PhysicsGameProps> = ({ onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [showInstructions, setShowInstructions] = useState(false);
  
  const { gameState, startGame, resetGame, jump, moveHorizontal, stopHorizontal } = usePhysicsGame(dimensions.width, dimensions.height);

  // Handle Resize for Mobile Fullscreen
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Keyboard Controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') jump();
      if (e.code === 'ArrowLeft') moveHorizontal('LEFT');
      if (e.code === 'ArrowRight') moveHorizontal('RIGHT');
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'ArrowRight') stopHorizontal();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [jump, moveHorizontal, stopHorizontal]);

  // Rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.fillStyle = '#111827'; // Dark bg
    ctx.fillRect(0, 0, dimensions.width, dimensions.height);

    // Draw Platforms
    ctx.fillStyle = '#4b5563';
    gameState.platforms.forEach(p => {
      ctx.fillRect(p.x, p.y, p.width, p.height);
    });

    // Draw Food
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(gameState.food.x, gameState.food.y, 10, 0, Math.PI * 2);
    ctx.fill();

    // Draw Snake Body
    ctx.fillStyle = '#22c55e';
    gameState.snakeBody.forEach(seg => {
      ctx.fillRect(seg.x, seg.y, 20, 20);
    });

    // Draw Snake Head
    ctx.fillStyle = '#4ade80';
    ctx.fillRect(gameState.snakeHead.x, gameState.snakeHead.y, 20, 20);

  }, [gameState, dimensions]);

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 pointer-events-none">
        <div className="pointer-events-auto flex gap-2">
          <button onClick={onBack} className="p-2 bg-gray-800 rounded-full text-white border border-gray-600">
            <ArrowLeft size={24} />
          </button>
          <button onClick={() => setShowInstructions(!showInstructions)} className="p-2 bg-gray-800 rounded-full text-white border border-gray-600">
            <HelpCircle size={24} />
          </button>
        </div>
        <div className="text-white font-bold text-xl drop-shadow-md">
          Score: {gameState.score}
        </div>
      </div>

      {/* Instructions Modal */}
      {showInstructions && (
        <div className="absolute inset-0 bg-black/80 z-20 flex items-center justify-center p-4">
          <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full border border-gray-700">
            <PhysicsInstructions />
            <button 
              onClick={() => setShowInstructions(false)}
              className="mt-4 w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Game Canvas */}
      <canvas 
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="block touch-none"
        onTouchStart={() => jump()} // Simple tap to jump for now
      />

      {/* Game Over / Start Screen */}
      {(!gameState.gameStarted || gameState.gameOver) && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
          <div className="text-center p-8 bg-gray-800 rounded-xl border border-gray-700 shadow-2xl">
            <h2 className="text-4xl font-bold text-white mb-4">
              {gameState.gameOver ? 'Game Over' : 'Physics Snake'}
            </h2>
            {gameState.gameOver && (
              <p className="text-xl text-gray-300 mb-6">Score: {gameState.score}</p>
            )}
            <button
              onClick={gameState.gameOver ? resetGame : startGame}
              className="flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-xl transition-transform hover:scale-105"
            >
              {gameState.gameOver ? <RefreshCw /> : <Play />}
              {gameState.gameOver ? 'Try Again' : 'Start Game'}
            </button>
          </div>
        </div>
      )}

      {/* Mobile Controls Overlay */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-between px-8 pointer-events-none md:hidden">
        <div className="pointer-events-auto p-4 bg-white/10 rounded-full backdrop-blur-sm" onTouchStart={() => moveHorizontal('LEFT')} onTouchEnd={stopHorizontal}><ArrowLeft className="text-white" size={32}/></div>
        <div className="pointer-events-auto p-4 bg-white/10 rounded-full backdrop-blur-sm" onTouchStart={() => moveHorizontal('RIGHT')} onTouchEnd={stopHorizontal}><ArrowLeft className="text-white rotate-180" size={32}/></div>
      </div>
    </div>
  );
};

export default PhysicsGame;