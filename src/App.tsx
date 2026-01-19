import React, { useState, useEffect } from 'react';
import Game from './components/Game.tsx';
<<<<<<< HEAD
import GameModeSelection from './components/GameModeSelection.tsx';
import PuzzleGame from './components/PuzzleGame.tsx';
import PhysicsGame from './components/PhysicsGame.tsx';
import BattleGame from './components/BattleGame.tsx';

type GameMode = 'classic' | 'puzzle' | 'physics' | 'battle' | null;

function App() {
=======
import TestPage from './components/TestPage';
import GameModeSelection from './components/GameModeSelection.tsx';
import PuzzleGame from './components/PuzzleGame.tsx';
import PhysicsGame from './components/PhysicsGame.tsx';
import { FileText } from 'lucide-react';

type GameMode = 'classic' | 'puzzle' | 'physics' | null;

function App() {
  const [showTestPage, setShowTestPage] = useState(false);
>>>>>>> 505cc2729727df186e07ac9b447054aeddee4e08
  const [gameMode, setGameMode] = useState<GameMode>(null);

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

<<<<<<< HEAD
=======
  const toggleTestPage = () => {
    setShowTestPage(!showTestPage);
  };

>>>>>>> 505cc2729727df186e07ac9b447054aeddee4e08
  const renderGameMode = () => {
    switch (gameMode) {
      case 'classic':
        return <Game onBack={() => setGameMode(null)} />;
      case 'puzzle':
        return <PuzzleGame onBack={() => setGameMode(null)} />;
      case 'physics':
        return <PhysicsGame onBack={() => setGameMode(null)} />;
<<<<<<< HEAD
      case 'battle':
        return <BattleGame onBack={() => setGameMode(null)} />;
=======
>>>>>>> 505cc2729727df186e07ac9b447054aeddee4e08
      default:
        return <GameModeSelection onSelectMode={setGameMode} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
<<<<<<< HEAD
      {renderGameMode()}
=======
      {!showTestPage && (
        <button
          onClick={toggleTestPage}
          className="fixed top-4 left-4 z-50 p-3 rounded-full transition-all duration-300 flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white border border-gray-600 hover:scale-105 active:scale-95"
          aria-label="View test page"
        >
          <FileText size={20} />
          <span className="text-sm font-medium hidden sm:inline">Tests</span>
        </button>
      )}
      
      {showTestPage ? (
        <TestPage onBack={toggleTestPage} />
      ) : (
        renderGameMode()
      )}
>>>>>>> 505cc2729727df186e07ac9b447054aeddee4e08
    </div>
  );
}

export default App;
<<<<<<< HEAD

=======
>>>>>>> 505cc2729727df186e07ac9b447054aeddee4e08
