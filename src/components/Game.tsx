
import React, { useState, useEffect } from 'react';
import { useSnakeGame } from '../hooks/useSnakeGame';
import GameCanvas from './GameCanvas';
import SwipeControls from './SwipeControls';
import ScoreBoard from './ScoreBoard';
import GameInstructions from './GameInstructions';
import SoundToggle from './SoundToggle';
import PowerUpInfo from './PowerUpInfo';
import Settings from './Settings';
import AchievementToast from './AchievementToast';
import { HelpCircle, Settings as SettingsIcon, ArrowLeft, Play, Pause, Save } from 'lucide-react';
import { Difficulty, Position, Direction } from '../types/game';
import { GRID_SIZE } from '../utils/gameLogic';
import { Achievement } from '../data/achievements';

interface GameProps {
  onBack: () => void;
  isCreative?: boolean;
}

const Game: React.FC<GameProps> = ({ onBack, isCreative = false }) => {
  const { gameState, startGame, resetGame, changeDirection, soundEnabled, toggleSound, difficulty, setDifficulty, settings, updateSettings, isPaused, togglePause, loadCustomLevel, unlockedAchievements, clearAchievements } = useSnakeGame();

  const [showInstructions, setShowInstructions] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isEditing, setIsEditing] = useState(isCreative);
  const [customObstacles, setCustomObstacles] = useState<Position[]>([]);

  // Achievement Toast Queue
  const [achievementQueue, setAchievementQueue] = useState<Achievement[]>([]);
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);

  useEffect(() => {
    setIsEditing(isCreative);
  }, [isCreative]);

  useEffect(() => {
    const savedLevel = localStorage.getItem('snake-custom-level-classic');
    if (savedLevel && isCreative) {
      setCustomObstacles(JSON.parse(savedLevel));
    }
  }, [isCreative]);

  // Handle new achievements
  useEffect(() => {
    if (unlockedAchievements && unlockedAchievements.length > 0) {
      setAchievementQueue(prev => [...prev, ...unlockedAchievements]);
      clearAchievements();
    }
  }, [unlockedAchievements, clearAchievements]);

  // Process achievement queue
  useEffect(() => {
    if (!currentAchievement && achievementQueue.length > 0) {
      setCurrentAchievement(achievementQueue[0]);
      setAchievementQueue(prev => prev.slice(1));
    }
  }, [achievementQueue, currentAchievement]);

  const handleToggleObstacle = (x: number, y: number) => {
    setCustomObstacles(prev => {
      const exists = prev.some(p => p.x === x && p.y === y);
      if (exists) {
        return prev.filter(p => p.x !== x || p.y !== y);
      }
      return [...prev, { x, y }];
    });
  };

  const handleDifficultyChange = (level: Difficulty) => {
    if (!gameState.gameStarted) {
      setDifficulty(level);
    }
  };

  const handleSaveLevel = () => {
    localStorage.setItem('snake-custom-level-classic', JSON.stringify(customObstacles));
    alert('Board saved successfully!');
  };

  const handleStartCustomGame = () => {
    loadCustomLevel(customObstacles);
    setIsEditing(false);
    startGame();
  };

  const handleSwipe = (direction: Direction) => {
    changeDirection(direction);
  };

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen sm:p-4 ${gameState.gameStarted && !isEditing ? 'cursor-none' : ''}`}>
      <div className="w-full sm:max-w-md h-full sm:h-auto flex flex-col relative">
        {isEditing ? (
          <div className="p-4 w-full">
            <div className="flex items-center justify-between mb-4">
              <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-700 text-white">
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-2xl font-bold text-white">Create Board</h1>
              <button onClick={handleSaveLevel} className="p-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white mr-2" title="Save Game">
                <Save size={20} />
              </button>
              <button onClick={handleStartCustomGame} className="p-2 rounded-full bg-green-600 hover:bg-green-500 text-white" title="Play Game">
                <Play size={20} />
              </button>
            </div>

            <div className="bg-gray-800 p-2 rounded-lg mb-4 text-center text-sm text-gray-300">
              Tap grid cells to place/remove walls
            </div>

            <div
              className="relative bg-gray-900 border-2 border-gray-600 mx-auto"
              style={{
                width: gameState.canvasWidth,
                height: gameState.canvasHeight,
                display: 'grid',
                gridTemplateColumns: `repeat(${gameState.canvasWidth / GRID_SIZE}, 1fr)`,
                gridTemplateRows: `repeat(${gameState.canvasHeight / GRID_SIZE}, 1fr)`
              }}
            >
              {Array.from({ length: (gameState.canvasWidth / GRID_SIZE) * (gameState.canvasHeight / GRID_SIZE) }).map((_, i) => {
                const x = (i % (gameState.canvasWidth / GRID_SIZE)) * GRID_SIZE;
                const y = Math.floor(i / (gameState.canvasWidth / GRID_SIZE)) * GRID_SIZE;
                const isObstacle = customObstacles.some(p => p.x === x && p.y === y);

                return (
                  <div
                    key={i}
                    onClick={() => handleToggleObstacle(x, y)}
                    className={`border-[0.5px] border-gray-800 cursor-pointer hover:bg-white/10 ${isObstacle ? 'bg-gray-500' : ''}`}
                  />
                );
              })}
            </div>
          </div>
        ) : (
          /* REGULAR GAME MODE */
          <div className="p-4 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-700 text-white z-20">
                <ArrowLeft size={20} />
              </button>
              {!gameState.gameStarted && (
                <h1 className="text-3xl font-bold text-center text-white">
                  Classic Mode
                </h1>
              )}
              <div className="w-8"></div>
            </div>

            {!gameState.gameStarted && (
              <div className="flex justify-center items-center gap-4 mb-4">
                <SoundToggle soundEnabled={soundEnabled} onToggle={toggleSound} />
                <button
                  onClick={() => setShowInstructions(true)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors bg-gray-800 text-white hover:bg-gray-700"
                >
                  <HelpCircle size={20} />
                  How to Play
                </button>
                <button
                  onClick={() => setShowSettings(true)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors bg-gray-800 text-white hover:bg-gray-700"
                >
                  <SettingsIcon size={20} />
                  Settings
                </button>
              </div>
            )}

            {!gameState.gameStarted && (
              <div className="flex justify-center items-center gap-2 mb-4">
                {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map(level => (
                  <button
                    key={level}
                    onClick={() => handleDifficultyChange(level)}
                    disabled={gameState.gameStarted}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${difficulty === level
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-white hover:bg-gray-600'
                      } ${gameState.gameStarted ? 'cursor-not-allowed opacity-50' : ''}`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            )}

            <ScoreBoard
              score={gameState.score}
              highScore={gameState.highScore}
              level={gameState.level}
              combo={gameState.combo}
            />

            <PowerUpInfo
              activePowerUp={gameState.activePowerUp}
              powerUpEndTime={gameState.powerUpEndTime}
            />

            <div className="flex-1 flex items-center justify-center mt-4 relative">

              {/* Back/Pause buttons during game */}
              {gameState.gameStarted && (
                <>
                  {/* Controls overlay already in Canvas or UI? using absolute here */}
                </>
              )}

              <SwipeControls onSwipe={handleSwipe}>
                <GameCanvas gameState={gameState} onStart={startGame} onRestart={resetGame} />
              </SwipeControls>

              {/* Pause Button Overlay */}
              {gameState.gameStarted && !gameState.gameOver && (
                <button
                  onClick={togglePause}
                  className="absolute top-2 right-2 p-2 rounded-full bg-gray-800/80 hover:bg-gray-700 text-white border border-gray-600 z-10"
                >
                  {isPaused ? <Play size={20} /> : <Pause size={20} />}
                </button>
              )}
            </div>

            {!gameState.gameStarted && !gameState.gameOver && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={startGame}
                  className="flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-2xl transition-all hover:scale-105 shadow-lg"
                >
                  <Play size={28} fill="currentColor" />
                  Start Game
                </button>
              </div>
            )}
          </div>
        )}

        {isPaused && !gameState.gameOver && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 backdrop-blur-sm pointer-events-none">
            <div className="text-white text-4xl font-bold tracking-wider pointer-events-auto">
              PAUSED
            </div>
          </div>
        )}

        {showInstructions && (
          <GameInstructions onClose={() => setShowInstructions(false)} />
        )}

        {showSettings && (
          <Settings
            settings={settings}
            onSettingsChange={updateSettings}
            onClose={() => setShowSettings(false)}
          />
        )}

        <AchievementToast
          achievement={currentAchievement ? {
            name: currentAchievement.name,
            icon: currentAchievement.icon,
            coins: currentAchievement.reward.coins
          } : null}
          onClose={() => setCurrentAchievement(null)}
        />
      </div>
    </div>
  );
};

export default Game;
