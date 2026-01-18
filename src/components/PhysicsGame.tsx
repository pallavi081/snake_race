import React, { useEffect, useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react';
import { usePhysicsGame } from '../hooks/usePhysicsGame';
import PhysicsCanvas from './PhysicsCanvas';
import PhysicsInstructions from './PhysicsInstructions';

interface PhysicsGameProps {
  onBack: () => void;
}

const PhysicsGame: React.FC<PhysicsGameProps> = ({ onBack }) => {
  const { gameState, moveHorizontal } = usePhysicsGame();
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        moveHorizontal('LEFT');
      } else if (e.key === 'ArrowRight') {
        moveHorizontal('RIGHT');
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [moveHorizontal]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="flex items-center justify-between w-full max-w-md mb-4">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-700 text-white">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-3xl font-bold text-center text-white">Physics Mode</h1>
        <button onClick={() => setShowInstructions(true)} className="p-2 rounded-full hover:bg-gray-700 text-white">
          <HelpCircle size={20} />
        </button>
      </div>
      
      <PhysicsCanvas gameState={gameState} />

      <div className="flex items-center gap-4 mt-4 md:hidden">
        <button 
          className="p-4 rounded-full bg-gray-700 bg-opacity-50 text-white"
          onTouchStart={() => moveHorizontal('LEFT')}
        >
          <ChevronLeft size={32} />
        </button>
        <button 
          className="p-4 rounded-full bg-gray-700 bg-opacity-50 text-white"
          onTouchStart={() => moveHorizontal('RIGHT')}
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
    </div>
  );
};

export default PhysicsGame;
