import React, { useState, useEffect } from 'react';
import GameModeSelection from './GameModeSelection';
import PhysicsGame from './PhysicsGame';
import Game from './Game';
import PuzzleGame from './PuzzleGame';
import BattleGame from './BattleGame';

const App: React.FC = () => {
  const [currentMode, setCurrentMode] = useState<'menu' | 'classic' | 'puzzle' | 'physics' | 'battle'>('menu');
  const [isCreative, setIsCreative] = useState(false);

  const handleSelectMode = (mode: 'classic' | 'puzzle' | 'physics' | 'battle', creative: boolean = false) => {
    setCurrentMode(mode);
    setIsCreative(creative);
  };

  useEffect(() => {
    if (currentMode === 'menu') setIsCreative(false);
  }, [currentMode]);

  const renderContent = () => {
    switch (currentMode) {
      case 'physics':
        return <PhysicsGame onBack={() => setCurrentMode('menu')} isCreative={isCreative} />;
      case 'classic':
        return <Game onBack={() => setCurrentMode('menu')} isCreative={isCreative} />;
      case 'puzzle':
        return <PuzzleGame onBack={() => setCurrentMode('menu')} isCreative={isCreative} />;
      case 'battle':
        return <BattleGame onBack={() => setCurrentMode('menu')} />;
      default:
        return <GameModeSelection onSelectMode={handleSelectMode} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      {renderContent()}
    </div>
  );
};

export default App;