import React, { useState, useEffect } from 'react';
import { Shield, Puzzle, Wind, BookOpen, X, Download, Swords, Github, Heart, Code, Trophy, ShoppingBag, Star, Calendar, Settings as SettingsIcon, LogIn, LogOut, User, Users, MessageCircle, Crown, MoreVertical, Palette, Sparkles, Skull, Target } from 'lucide-react';
import GameInstructions from './GameInstructions';
import Leaderboard from './Leaderboard';
import Shop from './Shop';
import Achievements from './Achievements';
import DailyChallenges from './DailyChallenges';
import Settings from './Settings';
import Tournaments from './Tournaments';
import Friends from './Friends';
import GlobalChat from './GlobalChat';
import PlayerProfile from './PlayerProfile';
import DailyRewards from './DailyRewards';
import BossBattle from './BossBattle';
import SkinCreator from './SkinCreator';
import SeasonalEvents from './SeasonalEvents';
import ZombieSurvival from './ZombieSurvival';
import AboutUs from './AboutUs';
import PrivacyPolicy from './PrivacyPolicy';
import TermsAndConditions from './TermsAndConditions';
import { storage } from '../utils/storage';
import { useAuth } from '../hooks/useAuth';
import { subscribeToFriendRequests } from '../utils/socialFirestore';

interface GameModeSelectionProps {
  onSelectMode: (mode: 'classic' | 'puzzle' | 'physics' | 'battle') => void;
}

