<<<<<<< HEAD
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
    console.log('handleSelectMode called with mode:', mode);
    setCurrentMode(mode);
    setIsCreative(creative);
  };

  // Reset creative mode when going back to menu
  useEffect(() => {
    if (currentMode === 'menu') setIsCreative(false);
  }, [currentMode]);

  const renderContent = () => {
    console.log('renderContent called, currentMode:', currentMode);
    switch (currentMode) {
      case 'physics':
        return <PhysicsGame onBack={() => setCurrentMode('menu')} isCreative={isCreative} />;
      case 'classic':
        return <Game onBack={() => setCurrentMode('menu')} isCreative={isCreative} />;
      case 'puzzle':
        return <PuzzleGame onBack={() => setCurrentMode('menu')} isCreative={isCreative} />;
      case 'battle':
        console.log('Rendering BattleGame');
        return <BattleGame onBack={() => setCurrentMode('menu')} />;
      default:
        return <GameModeSelection onSelectMode={handleSelectMode} />;
=======
import React, { useState } from 'react';
import GameModeSelection from './components/GameModeSelection';
import PhysicsGame from './components/PhysicsGame';
// Assuming other game components exist or are placeholders
import TestPage from './components/TestPage'; 

// Placeholder for Classic/Puzzle if not provided in context, 
// but user likely has them. I'll use TestPage as a fallback or 
// assume the user will plug in their existing components.
// For this response, I'll focus on wiring Physics and Selection.

const App: React.FC = () => {
  const [currentMode, setCurrentMode] = useState<'menu' | 'classic' | 'puzzle' | 'physics'>('menu');

  const renderContent = () => {
    switch (currentMode) {
      case 'physics':
        return <PhysicsGame onBack={() => setCurrentMode('menu')} />;
      case 'classic':
        // Using TestPage as placeholder for Classic if actual component not in context
        // In real app, this would be <SnakeGame onBack={...} />
        return <TestPage onBack={() => setCurrentMode('menu')} />;
      case 'puzzle':
        // Placeholder
        return (
          <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
            <h1 className="text-3xl mb-4">Puzzle Mode</h1>
            <p>Coming soon...</p>
            <button onClick={() => setCurrentMode('menu')} className="mt-4 px-4 py-2 bg-blue-600 rounded">Back</button>
          </div>
        );
      default:
        return <GameModeSelection onSelectMode={setCurrentMode} />;
>>>>>>> 505cc2729727df186e07ac9b447054aeddee4e08
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      {renderContent()}
    </div>
  );
};

export default App;