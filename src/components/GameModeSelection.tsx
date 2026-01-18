import React from 'react';
import { Shield, Puzzle, Wind } from 'lucide-react';

interface GameModeSelectionProps {
  onSelectMode: (mode: 'classic' | 'puzzle' | 'physics') => void;
  isDarkMode: boolean;
}

const GameModeSelection: React.FC<GameModeSelectionProps> = ({ onSelectMode, isDarkMode }) => {
  return (
    <div className={`flex flex-col items-center justify-center min-h-screen p-4 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
      <h1 className="text-4xl font-bold mb-8">Select a Game Mode</h1>
      <div className="grid md:grid-cols-3 gap-8">
        {/* Classic Mode */}
        <div 
          className={`p-6 rounded-lg border-2 transition-all cursor-pointer ${isDarkMode ? 'border-gray-700 hover:border-blue-500' : 'border-gray-300 hover:border-blue-500'}`}
          onClick={() => onSelectMode('classic')}
        >
          <div className="flex items-center gap-4 mb-4">
            <Shield size={40} className="text-blue-500" />
            <h2 className="text-2xl font-bold">Classic Mode</h2>
          </div>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            The timeless snake game experience. Eat, grow, and survive as long as you can.
          </p>
        </div>

        {/* Puzzle Mode */}
        <div 
          className={`p-6 rounded-lg border-2 transition-all cursor-pointer ${isDarkMode ? 'border-gray-700 hover:border-green-500' : 'border-gray-300 hover:border-green-500'}`}
          onClick={() => onSelectMode('puzzle')}
        >
          <div className="flex items-center gap-4 mb-4">
            <Puzzle size={40} className="text-green-500" />
            <h2 className="text-2xl font-bold">Puzzle Mode</h2>
          </div>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            Solve challenging puzzles by eating all the food within a limited number of moves.
          </p>
        </div>

        {/* Physics Mode */}
        <div 
          className={`p-6 rounded-lg border-2 transition-all cursor-pointer ${isDarkMode ? 'border-gray-700 hover:border-yellow-500' : 'border-gray-300 hover:border-yellow-500'}`}
          onClick={() => onSelectMode('physics')}
        >
          <div className="flex items-center gap-4 mb-4">
            <Wind size={40} className="text-yellow-500" />
            <h2 className="text-2xl font-bold">Physics Mode</h2>
          </div>
          <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            A new challenge with gravity, platforms, and physics-based movement.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GameModeSelection;
