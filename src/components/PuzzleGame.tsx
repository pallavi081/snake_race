import React, { useState } from 'react';
import { usePuzzleGame } from '../hooks/usePuzzleGame.ts';
import PuzzleCanvas from './PuzzleCanvas.tsx';
import SwipeControls from './SwipeControls.tsx';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, ArrowLeft, HelpCircle, Play, RotateCcw } from 'lucide-react';
import { Direction } from '../types/game.ts';
import PuzzleInstructions from './PuzzleInstructions.tsx';

interface PuzzleGameProps {
  onBack: () => void;
}

const PuzzleGame: React.FC<PuzzleGameProps> = ({ onBack }) => {
  const { gameState, changeDirection, moveSnakeAndCheck, restartLevel, goToNextLevel, undo } = usePuzzleGame();
  const [showInstructions, setShowInstructions] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const handleSwipe = (direction: Direction) => {
    changeDirection(direction);
    moveSnakeAndCheck();
  };

  const buttonClass = "w-16 h-16 rounded-full flex items-center justify-center bg-gray-700 bg-opacity-50 text-white";

  return (
    <SwipeControls onSwipe={handleSwipe}>
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        {!hasStarted ? (
          <div className="flex flex-col items-center w-full max-w-md mb-8">
            <div className="flex items-center justify-between w-full mb-8">
              <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-700 text-white">
                <ArrowLeft size={24} />
              </button>
              <h1 className="text-3xl font-bold text-center text-white">Puzzle Mode</h1>
              <button onClick={() => setShowInstructions(true)} className="p-2 rounded-full hover:bg-gray-700 text-white">
                <HelpCircle size={24} />
              </button>
            </div>
            <button 
              onClick={() => setHasStarted(true)}
              className="flex items-center gap-3 px-8 py-4 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold text-2xl transition-all hover:scale-105 shadow-lg"
            >
              <Play size={28} fill="currentColor" />
              Start Game
            </button>
          </div>
        ) : (
          <>
            <button onClick={onBack} className="absolute top-4 left-4 p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-white border border-gray-600 z-10">
              <ArrowLeft size={24} />
            </button>
            <div className="flex justify-between w-full max-w-md mb-4 text-white">
              <span>Level: {gameState.currentLevelIndex + 1}</span>
              <span>Moves Left: {gameState.movesLeft}</span>
            </div>
            <PuzzleCanvas 
              level={gameState.level} 
              snake={gameState.snake} 
              food={gameState.food} 
            />
          </>
        )}

        {/* On-screen buttons for mobile */}
        <div className="grid grid-cols-3 gap-3 mt-4 md:hidden">
          <div></div>
          <button className={buttonClass} onClick={() => handleSwipe('UP')}><ChevronUp size={32} /></button>
          <div></div>
          <button className={buttonClass} onClick={() => handleSwipe('LEFT')}><ChevronLeft size={32} /></button>
          <div></div>
          <button className={buttonClass} onClick={() => handleSwipe('RIGHT')}><ChevronRight size={32} /></button>
          <div></div>
          <button className={buttonClass} onClick={() => handleSwipe('DOWN')}><ChevronDown size={32} /></button>
          <div></div>
        </div>

        {showInstructions && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="relative rounded-lg p-6 max-w-lg w-full bg-gray-900 border border-gray-700">
              <PuzzleInstructions />
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
          <div className="absolute inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center text-white">
            <h2 className="text-4xl font-bold mb-4">Level Complete!</h2>
            <button 
              onClick={goToNextLevel}
              className="px-6 py-3 bg-green-600 rounded-lg font-semibold"
            >
              Next Level
            </button>
          </div>
        )}

        {gameState.isLevelFailed && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center text-white">
            <h2 className="text-4xl font-bold mb-4">Level Failed</h2>
            <button 
              onClick={restartLevel}
              className="px-6 py-3 bg-red-600 rounded-lg font-semibold"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </SwipeControls>
  );
};

export default PuzzleGame;
