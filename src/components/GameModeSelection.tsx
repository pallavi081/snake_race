import React, { useState, useEffect } from 'react';
import { Shield, Puzzle, Wind, BookOpen, X, Download, Swords, Github, Heart, Code, Trophy, ShoppingBag, Star, Calendar, Settings } from 'lucide-react';
import GameInstructions from './GameInstructions';
import Leaderboard from './Leaderboard';
import Shop from './Shop';
import Achievements from './Achievements';
import DailyChallenges from './DailyChallenges';
import DataSync from './DataSync';
import { storage } from '../utils/storage';

interface GameModeSelectionProps {
  onSelectMode: (mode: 'classic' | 'puzzle' | 'physics' | 'battle') => void;
}

const GameModeSelection: React.FC<GameModeSelectionProps> = ({ onSelectMode }) => {
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showDailyChallenges, setShowDailyChallenges] = useState(false);
  const [showDataSync, setShowDataSync] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [player, setPlayer] = useState(storage.getPlayer());

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  useEffect(() => {
    // Update streak on load
    storage.updateStreak();
    setPlayer(storage.getPlayer());
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
  };

  const refreshPlayer = () => setPlayer(storage.getPlayer());

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      {/* Top Bar */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-2">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-yellow-400 font-bold">🪙 {player.coins}</span>
            <span className="text-orange-400 text-sm">🔥 {player.currentStreak} days</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDailyChallenges(true)}
              className="p-2 bg-blue-600/20 hover:bg-blue-600/40 rounded-lg transition-all"
              title="Daily Challenges"
            >
              <Calendar size={18} className="text-blue-400" />
            </button>
            <button
              onClick={() => setShowLeaderboard(true)}
              className="p-2 bg-yellow-600/20 hover:bg-yellow-600/40 rounded-lg transition-all"
              title="Leaderboard"
            >
              <Trophy size={18} className="text-yellow-400" />
            </button>
            <button
              onClick={() => setShowAchievements(true)}
              className="p-2 bg-purple-600/20 hover:bg-purple-600/40 rounded-lg transition-all"
              title="Achievements"
            >
              <Star size={18} className="text-purple-400" />
            </button>
            <button
              onClick={() => setShowShop(true)}
              className="p-2 bg-green-600/20 hover:bg-green-600/40 rounded-lg transition-all"
              title="Shop"
            >
              <ShoppingBag size={18} className="text-green-400" />
            </button>
            <button
              onClick={() => setShowDataSync(true)}
              className="p-2 bg-gray-600/20 hover:bg-gray-600/40 rounded-lg transition-all"
              title="Settings & Data"
            >
              <Settings size={18} className="text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="text-center mb-8 md:mb-12">

          <div className="relative inline-block mb-4 group">
            <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity rounded-full"></div>
            <img src="/logo.png" alt="Snake Race Logo" className="w-32 h-32 md:w-40 md:h-40 mx-auto relative z-10 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)] transform hover:scale-105 transition-transform duration-500" />
          </div>

          <h1 className="text-4xl md:text-6xl font-black mb-3 bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 text-transparent bg-clip-text drop-shadow-lg tracking-tight">Snake Race</h1>
          <p className="text-gray-400 text-sm md:text-lg font-medium tracking-wide">Choose Your Battle Arena</p>

          <div className="flex gap-3 justify-center mt-4 flex-wrap">
            <button
              onClick={() => setShowHowToPlay(true)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-full border border-gray-700 text-sm"
            >
              <BookOpen size={16} /> How to Play
            </button>

            {deferredPrompt && (
              <button
                onClick={handleInstallClick}
                className="animate-pulse flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 rounded-full text-sm font-bold shadow-lg transform hover:scale-105 transition-all border border-blue-400/30"
              >
                <Download size={18} /> Install Game
              </button>
            )}
          </div>
        </div>

        {/* Game Modes */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 max-w-4xl w-full">
          <div className="p-4 md:p-6 rounded-xl border-2 border-gray-700 hover:border-blue-500 bg-gray-800 cursor-pointer hover:scale-105 transition-all" onClick={() => onSelectMode('classic')}>
            <Shield size={32} className="text-blue-500 mb-2 mx-auto md:mx-0" />
            <h2 className="text-lg md:text-xl font-bold text-center md:text-left">Classic</h2>
            <p className="text-gray-400 text-xs md:text-sm hidden md:block mt-2">The timeless snake experience</p>
          </div>

          <div className="p-4 md:p-6 rounded-xl border-2 border-gray-700 hover:border-green-500 bg-gray-800 cursor-pointer hover:scale-105 transition-all" onClick={() => onSelectMode('puzzle')}>
            <Puzzle size={32} className="text-green-500 mb-2 mx-auto md:mx-0" />
            <h2 className="text-lg md:text-xl font-bold text-center md:text-left">Puzzle</h2>
            <p className="text-gray-400 text-xs md:text-sm hidden md:block mt-2">Solve challenging puzzles</p>
          </div>

          <div className="p-4 md:p-6 rounded-xl border-2 border-gray-700 hover:border-yellow-500 bg-gray-800 cursor-pointer hover:scale-105 transition-all" onClick={() => onSelectMode('physics')}>
            <Wind size={32} className="text-yellow-500 mb-2 mx-auto md:mx-0" />
            <h2 className="text-lg md:text-xl font-bold text-center md:text-left">Physics</h2>
            <p className="text-gray-400 text-xs md:text-sm hidden md:block mt-2">Gravity & physics mechanics</p>
          </div>

          <div className="p-4 md:p-6 rounded-xl border-2 border-gray-700 hover:border-red-500 bg-gray-800 cursor-pointer hover:scale-105 transition-all" onClick={() => onSelectMode('battle')}>
            <Swords size={32} className="text-red-500 mb-2 mx-auto md:mx-0" />
            <h2 className="text-lg md:text-xl font-bold text-center md:text-left">Battle</h2>
            <p className="text-gray-400 text-xs md:text-sm hidden md:block mt-2">Multiplayer battle royale</p>
          </div>

          <div className="p-4 md:p-6 rounded-xl border-2 border-gray-700 hover:border-purple-500 bg-gray-800 cursor-pointer hover:scale-105 transition-all" onClick={() => onSelectMode('creative' as any)}>
            <div className="text-purple-500 mb-2 mx-auto md:mx-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" /></svg>
            </div>
            <h2 className="text-lg md:text-xl font-bold text-center md:text-left">Creative</h2>
            <p className="text-gray-400 text-xs md:text-sm hidden md:block mt-2">Build & Play Custom Maps</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 flex gap-4 text-sm text-gray-400">
          <span>🎮 {player.gamesPlayed} games</span>
          <span>🏆 {player.wins} wins</span>
          <span>💀 {player.totalKills} kills</span>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 py-6 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Mobile Footer */}
          <div className="md:hidden text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-sm">
              <span className="text-gray-400">Made with</span>
              <Heart size={14} className="text-red-500" fill="currentColor" />
              <span className="text-gray-400">by</span>
              <a href="https://github.com/pallavi081" target="_blank" rel="noopener noreferrer" className="text-blue-400 font-medium hover:underline">
                Pallavi Kumari
              </a>
            </div>
            <div className="flex justify-center gap-4 text-xs text-gray-500">
              <span>React</span>
              <span>•</span>
              <span>TypeScript</span>
              <span>•</span>
              <span>TailwindCSS</span>
            </div>
            <a href="https://github.com/pallavi081" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-gray-400 hover:text-white text-sm">
              <Github size={16} /> GitHub
            </a>
          </div>

          {/* Desktop Footer */}
          <div className="hidden md:grid md:grid-cols-3 gap-8 text-sm">
            <div>
              <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                <Code size={16} className="text-purple-400" /> Developer
              </h4>
              <p className="text-gray-400 mb-2">Pallavi Kumari</p>
              <a href="https://github.com/pallavi081" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors">
                <Github size={16} /> github.com/pallavi081
              </a>
            </div>

            <div>
              <h4 className="font-bold text-white mb-3">🎮 Game Modes</h4>
              <ul className="space-y-1 text-gray-400">
                <li className="flex items-center gap-2"><Shield size={12} className="text-blue-500" /> Classic Mode</li>
                <li className="flex items-center gap-2"><Puzzle size={12} className="text-green-500" /> Puzzle Mode</li>
                <li className="flex items-center gap-2"><Wind size={12} className="text-yellow-500" /> Physics Mode</li>
                <li className="flex items-center gap-2"><Swords size={12} className="text-red-500" /> Battle Royale</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-3">⚡ Built With</h4>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-gray-700 rounded text-xs text-blue-400">React</span>
                <span className="px-2 py-1 bg-gray-700 rounded text-xs text-blue-300">TypeScript</span>
                <span className="px-2 py-1 bg-gray-700 rounded text-xs text-cyan-400">TailwindCSS</span>
                <span className="px-2 py-1 bg-gray-700 rounded text-xs text-yellow-400">Vite</span>
                <span className="px-2 py-1 bg-gray-700 rounded text-xs text-green-400">PWA</span>
              </div>
            </div>
          </div>

          <div className="text-center mt-6 pt-4 border-t border-gray-700 text-xs text-gray-500">
            © 2025 Snake Race. Made with <Heart size={10} className="inline text-red-500" fill="currentColor" /> by Pallavi Kumari
          </div>
        </div>
      </footer>

      {/* Modals */}
      {showHowToPlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-gray-800 p-6 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-gray-700 relative">
            <button onClick={() => setShowHowToPlay(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
              <X size={24} />
            </button>
            <GameInstructions />
          </div>
        </div>
      )}

      {showLeaderboard && <Leaderboard onClose={() => setShowLeaderboard(false)} />}
      {showShop && <Shop onClose={() => { setShowShop(false); refreshPlayer(); }} onPurchase={refreshPlayer} />}
      {showAchievements && <Achievements onClose={() => setShowAchievements(false)} />}
      {showDailyChallenges && <DailyChallenges onClose={() => setShowDailyChallenges(false)} />}
      {showDataSync && <DataSync onClose={() => setShowDataSync(false)} onImport={refreshPlayer} />}
    </div>
  );
};

export default GameModeSelection;
