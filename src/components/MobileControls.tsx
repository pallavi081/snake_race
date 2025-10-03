import React from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Play, RotateCcw } from 'lucide-react';
import { Direction } from '../types/game';

interface MobileControlsProps {
  onDirectionChange: (direction: Direction) => void;
  onStart: () => void;
  onRestart: () => void;
  gameStarted: boolean;
  gameOver: boolean;
  isDarkMode: boolean;
}

const MobileControls: React.FC<MobileControlsProps> = ({
  onDirectionChange,
  onStart,
  onRestart,
  gameStarted,
  gameOver,
  isDarkMode
}) => {
  const buttonClass = `
    w-16 h-16 rounded-lg flex items-center justify-center transition-all duration-200
    ${isDarkMode 
      ? 'bg-gray-700 hover:bg-gray-600 text-white border border-gray-600' 
      : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-md'
    }
    active:scale-95 select-none touch-manipulation
  `;

  const actionButtonClass = `
    px-6 py-3 rounded-lg font-semibold transition-all duration-200
    ${isDarkMode
      ? 'bg-green-600 hover:bg-green-700 text-white'
      : 'bg-green-500 hover:bg-green-600 text-white shadow-md'
    }
    active:scale-95 select-none touch-manipulation
  `;

  return (
    <div className="flex flex-col items-center gap-4 mt-6 md:hidden">
      {/* Action Button */}
      <div>
        {!gameStarted && !gameOver ? (
          <button className={actionButtonClass} onClick={onStart}>
            <Play size={20} className="mr-2" />
            Start Game
          </button>
        ) : gameOver ? (
          <button className={actionButtonClass} onClick={onRestart}>
            <RotateCcw size={20} className="mr-2" />
            Restart
          </button>
        ) : null}
      </div>

      {/* Directional Controls */}
      {gameStarted && !gameOver && (
        <div className="grid grid-cols-3 gap-2">
          <div></div>
          <button
            className={buttonClass}
            onTouchStart={() => onDirectionChange('UP')}
            onClick={() => onDirectionChange('UP')}
          >
            <ChevronUp size={24} />
          </button>
          <div></div>
          
          <button
            className={buttonClass}
            onTouchStart={() => onDirectionChange('LEFT')}
            onClick={() => onDirectionChange('LEFT')}
          >
            <ChevronLeft size={24} />
          </button>
          <div></div>
          <button
            className={buttonClass}
            onTouchStart={() => onDirectionChange('RIGHT')}
            onClick={() => onDirectionChange('RIGHT')}
          >
            <ChevronRight size={24} />
          </button>
          
          <div></div>
          <button
            className={buttonClass}
            onTouchStart={() => onDirectionChange('DOWN')}
            onClick={() => onDirectionChange('DOWN')}
          >
            <ChevronDown size={24} />
          </button>
          <div></div>
        </div>
      )}
    </div>
  );
};

export default MobileControls;