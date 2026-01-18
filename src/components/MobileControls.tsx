import React from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Play, RotateCcw } from 'lucide-react';
import { Direction } from '../types/game';

interface MobileControlsProps {
  onDirectionChange: (direction: Direction) => void;
  onStart: () => void;
  onRestart: () => void;
  gameStarted: boolean;
  gameOver: boolean;
}

const MobileControls: React.FC<MobileControlsProps> = ({
  onDirectionChange,
  onStart,
  onRestart,
  gameStarted,
  gameOver
}) => {
  const buttonClass = `
    w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200
    bg-gray-700 bg-opacity-50 hover:bg-opacity-75 text-white
    active:scale-95 select-none touch-manipulation
  `;

  const actionButtonClass = `
    px-8 py-4 rounded-lg font-semibold transition-all duration-200 flex items-center
    bg-green-600 bg-opacity-80 hover:bg-opacity-100 text-white
    active:scale-95 select-none touch-manipulation
  `;

  return (
    <div className="flex flex-col items-center gap-4 mt-4 md:hidden">
      {/* Directional Controls */}
      {gameStarted && !gameOver && (
        <div className="grid grid-cols-3 gap-3">
          <div></div>
          <button
            className={buttonClass}
            onTouchStart={() => onDirectionChange('UP')}
            onClick={() => onDirectionChange('UP')}
          >
            <ChevronUp size={32} />
          </button>
          <div></div>
          
          <button
            className={buttonClass}
            onTouchStart={() => onDirectionChange('LEFT')}
            onClick={() => onDirectionChange('LEFT')}
          >
            <ChevronLeft size={32} />
          </button>
          <div></div>
          <button
            className={buttonClass}
            onTouchStart={() => onDirectionChange('RIGHT')}
            onClick={() => onDirectionChange('RIGHT')}
          >
            <ChevronRight size={32} />
          </button>
          
          <div></div>
          <button
            className={buttonClass}
            onTouchStart={() => onDirectionChange('DOWN')}
            onClick={() => onDirectionChange('DOWN')}
          >
            <ChevronDown size={32} />
          </button>
          <div></div>
        </div>
      )}
      
      {/* Action Button */}
      <div className="mt-4">
        {!gameStarted && !gameOver ? (
          <button className={actionButtonClass} onClick={onStart}>
            <Play size={24} className="mr-2" />
            Start Game
          </button>
        ) : gameOver ? (
          <button className={actionButtonClass} onClick={onRestart}>
            <RotateCcw size={24} className="mr-2" />
            Restart
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default MobileControls;