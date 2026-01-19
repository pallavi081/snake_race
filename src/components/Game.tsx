import React, { useState } from 'react';
import { useSnakeGame } from '../hooks/useSnakeGame.ts';
import GameCanvas from './GameCanvas';
import MobileControls from './MobileControls';
import ScoreBoard from './ScoreBoard';
import GameInstructions from './GameInstructions';
import SoundToggle from './SoundToggle';
import PowerUpInfo from './PowerUpInfo';
import Settings from './Settings.tsx';
import { HelpCircle, Settings as SettingsIcon, ArrowLeft, Play, Pause } from 'lucide-react';
import { Difficulty } from '../types/game.ts';

interface GameProps {

  onBack: () => void;

}



const Game: React.FC<GameProps> = ({ onBack }) => {

  const { gameState, startGame, resetGame, changeDirection, soundEnabled, toggleSound, difficulty, setDifficulty, settings, updateSettings, isPaused, togglePause } = useSnakeGame();

  const [showInstructions, setShowInstructions] = useState(false);

  const [showSettings, setShowSettings] = useState(false);



  const handleDifficultyChange = (level: Difficulty) => {

    if (!gameState.gameStarted) {

      setDifficulty(level);

    }

  };



  return (

    <div className="flex flex-col items-center justify-center min-h-screen sm:p-4">

      <div className="w-full sm:max-w-md h-full sm:h-auto flex flex-col">

        {!gameState.gameStarted && (
        <div className="p-4">

          <div className="flex items-center justify-between mb-2">

            <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-700 text-white">

              <ArrowLeft size={20} />

            </button>

            <h1 className="text-3xl font-bold text-center text-white">

              Classic Mode

            </h1>

            <div className="w-8"></div>

          </div>





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



          {!gameState.gameStarted && (

            <div className="flex justify-center items-center gap-2 mb-4">

              {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map(level => (

                <button

                  key={level}

                  onClick={() => handleDifficultyChange(level)}

                  disabled={gameState.gameStarted}

                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${

                    difficulty === level

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
          
          <div className="flex justify-center mt-4">
            <button 
              onClick={startGame}
              className="flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-2xl transition-all hover:scale-105 shadow-lg"
            >
              <Play size={28} fill="currentColor" />
              Start Game
            </button>
          </div>

        </div>
        )}

        

        <div className="flex-grow flex items-center justify-center">

          {gameState.gameStarted && (
            <>
              <button onClick={onBack} className="absolute top-4 left-4 p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-white border border-gray-600 z-10">
                <ArrowLeft size={24} />
              </button>
              {!gameState.gameOver && (
                <button onClick={togglePause} className="absolute top-4 right-4 p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-white border border-gray-600 z-10">
                  {isPaused ? <Play size={24} /> : <Pause size={24} />}
                </button>
              )}
            </>
          )}
          <GameCanvas gameState={gameState} />

        </div>

        

        <MobileControls

          onDirectionChange={changeDirection}

          onStart={startGame}

          onRestart={resetGame}

          gameStarted={gameState.gameStarted}

          gameOver={gameState.gameOver}

        />

        {isPaused && !gameState.gameOver && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 backdrop-blur-sm">
            <div className="text-white text-4xl font-bold tracking-wider">
              PAUSED
            </div>
          </div>
        )}
        

        {showInstructions && (

          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">

            <div className="relative rounded-lg p-6 max-w-lg w-full bg-gray-900 border border-gray-700">

              <GameInstructions />

              <button 

                onClick={() => setShowInstructions(false)}

                className="absolute top-3 right-3 px-3 py-1 rounded-full bg-red-500 text-white hover:bg-red-600"

              >

                Close

              </button>

            </div>

          </div>

        )}



        {showSettings && (

          <Settings 

            onClose={() => setShowSettings(false)}

            settings={settings}

            onSettingsChange={updateSettings}

          />

        )}

      </div>

    </div>

  );

};





export default Game;
