import React, { useState, useEffect } from 'react';
import { usePuzzleGame } from '../hooks/usePuzzleGame.ts';
import PuzzleCanvas from './PuzzleCanvas.tsx';
import SwipeControls from './SwipeControls.tsx';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, ArrowLeft, HelpCircle, Play, RotateCcw, PenTool, Eraser, Save, Box, Circle, Disc } from 'lucide-react';
import { Direction, Position } from '../types/game.ts';
import PuzzleInstructions from './PuzzleInstructions.tsx';
import { PuzzleLevel } from '../levels.ts';

interface PuzzleGameProps {
  onBack: () => void;
  isCreative?: boolean;
}

const PuzzleGame: React.FC<PuzzleGameProps> = ({ onBack, isCreative = false }) => {
  const { gameState, changeDirection, moveSnakeAndCheck, restartLevel, goToNextLevel, undo, loadCustomLevel } = usePuzzleGame();
  const [showInstructions, setShowInstructions] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isEditing, setIsEditing] = useState(isCreative);
  const [selectedTool, setSelectedTool] = useState<'wall' | 'food' | 'snake'>('wall');
  const [customLevel, setCustomLevel] = useState<PuzzleLevel>({
    gridSize: 15,
    obstaclePositions: [],
    foodPositions: [],
    initialSnake: [{ x: 7, y: 7 }],
    maxMoves: 50
  });

  useEffect(() => {
    setIsEditing(isCreative);
  }, [isCreative]);

  useEffect(() => {
    const savedLevel = localStorage.getItem('snake-custom-level-puzzle');
    if (savedLevel && isCreative) {
      setCustomLevel(JSON.parse(savedLevel));
    }
  }, [isCreative]);

  const handleEditorClick = (x: number, y: number) => {
    setCustomLevel(prev => {
      const newLevel = { ...prev };

      // Remove existing items at this position
      newLevel.obstaclePositions = newLevel.obstaclePositions.filter(p => p.x !== x || p.y !== y);
      newLevel.foodPositions = newLevel.foodPositions.filter(p => p.x !== x || p.y !== y);

      if (selectedTool === 'wall') {
        newLevel.obstaclePositions.push({ x, y });
      } else if (selectedTool === 'food') {
        newLevel.foodPositions.push({ x, y });
      } else if (selectedTool === 'snake') {
        newLevel.initialSnake = [{ x, y }];
      }

      return newLevel;
    });
  };

  const handleSaveLevel = () => {
    localStorage.setItem('snake-custom-level-puzzle', JSON.stringify(customLevel));
    alert('Level saved successfully!');
  };

  const handleStartCustomGame = () => {
    loadCustomLevel(customLevel);
    setIsEditing(false);
    setHasStarted(true);
  };

  const handleSwipe = (direction: Direction) => {
    changeDirection(direction);
    moveSnakeAndCheck();
  };

  const buttonClass = "w-16 h-16 rounded-full flex items-center justify-center bg-gray-700 bg-opacity-50 text-white";

  return (
    <SwipeControls onSwipe={handleSwipe}>
      <div className={`flex flex-col items-center justify-center min-h-screen p-4 ${hasStarted && !isEditing ? 'cursor-none' : ''}`}>
        {isEditing ? (
          <div className="flex flex-col items-center w-full max-w-md">
            <div className="flex items-center justify-between w-full mb-4">
              <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-700 text-white">
                <ArrowLeft size={24} />
              </button>
              <h1 className="text-2xl font-bold text-white">Level Editor</h1>
              <button onClick={handleSaveLevel} className="p-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white mr-2" title="Save Game">
                <Save size={24} />
              </button>
              <button onClick={handleStartCustomGame} className="p-2 rounded-full bg-green-600 hover:bg-green-500 text-white" title="Play Game">
                <Play size={24} />
              </button>
            </div>

            <div className="flex gap-4 mb-4 bg-gray-800 p-2 rounded-lg">
              <button onClick={() => setSelectedTool('wall')} className={`p-2 rounded ${selectedTool === 'wall' ? 'bg-blue-600' : 'hover:bg-gray-700'}`} title="Wall">
                <Box size={24} className="text-gray-400" />
              </button>
              <button onClick={() => setSelectedTool('food')} className={`p-2 rounded ${selectedTool === 'food' ? 'bg-blue-600' : 'hover:bg-gray-700'}`} title="Food">
                <Circle size={24} className="text-red-500" />
              </button>
              <button onClick={() => setSelectedTool('snake')} className={`p-2 rounded ${selectedTool === 'snake' ? 'bg-blue-600' : 'hover:bg-gray-700'}`} title="Snake Start">
                <Disc size={24} className="text-green-500" />
              </button>
            </div>

            <div
              className="relative bg-gray-900 border-2 border-gray-600"
              style={{
                width: customLevel.gridSize * 20,
                height: customLevel.gridSize * 20,
                display: 'grid',
                gridTemplateColumns: `repeat(${customLevel.gridSize}, 1fr)`,
                gridTemplateRows: `repeat(${customLevel.gridSize}, 1fr)`
              }}
            >
              {Array.from({ length: customLevel.gridSize * customLevel.gridSize }).map((_, i) => {
                const x = i % customLevel.gridSize;
                const y = Math.floor(i / customLevel.gridSize);
                const isWall = customLevel.obstaclePositions.some(p => p.x === x && p.y === y);
                const isFood = customLevel.foodPositions.some(p => p.x === x && p.y === y);
                const isSnake = customLevel.initialSnake[0].x === x && customLevel.initialSnake[0].y === y;

                return (
                  <div
                    key={i}
                    onClick={() => handleEditorClick(x, y)}
                    className={`border-[0.5px] border-gray-800 cursor-pointer hover:bg-white/10 
                      ${isWall ? 'bg-gray-500' : ''} 
                      ${isFood ? 'bg-red-500' : ''} 
                      ${isSnake ? 'bg-green-500' : ''}`}
                  />
                );
              })}
            </div>
          </div>
        ) : !hasStarted ? (
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

        {/* On-screen buttons for mobile - Only show when playing */}
        {!isEditing && (
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
        )}

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
