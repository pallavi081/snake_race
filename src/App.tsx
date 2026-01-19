import React, { useState, useEffect } from 'react';
import Game from './components/Game.tsx';
import GameModeSelection from './components/GameModeSelection.tsx';
import PuzzleGame from './components/PuzzleGame.tsx';
import PhysicsGame from './components/PhysicsGame.tsx';
import BattleGame from './components/BattleGame.tsx';

type GameMode = 'classic' | 'puzzle' | 'physics' | 'battle' | null;

function App() {
  const [gameMode, setGameMode] = useState<GameMode>(null);

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const renderGameMode = () => {
    switch (gameMode) {
      case 'classic':
        return <Game onBack={() => setGameMode(null)} />;
      case 'puzzle':
        return <PuzzleGame onBack={() => setGameMode(null)} />;
      case 'physics':
        return <PhysicsGame onBack={() => setGameMode(null)} />;
      case 'battle':
        return <BattleGame onBack={() => setGameMode(null)} />;
      default:
        return <GameModeSelection onSelectMode={setGameMode} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {renderGameMode()}
    </div>
  );
}

export default App;
