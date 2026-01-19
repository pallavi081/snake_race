import React, { useEffect, useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, HelpCircle, ArrowUp, Play } from 'lucide-react';
import { usePhysicsGame } from '../hooks/usePhysicsGame';
import PhysicsCanvas from './PhysicsCanvas';
import PhysicsInstructions from './PhysicsInstructions';

interface PhysicsGameProps {
  onBack: () => void;
}

const PhysicsGame: React.FC<PhysicsGameProps> = ({ onBack }) => {
  const { gameState, moveHorizontal, stopHorizontal, jump, startGame } = usePhysicsGame();
  const [showInstructions, setShowInstructions] = useState(false);

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
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900">
      {!gameState.gameStarted && (
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
      
      {gameState.gameStarted && (
        <div className="relative">
          <button onClick={onBack} className="absolute top-4 left-4 p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-white border border-gray-600 z-10">
            <ArrowLeft size={24} />
          </button>
          <PhysicsCanvas gameState={gameState} />
        </div>
      )}

      {/* Mobile Controls */}
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
          <button onClick={() => window.location.reload()} className="px-6 py-3 bg-gray-700 rounded-lg">Try Again</button>
        </div>
      )}
    </div>
  );
};

export default PhysicsGame;
