import React, { useEffect, useState } from 'react';
import { ArrowLeft, HelpCircle, Play, X, Save } from 'lucide-react';
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
  const { gameState, moveHorizontal, stopHorizontal, jump, startGame, loadCustomLevel, goToLevel, resetLevel } = usePhysicsGame();
  const [showInstructions, setShowInstructions] = useState(false);
  const [showLevelSelect, setShowLevelSelect] = useState(false);
  const [isEditing, setIsEditing] = useState(isCreative);
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

  /* Editor functions removed */

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

      {/* Editor UI */}
      {isEditing && (
        <div className="flex flex-col items-center w-full max-w-md">
          <div className="flex items-center justify-between w-full mb-4">
            <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-700 text-white"><ArrowLeft size={24} /></button>
            <h1 className="text-2xl font-bold text-white">Physics Editor</h1>
            <div className="flex gap-2">
              <button onClick={handleSaveLevel} className="p-2 rounded-full bg-blue-600 text-white"><Save size={20} /></button>
              <button onClick={handleStartCustomGame} className="p-2 rounded-full bg-green-600 text-white"><Play size={20} /></button>
            </div>
          </div>
          {/* Editor Grid would go here */}
        </div>
      )}

      {/* Start UI */}
      {!isEditing && !gameState.gameStarted && (
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
            className="flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-2xl transition-all hover:scale-105 shadow-lg mb-4 w-full justify-center"
          >
            <Play size={28} fill="currentColor" />
            Start Game
          </button>

          <button
            onClick={() => setShowLevelSelect(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-semibold text-lg transition-all border border-gray-700 w-full justify-center"
          >
            Select Level
          </button>
        </div>
      )}

      {/* In-Game UI */}
      {!isEditing && gameState.gameStarted && (
        <div className="flex flex-col items-center w-full max-w-[min(100vw-2rem,400px)]">
          <button onClick={onBack} className="fixed top-4 left-4 p-2 rounded-full bg-gray-800/80 backdrop-blur-sm hover:bg-gray-700 text-white border border-gray-600 z-[60] shadow-lg md:absolute">
            <ArrowLeft size={24} />
          </button>
          <div className="flex justify-between w-full mb-4 text-white bg-gray-800/50 p-3 rounded-xl border border-gray-700">
            <span className="font-bold flex items-center gap-2">
              <span className="text-xs text-gray-400 uppercase tracking-widest">Physics Level</span>
              {gameState.currentLevelIndex + 1}
            </span>
          </div>
          <div className="relative w-full aspect-square flex items-center justify-center bg-gray-800/30 rounded-2xl p-1 border border-gray-700 shadow-inner">
            <PhysicsCanvas gameState={gameState} />
          </div>
        </div>
      )}

      {/* Level Selection Modal */}
      {showLevelSelect && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="p-6 border-b border-gray-800 w-full flex justify-between items-center">
              <h2 className="text-2xl font-black text-white">Select Level</h2>
              <button
                onClick={() => setShowLevelSelect(false)}
                className="p-2 hover:bg-gray-800 rounded-full transition-colors"
              >
                <X size={24} className="text-gray-400" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto grid grid-cols-5 sm:grid-cols-10 gap-2">
              {Array.from({ length: 50 }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    goToLevel(i);
                    setShowLevelSelect(false);
                    startGame();
                  }}
                  className={`aspect-square flex items-center justify-center rounded-lg font-bold text-sm transition-all
                    ${gameState.currentLevelIndex === i
                      ? 'bg-blue-600 text-white scale-110 shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                      : 'bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 hover:border-gray-500'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <div className="p-4 text-gray-500 text-xs text-center border-t border-gray-800">
              Challenge yourself on any level!
            </div>
          </div>
        </div>
      )}

      {/* Overlay Screens */}
      {showInstructions && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[110] p-4">
          <div className="relative rounded-2xl p-6 max-w-lg w-full bg-gray-900 border border-gray-700">
            <PhysicsInstructions />
            <button onClick={() => setShowInstructions(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={24} /></button>
          </div>
        </div>
      )}

      {gameState.isLevelComplete && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white z-50">
          <h2 className="text-5xl font-black mb-6 text-blue-400 animate-bounce">VICTORY!</h2>
          <button onClick={onBack} className="px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-xl transition-all">Back to Menu</button>
        </div>
      )}

      {gameState.isLevelFailed && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white z-50">
          <h2 className="text-5xl font-black mb-6 text-red-500">FALLEN</h2>
          <button onClick={resetLevel} className="px-8 py-4 bg-red-600 hover:bg-red-500 rounded-xl font-bold text-xl transition-all">Try Again</button>
        </div>
      )}
    </div>
  );
};

export default PhysicsGame;
