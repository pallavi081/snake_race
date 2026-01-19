import React, { useEffect, useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, HelpCircle, ArrowUp, Play, Box, Circle, Save } from 'lucide-react';
import { usePhysicsGame } from '../hooks/usePhysicsGame';
import PhysicsCanvas from './PhysicsCanvas';
import PhysicsInstructions from './PhysicsInstructions';
import { PhysicsLevel } from '../levels';
import { TileType } from '../tiles';

interface PhysicsGameProps {
  onBack: () => void;
  isCreative?: boolean;
}

const PhysicsGame: React.FC<PhysicsGameProps> = ({ onBack, isCreative = false }) => {
  const { gameState, moveHorizontal, stopHorizontal, jump, startGame, loadCustomLevel, resetLevel } = usePhysicsGame();
  const [showInstructions, setShowInstructions] = useState(false);
  const [isEditing, setIsEditing] = useState(isCreative);
  const [selectedTool, setSelectedTool] = useState<'platform' | 'food'>('platform');
  const [customLevel, setCustomLevel] = useState<PhysicsLevel>({
    gridSize: 20,
    tiles: Array(20).fill(null).map(() => Array(20).fill({ type: TileType.Empty })),
    initialSnake: [{ x: 2, y: 10 }],
    foodPositions: []
  });

  useEffect(() => {
    setIsEditing(isCreative);
  }, [isCreative]);

  useEffect(() => {
    const savedLevel = localStorage.getItem('snake-custom-level-physics');
    if (savedLevel && isCreative) {
      setCustomLevel(JSON.parse(savedLevel));
    }
  }, [isCreative]);

  const handleEditorClick = (x: number, y: number) => {
    setCustomLevel(prev => {
      const newLevel = { ...prev };
      // Deep copy tiles
      newLevel.tiles = prev.tiles.map(row => [...row]);
      
      if (selectedTool === 'platform') {
        // Toggle platform
        if (newLevel.tiles[y][x].type === TileType.Platform) {
          newLevel.tiles[y][x] = { type: TileType.Empty };
        } else {
          newLevel.tiles[y][x] = { type: TileType.Platform };
        }
      } else if (selectedTool === 'food') {
        // Toggle food
        const existingIndex = newLevel.foodPositions.findIndex(p => p.x === x && p.y === y);
        if (existingIndex >= 0) {
          newLevel.foodPositions = newLevel.foodPositions.filter((_, i) => i !== existingIndex);
        } else {
          newLevel.foodPositions.push({ x, y });
        }
      }
      return newLevel;
    });
  };

  const handleSaveLevel = () => {
    localStorage.setItem('snake-custom-level-physics', JSON.stringify(customLevel));
    alert('Level saved successfully!');
  };

  const handleStartCustomGame = () => {
    loadCustomLevel(customLevel);
    setIsEditing(false);
    startGame();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') moveHorizontal('LEFT');
      if (e.key === 'ArrowRight') moveHorizontal('RIGHT');
      if (e.key === ' ' || e.key === 'ArrowUp') jump();
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') stopHorizontal();
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [moveHorizontal, stopHorizontal, jump]);

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900 ${gameState.gameStarted && !isEditing ? 'cursor-none' : ''}`}>
      {isEditing ? (
        <div className="flex flex-col items-center w-full max-w-md">
          <div className="flex items-center justify-between w-full mb-4">
            <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-700 text-white">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-2xl font-bold text-white">Physics Editor</h1>
            <button onClick={handleSaveLevel} className="p-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white mr-2" title="Save Game">
              <Save size={24} />
            </button>
            <button onClick={handleStartCustomGame} className="p-2 rounded-full bg-green-600 hover:bg-green-500 text-white" title="Play Game">
              <Play size={24} />
            </button>
          </div>

          <div className="flex gap-4 mb-4 bg-gray-800 p-2 rounded-lg">
            <button onClick={() => setSelectedTool('platform')} className={`p-2 rounded ${selectedTool === 'platform' ? 'bg-blue-600' : 'hover:bg-gray-700'}`} title="Platform">
              <Box size={24} className="text-gray-400" />
            </button>
            <button onClick={() => setSelectedTool('food')} className={`p-2 rounded ${selectedTool === 'food' ? 'bg-blue-600' : 'hover:bg-gray-700'}`} title="Food">
              <Circle size={24} className="text-red-500" />
            </button>
          </div>

          <div 
            className="relative bg-gray-900 border-2 border-gray-600"
            style={{ 
              width: 400, 
              height: 400,
              display: 'grid',
              gridTemplateColumns: `repeat(20, 1fr)`,
              gridTemplateRows: `repeat(20, 1fr)`
            }}
          >
            {Array.from({ length: 400 }).map((_, i) => {
              const x = i % 20;
              const y = Math.floor(i / 20);
              const isPlatform = customLevel.tiles[y][x].type === TileType.Platform;
              const isFood = customLevel.foodPositions.some(p => p.x === x && p.y === y);
              const isSnake = customLevel.initialSnake[0].x === x && customLevel.initialSnake[0].y === y;

              return (
                <div 
                  key={i}
                  onClick={() => handleEditorClick(x, y)}
                  className={`border-[0.5px] border-gray-800 cursor-pointer hover:bg-white/10 
                    ${isPlatform ? 'bg-gray-500' : ''} 
                    ${isFood ? 'bg-red-500' : ''}
                    ${isSnake ? 'bg-green-500' : ''}`}
                />
              );
            })}
          </div>
        </div>
      ) : !gameState.gameStarted && (
        <div className="flex flex-col items-center w-full max-w-md mb-8">
          <div className="flex items-center justify-between w-full mb-8">
            <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-700 text-white">
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-3xl font-bold text-center text-white">Physics Mode</h1>
            <button onClick={() => setShowInstructions(true)} className="p-2 rounded-full hover:bg-gray-700 text-white">
              <HelpCircle size={24} />
            </button>
          </div>
          
          <button 
            onClick={startGame}
            className="flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-2xl transition-all hover:scale-105 shadow-lg"
          >
            <Play size={28} fill="currentColor" />
            Start Game
          </button>
        </div>
      )}
      
      {!isEditing && gameState.gameStarted && (
        <div className="relative">
          <button onClick={onBack} className="absolute top-4 left-4 p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-white border border-gray-600 z-10">
            <ArrowLeft size={24} />
          </button>
          <PhysicsCanvas gameState={gameState} />
        </div>
      )}

      {/* Mobile Controls */}
      {!isEditing && (
      <div className="flex items-center gap-4 mt-6 md:hidden w-full max-w-md justify-center">
        <button 
          className="p-6 rounded-full bg-gray-700 bg-opacity-50 text-white active:bg-gray-600"
          onTouchStart={() => moveHorizontal('LEFT')}
          onTouchEnd={stopHorizontal}
        >
          <ChevronLeft size={32} />
        </button>
        
        <button 
          className="p-8 rounded-full bg-blue-600 bg-opacity-80 text-white active:bg-blue-500 mx-4"
          onTouchStart={jump}
          onClick={jump}
        >
          <ArrowUp size={40} />
        </button>

        <button 
          className="p-6 rounded-full bg-gray-700 bg-opacity-50 text-white active:bg-gray-600"
          onTouchStart={() => moveHorizontal('RIGHT')}
          onTouchEnd={stopHorizontal}
        >
          <ChevronRight size={32} />
        </button>
      </div>
      )}

      {showInstructions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="relative rounded-lg p-6 max-w-lg w-full bg-gray-900 border border-gray-700">
            <PhysicsInstructions />
            <button 
              onClick={() => setShowInstructions(false)}
              className="absolute top-3 right-3 px-3 py-1 rounded-full bg-red-500 text-white hover:bg-red-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
      
      {gameState.isLevelComplete && (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center text-white z-40">
          <h2 className="text-4xl font-bold mb-4">Level Complete!</h2>
          <button onClick={onBack} className="px-6 py-3 bg-blue-600 rounded-lg">Back to Menu</button>
        </div>
      )}
      
      {gameState.isLevelFailed && (
        <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center text-white z-40">
          <h2 className="text-4xl font-bold mb-4 text-red-500">Level Failed</h2>
          <button onClick={resetLevel} className="px-6 py-3 bg-gray-700 rounded-lg">Try Again</button>
        </div>
      )}
    </div>
  );
};

export default PhysicsGame;
