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
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans">
      {renderContent()}
    </div>
  );
};

export default App;