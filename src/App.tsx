import { useState, useEffect } from 'react';
import Game from './components/Game.tsx';
import GameModeSelection from './components/GameModeSelection.tsx';
import PuzzleGame from './components/PuzzleGame.tsx';
import PhysicsGame from './components/PhysicsGame.tsx';
import LevelEditor from './components/LevelEditor.tsx';
import BattleGame from './components/BattleGame.tsx';
import AdminPanel from './components/AdminPanel.tsx';
import { getGlobalSettings } from './utils/cloudStorage';
import { AlertTriangle, Megaphone } from 'lucide-react';

type GameMode = 'classic' | 'puzzle' | 'physics' | 'battle' | 'creative' | 'admin' | null;

function App() {
  const [gameMode, setGameMode] = useState<GameMode>(() => {
    // Synchronous initial route detection
    const params = new URLSearchParams(window.location.search);
    if (params.get('room')) return 'battle';
    if (window.location.pathname === '/admin') return 'admin';
    return null;
  });

  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const s = await getGlobalSettings();
        setSettings(s);
      } catch (e) {
        console.error('Failed to fetch settings');
      }
    };
    fetchSettings();

    // Re-check settings every 2 minutes for maintenance mode or announcements
    const interval = setInterval(fetchSettings, 120000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    console.log('[App] GameMode changed:', gameMode, 'Path:', window.location.pathname);

    // Prevent fallback if we are on /admin and gameMode is already admin
    if (window.location.pathname === '/admin' && gameMode === null) {
      setGameMode('admin');
      return;
    }

    if (gameMode === 'admin' && window.location.pathname !== '/admin') {
      console.log('[App] Pushing /admin to history');
      window.history.pushState(null, '', '/admin');
    }
  }, [gameMode]);

  console.log('Current Game Mode:', gameMode);

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
      case 'admin':
        return <AdminPanel />;
      default:
        // @ts-ignore - string compatibility
        return <GameModeSelection onSelectMode={setGameMode} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 relative">
      {/* Global Announcement */}
      {settings?.announcement && gameMode !== 'admin' && (
        <div className="fixed top-0 left-0 right-0 bg-indigo-600 text-white p-2 text-center text-xs font-bold z-[100] animate-pulse flex items-center justify-center gap-2">
          <Megaphone size={14} /> {settings.announcement}
        </div>
      )}

      {/* Maintenance Overlay */}
      {settings?.maintenanceMode && gameMode !== 'admin' && (
        <div className="fixed inset-0 bg-gray-900/95 backdrop-blur-sm z-[200] flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-orange-600 p-6 rounded-full mb-8 animate-bounce">
            <AlertTriangle size={64} className="text-white" />
          </div>
          <h1 className="text-5xl font-black text-white mb-4">System Maintenance</h1>
          <p className="text-gray-400 max-w-md text-lg leading-relaxed">
            We are currently performing scheduled maintenance to improve your experience.
            We'll be back online shortly!
          </p>
          <div className="mt-12 text-gray-600 text-sm font-mono uppercase tracking-widest">
            Please check back soon 🐍
          </div>
        </div>
      )}

      {renderGameMode()}
    </div>
  );
}

export default App;
