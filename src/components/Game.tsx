import React, { useState } from 'react';
import { useSnakeGame } from '../hooks/useSnakeGame.ts';
import GameCanvas from './GameCanvas';
import MobileControls from './MobileControls';
import ScoreBoard from './ScoreBoard';
import GameInstructions from './GameInstructions';
import SoundToggle from './SoundToggle';
import PowerUpInfo from './PowerUpInfo';
import { HelpCircle } from 'lucide-react';

interface GameProps {
  isDarkMode: boolean;
}

const Game: React.FC<GameProps> = ({ isDarkMode }) => {
  const { gameState, startGame, resetGame, changeDirection, soundEnabled, toggleSound } = useSnakeGame();
  const [showInstructions, setShowInstructions] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md">
        <h1 className={`text-3xl font-bold text-center mb-2 ${
          isDarkMode ? 'text-white' : 'text-gray-800'
        }`}>
          Snake Game
        </h1>

        <div className="flex justify-center items-center gap-4 mb-4">
          <SoundToggle soundEnabled={soundEnabled} onToggle={toggleSound} isDarkMode={isDarkMode} />
          <button 
            onClick={() => setShowInstructions(true)} 
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${isDarkMode ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
          >
            <HelpCircle size={20} />
            How to Play
          </button>
        </div>
        
        <ScoreBoard 
          score={gameState.score} 
          highScore={gameState.highScore}
          level={gameState.level}
          combo={gameState.combo}
          isDarkMode={isDarkMode}
        />
        
        <PowerUpInfo 
          activePowerUp={gameState.activePowerUp}
          powerUpEndTime={gameState.powerUpEndTime}
          isDarkMode={isDarkMode}
        />
        
        <div className="flex justify-center">
          <GameCanvas gameState={gameState} isDarkMode={isDarkMode} />
        </div>
        
        <MobileControls
          onDirectionChange={changeDirection}
          onStart={startGame}
          onRestart={resetGame}
          gameStarted={gameState.gameStarted}
          gameOver={gameState.gameOver}
          isDarkMode={isDarkMode}
        />
        
        {showInstructions && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`relative rounded-lg p-6 max-w-lg w-full ${isDarkMode ? 'bg-gray-900 border border-gray-700' : 'bg-white'}`}>
              <GameInstructions isDarkMode={isDarkMode} />
              <button 
                onClick={() => setShowInstructions(false)}
                className={`absolute top-3 right-3 px-3 py-1 rounded-full ${isDarkMode ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-red-500 text-white hover:bg-red-600'}`}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Game;