const GameModeSelection: React.FC<GameModeSelectionProps> = ({ onSelectMode }) => {
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showShop, setShowShop] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showDailyChallenges, setShowDailyChallenges] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showTournaments, setShowTournaments] = useState(false);
  const [showFriends, setShowFriends] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showDailyRewards, setShowDailyRewards] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showBossBattle, setShowBossBattle] = useState(false);
  const [showSkinCreator, setShowSkinCreator] = useState(false);
  const [showSeasonalEvents, setShowSeasonalEvents] = useState(false);
  const [showZombieMode, setShowZombieMode] = useState(false);
  const [showAboutUs, setShowAboutUs] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [player, setPlayer] = useState(storage.getPlayer());
  const [requestCount, setRequestCount] = useState(0);

  // Firebase Auth
  const { user, loading: authLoading, signInWithGoogle, signOut, isAuthenticated } = useAuth();

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

    // Listen for real-time player data updates from cloud
    const handlePlayerUpdate = () => {
      setPlayer(storage.getPlayer());
    };
    window.addEventListener('playerDataUpdated', handlePlayerUpdate);

    return () => window.removeEventListener('playerDataUpdated', handlePlayerUpdate);
  }, []);

  // Listen for friend requests
  useEffect(() => {
    if (isAuthenticated && user?.uid) {
      const unsubscribe = subscribeToFriendRequests(user.uid, (requests) => {
        setRequestCount(requests.length);
      });
      return () => unsubscribe();
    } else {
      setRequestCount(0);
    }
  }, [isAuthenticated, user?.uid]);

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
      <div className="bg-gray-800 border-b border-gray-700 px-3 py-2 relative">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* User Profile / Sign In */}
            {isAuthenticated && user ? (
              <button
                onClick={() => setShowProfile(true)}
                className="flex items-center gap-2 hover:bg-gray-700/50 rounded-lg px-2 py-1 transition-colors"
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" className="w-7 h-7 rounded-full border-2 border-green-500" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-green-600 flex items-center justify-center">
                    <User size={14} />
                  </div>
                )}
                <span className="text-xs text-gray-300 hidden sm:block max-w-[60px] truncate">{user.displayName?.split(' ')[0] || 'Player'}</span>
              </button>
            ) : (
              <button
                onClick={signInWithGoogle}
                disabled={authLoading}
                className="flex items-center gap-1.5 px-2 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-all text-xs"
                title="Sign in with Google"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" className="w-4 h-4" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}
            <button onClick={() => setShowDailyRewards(true)} className="text-yellow-400 font-bold hover:bg-yellow-600/20 px-2 py-1 rounded-lg transition-colors text-sm" title="Daily Rewards">
              🪙 {player.coins}
            </button>
            <span className="text-orange-400 text-xs">🔥 {player.currentStreak}</span>
          </div>

          {/* Desktop: All Buttons Visible */}
          <div className="hidden md:flex items-center gap-1">
            <button onClick={() => setShowTournaments(true)} className="p-2 bg-amber-600/20 hover:bg-amber-600/40 rounded-lg transition-all" title="Tournament">
              <Crown size={18} className="text-amber-400" />
            </button>
            <button onClick={() => setShowBossBattle(true)} className="p-2 bg-orange-600/20 hover:bg-orange-600/40 rounded-lg transition-all" title="Boss Battle">
              <Skull size={18} className="text-orange-400" />
            </button>
            <button onClick={() => setShowSeasonalEvents(true)} className="p-2 bg-cyan-600/20 hover:bg-cyan-600/40 rounded-lg transition-all" title="Events">
              <Sparkles size={18} className="text-cyan-400" />
            </button>
            <button onClick={() => setShowSkinCreator(true)} className="p-2 bg-pink-600/20 hover:bg-pink-600/40 rounded-lg transition-all" title="Skin Creator">
              <Palette size={18} className="text-pink-400" />
            </button>
            <button onClick={() => setShowFriends(true)} className="p-2 bg-cyan-600/20 hover:bg-cyan-600/40 rounded-lg transition-all relative" title="Friends">
              <Users size={18} className="text-cyan-400" />
              {requestCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center animate-pulse border-2 border-gray-800">
                  {requestCount}
                </span>
              )}
            </button>
            <button onClick={() => setShowChat(true)} className="p-2 bg-green-600/20 hover:bg-green-600/40 rounded-lg transition-all" title="Chat">
              <MessageCircle size={18} className="text-green-400" />
            </button>
            <button onClick={() => setShowDailyChallenges(true)} className="p-2 bg-blue-600/20 hover:bg-blue-600/40 rounded-lg transition-all" title="Challenges">
              <Calendar size={18} className="text-blue-400" />
            </button>
            <button onClick={() => setShowLeaderboard(true)} className="p-2 bg-yellow-600/20 hover:bg-yellow-600/40 rounded-lg transition-all" title="Leaderboard">
              <Trophy size={18} className="text-yellow-400" />
            </button>
            <button onClick={() => setShowAchievements(true)} className="p-2 bg-purple-600/20 hover:bg-purple-600/40 rounded-lg transition-all" title="Achievements">
              <Star size={18} className="text-purple-400" />
            </button>
            <button onClick={() => setShowShop(true)} className="p-2 bg-emerald-600/20 hover:bg-emerald-600/40 rounded-lg transition-all" title="Shop">
              <ShoppingBag size={18} className="text-emerald-400" />
            </button>
            <button onClick={() => setShowSettings(true)} className="p-2 bg-gray-600/20 hover:bg-gray-600/40 rounded-lg transition-all" title="Settings">
              <SettingsIcon size={18} className="text-gray-400" />
            </button>
          </div>

          {/* Mobile: Key buttons + Three-Dot Menu */}
          <div className="flex md:hidden items-center gap-1">
            <button onClick={() => setShowLeaderboard(true)} className="p-2 bg-yellow-600/20 rounded-lg" title="Leaderboard">
              <Trophy size={16} className="text-yellow-400" />
            </button>
            <button onClick={() => setShowShop(true)} className="p-2 bg-emerald-600/20 rounded-lg" title="Shop">
              <ShoppingBag size={16} className="text-emerald-400" />
            </button>
            <div className="relative">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all"
                title="More"
              >
                <MoreVertical size={18} className="text-gray-300" />
              </button>

              {/* Mobile Dropdown Menu */}
              {showMobileMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowMobileMenu(false)} />
                  <div className="absolute right-0 top-full mt-2 w-48 bg-gray-800 border border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
                    <button onClick={() => { setShowTournaments(true); setShowMobileMenu(false); }} className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-700 text-left">
                      <Crown size={18} className="text-amber-400" /> Weekly Tournament
                    </button>
                    <button onClick={() => { setShowBossBattle(true); setShowMobileMenu(false); }} className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-700 text-left">
                      <Skull size={18} className="text-orange-400" /> Boss Battles
                    </button>
                    <button onClick={() => { setShowSeasonalEvents(true); setShowMobileMenu(false); }} className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-700 text-left">
                      <Sparkles size={18} className="text-cyan-400" /> Seasonal Events
                    </button>
                    <button onClick={() => { setShowSkinCreator(true); setShowMobileMenu(false); }} className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-700 text-left">
                      <Palette size={18} className="text-pink-400" /> Skin Creator
                    </button>
                    <button onClick={() => { setShowFriends(true); setShowMobileMenu(false); }} className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-700 text-left relative">
                      <Users size={18} className="text-cyan-400" /> Friends
                      {requestCount > 0 && (
                        <span className="absolute right-4 w-5 h-5 bg-red-500 rounded-full text-[10px] flex items-center justify-center animate-pulse border-2 border-gray-800">
                          {requestCount}
                        </span>
                      )}
                    </button>
                    <button onClick={() => { setShowChat(true); setShowMobileMenu(false); }} className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-700 text-left">
                      <MessageCircle size={18} className="text-green-400" /> Global Chat
                    </button>
                    <button onClick={() => { setShowDailyChallenges(true); setShowMobileMenu(false); }} className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-700 text-left">
                      <Calendar size={18} className="text-blue-400" /> Daily Challenges
                    </button>
                    <button onClick={() => { setShowAchievements(true); setShowMobileMenu(false); }} className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-700 text-left">
                      <Star size={18} className="text-purple-400" /> Achievements
                    </button>
                    <div className="border-t border-gray-700" />
                    <button onClick={() => { setShowSettings(true); setShowMobileMenu(false); }} className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-700 text-left">
                      <SettingsIcon size={18} className="text-gray-400" /> Settings & Data
                    </button>
                    {isAuthenticated && (
                      <button onClick={() => { signOut(); setShowMobileMenu(false); }} className="w-full px-4 py-3 flex items-center gap-3 hover:bg-red-900/50 text-left text-red-400">
                        <LogOut size={18} /> Sign Out
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sign-in Reminder for Guests */}
      {!isAuthenticated && (
        <div className="bg-indigo-600/20 border-y border-indigo-500/30 w-full animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-500 p-2 rounded-lg hidden sm:block">
                <LogIn size={18} className="text-white" />
              </div>
              <p className="text-sm font-medium text-indigo-100 italic">
                Guest Mode: <span className="text-white font-bold not-italic">Sign in</span> to save your coins, level-ups, and battle stats!
              </p>
            </div>
            <button
              onClick={signInWithGoogle}
              disabled={authLoading}
              className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-full text-xs font-bold transition-all shadow-lg hover:shadow-indigo-500/20 active:scale-95 whitespace-nowrap"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" className="w-3 h-3 invert" />
              Sign in Now
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="text-center mb-8 md:mb-12">

          <div className="relative inline-block mb-4 group">
            <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity rounded-full"></div>
            <img src="/logo.png" alt="Snake Race Logo" className="w-32 h-32 md:w-40 md:h-40 mx-auto relative z-10 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)] transform hover:scale-105 transition-transform duration-500" />
          </div>

          <h1 className="text-4xl md:text-6xl font-black mb-3 bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 text-transparent bg-clip-text drop-shadow-lg tracking-tight">Snake Race</h1>
          <p className="text-gray-400 text-sm md:text-lg font-medium tracking-wide">Choose Your Battle Arena</p>

          {/* Featured Hero Specials */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10 max-w-5xl w-full mx-auto">
            <div
              onClick={() => setShowBossBattle(true)}
              className="relative overflow-hidden group cursor-pointer rounded-2xl border-2 border-orange-500/30 hover:border-orange-500 transition-all bg-gradient-to-br from-orange-900/40 to-black p-1"
            >
              <div className="bg-orange-600 px-3 py-1 rounded-bl-xl absolute top-0 right-0 text-[10px] font-black z-20">EPIC BOSSES</div>
              <div className="p-4 flex items-center gap-4">
                <div className="bg-orange-500/20 p-3 rounded-xl"><Skull className="text-orange-500" /></div>
                <div>
                  <div className="font-black text-lg">BOSS BATTLE</div>
                  <div className="text-xs text-gray-400">Defeat the 5 Kings</div>
                </div>
              </div>
            </div>

            <div
              onClick={() => setShowZombieMode(true)}
              className="relative overflow-hidden group cursor-pointer rounded-2xl border-2 border-green-500/30 hover:border-green-500 transition-all bg-gradient-to-br from-green-900/40 to-black p-1"
            >
              <div className="bg-green-600 px-3 py-1 rounded-bl-xl absolute top-0 right-0 text-[10px] font-black z-20">SURVIVE</div>
              <div className="p-4 flex items-center gap-4">
                <div className="bg-green-500/20 p-3 rounded-xl"><Target className="text-green-500" /></div>
                <div>
                  <div className="font-black text-lg">ZOMBIE SURVIVAL</div>
                  <div className="text-xs text-gray-400">Outrun the Undead</div>
                </div>
              </div>
            </div>

            <div
              onClick={() => setShowSeasonalEvents(true)}
              className="relative overflow-hidden group cursor-pointer rounded-2xl border-2 border-cyan-500/30 hover:border-cyan-500 transition-all bg-gradient-to-br from-cyan-900/40 to-black p-1"
            >
              <div className="bg-cyan-600 px-3 py-1 rounded-bl-xl absolute top-0 right-0 text-[10px] font-black z-20">FESTIVALS</div>
              <div className="p-4 flex items-center gap-4">
                <div className="bg-cyan-500/20 p-3 rounded-xl"><Sparkles className="text-cyan-400" /></div>
                <div>
                  <div className="font-black text-lg">SEASONAL EVENTS</div>
                  <div className="text-xs text-gray-400">Diwali, Christmas & More</div>
                </div>
              </div>
            </div>
          </div>

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

          <div className="relative p-4 md:p-6 rounded-xl border-2 border-gray-700 hover:border-red-500 bg-gray-800 cursor-pointer hover:scale-105 transition-all group/battle" onClick={() => onSelectMode('battle')}>
            <div className="absolute -top-3 -right-2 bg-gradient-to-r from-orange-600 via-red-600 to-orange-600 px-3 py-1 rounded-full text-[10px] font-black shadow-lg shadow-red-900/40 border border-orange-400/30 animate-pulse z-30 flex items-center gap-1 group-hover/battle:scale-110 transition-transform">
              🔥 NEW: BOOM BLASTER
            </div>
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
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 pt-4 border-t border-gray-700/50 mt-4">
              <button onClick={() => setShowAboutUs(true)} className="text-gray-500 hover:text-white text-xs transition-colors">About Us</button>
              <span className="text-gray-700 text-xs hidden sm:inline">•</span>
              <button onClick={() => setShowTerms(true)} className="text-gray-500 hover:text-white text-xs transition-colors">Terms</button>
              <span className="text-gray-700 text-xs hidden sm:inline">•</span>
              <button onClick={() => setShowPrivacy(true)} className="text-gray-500 hover:text-white text-xs transition-colors">Privacy Policy</button>
            </div>
          </div>

          {/* Desktop Footer */}
          <div className="hidden md:grid md:grid-cols-3 gap-8 text-sm">
            <div>
              <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                <Code size={16} className="text-purple-400" /> Developer
              </h4>
              <p className="text-gray-400 mb-2">Pallavi Kumari</p>
              <a href="https://github.com/pallavi081" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors mb-2">
                <Github size={16} /> github.com/pallavi081
              </a>
              <div className="flex flex-col gap-1">
                <button onClick={() => setShowAboutUs(true)} className="text-gray-500 hover:text-blue-400 text-xs text-left">About the Developer</button>
              </div>
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
              <div className="flex gap-4 mt-4 text-xs">
                <button onClick={() => setShowTerms(true)} className="text-gray-500 hover:text-white transition-colors">Terms</button>
                <button onClick={() => setShowPrivacy(true)} className="text-gray-500 hover:text-white transition-colors">Privacy</button>
              </div>
            </div>
          </div>

          <div className="text-center mt-6 pt-4 border-t border-gray-700 text-xs text-gray-500">
            © 2025 Snake Race. Made with <Heart size={10} className="inline text-red-500" fill="currentColor" /> by Pallavi Kumari
          </div>
        </div>
      </footer>

      {/* Modals */}
      {
        showHowToPlay && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="bg-gray-800 p-6 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-gray-700 relative">
              <button onClick={() => setShowHowToPlay(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                <X size={24} />
              </button>
              <GameInstructions />
            </div>
          </div>
        )
      }

      {showLeaderboard && <Leaderboard onClose={() => setShowLeaderboard(false)} />}
      {showShop && <Shop onClose={() => { setShowShop(false); refreshPlayer(); }} onPurchase={refreshPlayer} />}
      {showAchievements && <Achievements onClose={() => setShowAchievements(false)} />}
      {showDailyChallenges && <DailyChallenges onClose={() => setShowDailyChallenges(false)} />}
      {showSettings && <Settings onClose={() => setShowSettings(false)} onImport={refreshPlayer} />}
      {
        showTournaments && (
          <Tournaments
            onClose={() => setShowTournaments(false)}
            userId={user?.uid}
            userName={user?.displayName || undefined}
            userPhoto={user?.photoURL || undefined}
          />
        )
      }
      {
        showFriends && (
          <Friends
            onClose={() => setShowFriends(false)}
            userId={user?.uid}
            userName={user?.displayName || undefined}
            userPhoto={user?.photoURL || undefined}
          />
        )
      }
      {
        showChat && (
          <GlobalChat
            onClose={() => setShowChat(false)}
            userId={user?.uid}
            userName={user?.displayName || undefined}
            userPhoto={user?.photoURL || undefined}
          />
        )
      }
      {
        showProfile && (
          <PlayerProfile
            onClose={() => setShowProfile(false)}
            userId={user?.uid}
            userName={user?.displayName || undefined}
            userPhoto={user?.photoURL || undefined}
          />
        )
      }
      {
        showDailyRewards && (
          <DailyRewards
            onClose={() => setShowDailyRewards(false)}
            onClaim={refreshPlayer}
          />
        )
      }
      {
        showBossBattle && (
          <div className="fixed inset-0 z-50 bg-gray-900 overflow-y-auto">
            <BossBattle onBack={() => setShowBossBattle(false)} />
          </div>
        )
      }
      {
        showSkinCreator && (
          <div className="fixed inset-0 z-50 bg-gray-900 overflow-y-auto">
            <SkinCreator onBack={() => setShowSkinCreator(false)} />
          </div>
        )
      }
      {
        showSeasonalEvents && (
          <div className="fixed inset-0 z-50 bg-gray-900 overflow-y-auto border-t border-gray-800">
            <SeasonalEvents onBack={() => setShowSeasonalEvents(false)} />
          </div>
        )
      }
      {
        showZombieMode && (
          <div className="fixed inset-0 z-50 bg-black overflow-y-auto">
            <ZombieSurvival onBack={() => setShowZombieMode(false)} />
          </div>
        )
      }

      {/* Legal Modals */}
      {
        showAboutUs && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm">
            <div className="bg-gray-800 p-6 rounded-2xl max-w-xl w-full max-h-[85vh] overflow-y-auto border border-gray-700 relative shadow-2xl">
              <button onClick={() => setShowAboutUs(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white bg-gray-700/50 p-1 rounded-lg">
                <X size={20} />
              </button>
              <AboutUs />
            </div>
          </div>
        )
      }

      {
        showPrivacy && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm">
            <div className="bg-gray-800 p-6 rounded-2xl max-w-xl w-full max-h-[85vh] overflow-y-auto border border-gray-700 relative shadow-2xl">
              <button onClick={() => setShowPrivacy(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white bg-gray-700/50 p-1 rounded-lg">
                <X size={20} />
              </button>
              <PrivacyPolicy />
            </div>
          </div>
        )
      }

      {
        showTerms && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm">
            <div className="bg-gray-800 p-6 rounded-2xl max-w-xl w-full max-h-[85vh] overflow-y-auto border border-gray-700 relative shadow-2xl">
              <button onClick={() => setShowTerms(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white bg-gray-700/50 p-1 rounded-lg">
                <X size={20} />
              </button>
              <TermsAndConditions />
            </div>
          </div>
        )
      }
    </div>
  );
};

export default GameModeSelection;
