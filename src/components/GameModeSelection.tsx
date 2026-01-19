import React, { useState, useEffect } from 'react';
import { Shield, Puzzle, Wind, BookOpen, X, Download } from 'lucide-react';
import GameInstructions from './GameInstructions';

interface GameModeSelectionProps {
  onSelectMode: (mode: 'classic' | 'puzzle' | 'physics') => void;
}

const GameModeSelection: React.FC<GameModeSelectionProps> = ({ onSelectMode }) => {
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      console.log('PWA Install Prompt captured');
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900 text-white">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">Snake Race</h1>
        <p className="text-gray-400 text-lg">Choose your challenge</p>
        
        <div className="flex gap-4 justify-center mt-6">
          <button 
            onClick={() => setShowHowToPlay(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-full border border-gray-700 transition-all"
          >
            <BookOpen size={18} />
            <span>How to Play</span>
          </button>

          {deferredPrompt && (
            <button 
              onClick={handleInstallClick}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-full border border-blue-500 transition-all shadow-lg hover:shadow-blue-500/20"
            >
              <Download size={18} />
              <span>Install App</span>
            </button>
          )}
        </div>
      </div>

      {showHowToPlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-gray-800 p-6 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-gray-700 relative">
            <button onClick={() => setShowHowToPlay(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <X size={24} />
            </button>
            <GameInstructions />
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        {/* Classic Mode */}
        <div 
          className="p-6 rounded-xl border-2 border-gray-700 hover:border-blue-500 bg-gray-800 transition-all cursor-pointer hover:scale-105"
          onClick={() => onSelectMode('classic')}
        >
          <div className="flex items-center gap-4 mb-4">
            <Shield size={40} className="text-blue-500" />
            <h2 className="text-2xl font-bold">Classic Mode</h2>
          </div>
          <p className="text-gray-300">
            The timeless snake game experience. Eat, grow, and survive as long as you can.
          </p>
        </div>

        {/* Puzzle Mode */}
        <div 
          className="p-6 rounded-xl border-2 border-gray-700 hover:border-green-500 bg-gray-800 transition-all cursor-pointer hover:scale-105"
          onClick={() => onSelectMode('puzzle')}
        >
          <div className="flex items-center gap-4 mb-4">
            <Puzzle size={40} className="text-green-500" />
            <h2 className="text-2xl font-bold">Puzzle Mode</h2>
          </div>
          <p className="text-gray-300">
            Solve challenging puzzles by eating all the food within a limited number of moves.
          </p>
        </div>

        {/* Physics Mode */}
        <div 
          className="p-6 rounded-xl border-2 border-gray-700 hover:border-yellow-500 bg-gray-800 transition-all cursor-pointer hover:scale-105"
          onClick={() => onSelectMode('physics')}
        >
          <div className="flex items-center gap-4 mb-4">
            <Wind size={40} className="text-yellow-500" />
            <h2 className="text-2xl font-bold">Physics Mode</h2>
          </div>
          <p className="text-gray-300">
            A new challenge with gravity, platforms, and physics-based movement.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GameModeSelection;
