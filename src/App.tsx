import React, { useState, useEffect } from 'react';
import Game from './components/Game.tsx';
import GameModeSelection from './components/GameModeSelection.tsx';
import PuzzleGame from './components/PuzzleGame.tsx';
import PhysicsGame from './components/PhysicsGame.tsx';
import LevelEditor from './components/LevelEditor.tsx';
import BattleGame from './components/BattleGame.tsx';

type GameMode = 'classic' | 'puzzle' | 'physics' | 'battle' | 'creative' | null;

function App() {
  const [gameMode, setGameMode] = useState<GameMode>(null);

  // Auto-navigate to Battle mode if there's a room parameter in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      // Directly open Battle mode if joining via shared link
      setGameMode('battle');
    }
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
      case 'creative':
        return <LevelEditor onBack={() => setGameMode(null)} onPlay={() => setGameMode('classic')} />;
      default:
        // @ts-ignore - string compatibility
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
