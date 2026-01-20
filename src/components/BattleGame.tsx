
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play, Users, Copy, Share2, Loader2, Lock, Globe, Clock, Skull, Eye } from 'lucide-react';
import { useBattleGame, SNAKE_COLORS } from './useBattleGame';
import BattleCanvas from './BattleCanvas';
import SwipeControls from './SwipeControls';
import { Direction } from '../types/game';
import storage from '../utils/storage';
import { getThemeById } from '../data/skins';
import AchievementToast from './AchievementToast';
import { Achievement } from '../data/achievements';

interface BattleGameProps {
  onBack: () => void;
}

const BattleGame: React.FC<BattleGameProps> = ({ onBack }) => {
  const { gameState, changeDirection, createRoom, joinRoom, findQuickMatch, activateNovaMode, startGame, resetGame, unlockedAchievements, clearAchievements } = useBattleGame();
  const [playerName, setPlayerName] = useState('');
  const [selectedColor, setSelectedColor] = useState(SNAKE_COLORS[0].color);
  const [inputRoomId, setInputRoomId] = useState('');
  const [mode, setMode] = useState<'name' | 'menu' | 'lobby' | 'game'>('name');
  const [copied, setCopied] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [joiningRoomId, setJoiningRoomId] = useState<string | null>(null);

  // Achievement Queue
  const [achievementQueue, setAchievementQueue] = useState<Achievement[]>([]);
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);

  // Elimination Toast Queue
  const [eliminationToasts, setEliminationToasts] = useState<{ id: string; name: string; killedBy?: string }[]>([]);
  const [lastEliminationCount, setLastEliminationCount] = useState(0);

  // Get theme from storage
  const selectedTheme = storage.getPlayer().selectedTheme;
  const theme = getThemeById(selectedTheme);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      const roomCode = roomParam.toUpperCase();
      setInputRoomId(roomCode);
      setJoiningRoomId(roomCode); // Mark that we're joining via link
    }
  }, []);

  useEffect(() => {
    if (gameState.gameStarted) setMode('game');
  }, [gameState.gameStarted]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (mode === 'game' && e.code === 'Space') {
        activateNovaMode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, activateNovaMode]);

  // Handle new achievements
  useEffect(() => {
    if (unlockedAchievements && unlockedAchievements.length > 0) {
      setAchievementQueue(prev => [...prev, ...unlockedAchievements]);
      clearAchievements();
    }
  }, [unlockedAchievements, clearAchievements]);

  // Process queue
  useEffect(() => {
    if (!currentAchievement && achievementQueue.length > 0) {
      setCurrentAchievement(achievementQueue[0]);
      setAchievementQueue(prev => prev.slice(1));
    }
  }, [achievementQueue, currentAchievement]);

  // Track eliminations and show toasts
  useEffect(() => {
    if (gameState.eliminatedPlayers.length > lastEliminationCount) {
      const newEliminations = gameState.eliminatedPlayers.slice(lastEliminationCount);
      newEliminations.forEach(elim => {
        // Don't show toast for self
        if (elim.id !== gameState.myId) {
          setEliminationToasts(prev => [...prev, elim]);
          // Auto-remove toast after 3 seconds
          setTimeout(() => {
            setEliminationToasts(prev => prev.filter(t => t.id !== elim.id));
          }, 3000);
        }
      });
      setLastEliminationCount(gameState.eliminatedPlayers.length);
    }
  }, [gameState.eliminatedPlayers, lastEliminationCount, gameState.myId]);

  const handleSwipe = (direction: Direction) => changeDirection(direction);

  const handleNameSubmit = () => {
    if (!playerName.trim()) {
      alert('Please enter your name');
      return;
    }

    // If we have a room to join from URL, skip menu and join directly
    if (joiningRoomId) {
      const p = storage.getPlayer();
      joinRoom(playerName, selectedColor, joiningRoomId, p.selectedHat, p.selectedTrail, p.selectedSkin);
      setMode('lobby');
      // Clear URL param after joining
      window.history.replaceState({}, '', window.location.pathname);
    } else {
      setMode('menu');
    }
  };

  const handleCreateRoom = () => {
    const p = storage.getPlayer();
    createRoom(playerName, selectedColor, isPrivate, p.selectedHat, p.selectedTrail, p.selectedSkin);
    setMode('lobby');
  };

  const handleQuickMatch = () => {
    if (!playerName.trim()) {
      alert('Please enter your name');
      return;
    }
    const p = storage.getPlayer();
    findQuickMatch(playerName, selectedColor, p.selectedHat, p.selectedTrail, p.selectedSkin);
    setMode('lobby');
  };
  const handleJoinRoom = () => {
    if (!inputRoomId.trim()) {
      alert('Please enter a Room ID');
      return;
    }
    const p = storage.getPlayer();
    joinRoom(playerName, selectedColor, inputRoomId.toUpperCase(), p.selectedHat, p.selectedTrail, p.selectedSkin);
    setMode('lobby');
  };

  const copyInviteLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?room=${gameState.roomId}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareInvite = async () => {
    const url = `${window.location.origin}${window.location.pathname}?room=${gameState.roomId}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Join my Snake Battle!', text: `Join my Battle Royale! Room: ${gameState.roomId}`, url });
      } catch { copyInviteLink(); }
    } else {
      copyInviteLink();
    }
  };

  const handlePlayAgain = () => { resetGame(); setMode('lobby'); };

  const mySnake = gameState.snakes.find(s => s.id === gameState.myId);

  // Only show connecting screen when actually connecting
  if (gameState.connectionStatus === 'connecting') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900">
        <Loader2 size={40} className="animate-spin text-blue-500 mb-4" />
        <p className="text-white">Connecting to room...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen p-3 bg-gray-900 text-white relative">
      {/* Header */}
      <div className="w-full max-w-lg mb-3 flex items-center justify-between">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-700">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold flex items-center gap-2">
          Battle Royale <span className="text-[10px] bg-red-600 px-1.5 py-0.5 rounded">LIVE</span>
        </h1>
        <div className="w-8"></div>
      </div>

      {/* Name & Color Entry */}
      {mode === 'name' && (
        <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 w-full max-w-sm">
          <h2 className="text-2xl font-bold mb-1 text-center">Enter Arena</h2>
          <p className="text-gray-400 text-center text-sm mb-4">Choose your name & color</p>

          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Your Name</label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg p-2.5 text-white focus:border-green-500 outline-none"
                placeholder="SnakeMaster"
                maxLength={15}
                autoFocus
              />
            </div>

            {/* Color Picker */}
            <div>
              <label className="block text-xs text-gray-400 mb-2">Snake Color</label>
              <div className="grid grid-cols-4 gap-2">
                {SNAKE_COLORS.map((c) => (
                  <button
                    key={c.color}
                    onClick={() => setSelectedColor(c.color)}
                    className={`w-full aspect-square rounded-lg transition-all ${selectedColor === c.color
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-800 scale-110'
                      : 'hover:scale-105'
                      }`}
                    style={{ backgroundColor: c.color }}
                    title={c.name}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={handleNameSubmit}
              className="w-full bg-green-600 hover:bg-green-500 py-2.5 rounded-lg font-bold transition-all"
            >
              Continue →
            </button>
          </div>
        </div>
      )}

      {/* Menu */}
      {mode === 'menu' && (
        <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 w-full max-w-sm">
          <h2 className="text-xl font-bold mb-1 text-center">Welcome, {playerName}!</h2>
          <p className="text-gray-400 text-center text-xs mb-4">Create or join a battle</p>

          <div className="space-y-3">
            {/* Room Type */}
            <div className="bg-gray-900 p-3 rounded-lg">
              <label className="block text-xs text-gray-400 mb-2">Room Type</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsPrivate(false)}
                  className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-sm font-medium ${!isPrivate ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'
                    }`}
                >
                  <Globe size={14} /> Public
                </button>
                <button
                  onClick={() => setIsPrivate(true)}
                  className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-sm font-medium ${isPrivate ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-400'
                    }`}
                >
                  <Lock size={14} /> Private
                </button>
              </div>
            </div>

            <button
              onClick={handleCreateRoom}
              className={`w-full py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 ${isPrivate ? 'bg-purple-600 hover:bg-purple-500' : 'bg-blue-600 hover:bg-blue-500'
                }`}
            >
              <Users size={18} /> Create Room
            </button>

            <button
              onClick={handleQuickMatch}
              className="w-full py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 rounded-lg font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-900/20"
            >
              <Globe size={18} /> Quick Play
            </button>

            <div className="flex items-center gap-2 text-gray-500 text-xs">
              <div className="flex-1 h-px bg-gray-700"></div>
              OR JOIN
              <div className="flex-1 h-px bg-gray-700"></div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={inputRoomId}
                onChange={(e) => setInputRoomId(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
                className="flex-1 bg-gray-900 border border-gray-600 rounded-lg p-2 text-center uppercase font-mono tracking-wider"
                placeholder="ROOM ID"
                maxLength={6}
              />
              <button
                onClick={handleJoinRoom}
                className="bg-green-600 hover:bg-green-500 px-4 rounded-lg font-bold"
              >
                Join
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lobby */}
      {mode === 'lobby' && !gameState.gameStarted && (
        <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 w-full max-w-sm text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <h2 className="text-xl font-bold">Battle Lobby</h2>
            {gameState.isPrivate && <span className="text-[10px] bg-purple-600 px-1.5 py-0.5 rounded flex items-center gap-0.5"><Lock size={10} />Private</span>}
          </div>

          <div className="bg-gray-900 p-3 rounded-lg mb-4">
            <div className="text-[10px] text-gray-400">Room Code</div>
            <div className="text-2xl font-mono font-bold text-blue-400 tracking-widest mb-2">{gameState.roomId}</div>

            {/* Connection Status */}
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className={`w-2 h-2 rounded-full ${gameState.connectionStatus === 'connected' ? 'bg-green-500 animate-pulse' : (gameState.connectionStatus as string) === 'connecting' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span className="text-[10px] text-gray-400">
                {gameState.connectionStatus === 'connected' ? 'P2P Connected' : (gameState.connectionStatus as string) === 'connecting' ? 'Connecting...' : 'Disconnected'}
              </span>
            </div>

            <div className="flex gap-2 justify-center">
              <button onClick={copyInviteLink} className={`flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium ${copied ? 'bg-green-600' : 'bg-gray-700 hover:bg-gray-600'}`}>
                <Copy size={12} /> {copied ? 'Copied!' : 'Copy'}
              </button>
              <button onClick={shareInvite} className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-xs font-medium">
                <Share2 size={12} /> Share
              </button>
            </div>

            {gameState.snakes.length < 2 && (
              <div className="mt-2 text-[10px] text-yellow-400 animate-pulse">
                ⏳ Share the Room Code with a friend to play together!
              </div>
            )}
          </div>

          <div className="mb-4">
            <h3 className="text-left text-gray-400 mb-2 text-xs flex items-center gap-1">
              <Users size={12} /> Players ({gameState.snakes.length})
            </h3>
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {gameState.snakes.map(snake => (
                <div key={snake.id} className="flex items-center gap-2 bg-gray-700 p-2 rounded-lg text-sm">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: snake.color }}></div>
                  <span className="flex-1 text-left truncate">{snake.name}</span>
                  <span className="text-yellow-400 text-xs">Lv.{snake.level}</span>
                  {snake.id === gameState.myId && <span className="text-[10px] bg-green-600 px-1.5 py-0.5 rounded">YOU</span>}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={startGame}
            disabled={gameState.snakes.length < 2}
            className={`w-full py-3 rounded-xl font-bold text-lg transition-all ${gameState.snakes.length >= 2 ? 'bg-green-600 hover:bg-green-500' : 'bg-gray-600 opacity-50'
              }`}
          >
            <Play className="inline mr-1" size={20} /> Start ({gameState.snakes.length})
          </button>
        </div>
      )}

      {/* Game */}
      {(mode === 'game' || gameState.gameStarted || gameState.gameOver) && (
        <div className="w-full flex flex-col items-center">
          {/* Stats */}
          {mySnake && (
            <div className="w-full max-w-lg bg-gray-800/90 rounded-lg p-2 mb-2 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: mySnake.color }}></div>
                <span className="font-bold truncate max-w-[60px]">{mySnake.name}</span>
                <span className="text-yellow-400">⭐Lv.{mySnake.level}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-400">{mySnake.xp}XP</span>
                <span className="text-red-400">💀{mySnake.kills}</span>
                <span className="text-gray-400 flex items-center gap-0.5"><Clock size={10} />{gameState.gameTime}s</span>
              </div>

              {/* Nova Meter */}
              <div className="absolute top-12 left-1/2 -translate-x-1/2 w-48 h-1.5 bg-gray-900 rounded-full border border-gray-700 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${mySnake.novaMeter >= 100 ? 'bg-orange-500 animate-pulse ring-1 ring-white shadow-[0_0_10px_rgba(249,115,22,0.8)]' : 'bg-blue-500'}`}
                  style={{ width: `${mySnake.novaMeter}%` }}
                />
                {mySnake.novaMeter >= 100 && (
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold text-orange-400 animate-bounce">
                    PRESS SPACE FOR BOOM! 💥
                  </div>
                )}
              </div>
            </div>
          )}

          <SwipeControls onSwipe={handleSwipe}>
            <BattleCanvas gameState={gameState} theme={theme} />
          </SwipeControls>

          {/* Elimination Toasts - shown to other players when someone is eliminated */}
          {eliminationToasts.length > 0 && (
            <div className="fixed top-20 left-0 right-0 flex flex-col items-center gap-2 z-40 pointer-events-none">
              {eliminationToasts.map((toast, idx) => (
                <div
                  key={toast.id + idx}
                  className="bg-red-900/90 border border-red-500 px-4 py-2 rounded-lg flex items-center gap-2 animate-pulse shadow-lg"
                >
                  <Skull size={18} className="text-red-400" />
                  <span className="text-white font-bold">{toast.name}</span>
                  <span className="text-red-300">OUT!</span>
                  {toast.killedBy && (
                    <span className="text-gray-400 text-xs">by {toast.killedBy}</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Spectator Mode - shown only to eliminated player while game continues */}
          {mySnake?.isDead && !gameState.gameOver && (
            <div className="fixed inset-0 bg-black/70 flex flex-col items-center justify-center z-40 pointer-events-none">
              <div className="bg-gray-900/95 border border-red-500 rounded-2xl p-6 text-center max-w-sm mx-4">
                <Skull size={48} className="text-red-500 mx-auto mb-3" />
                <h2 className="text-2xl font-bold text-red-400 mb-2">YOU'RE OUT!</h2>
                <div className="flex items-center justify-center gap-2 text-gray-300 mb-4">
                  <Eye size={16} />
                  <span>Spectating...</span>
                </div>
                <div className="text-xs text-gray-400 mb-4">
                  {gameState.snakes.filter(s => !s.isDead).length} players remaining
                </div>
                <div className="bg-gray-800 rounded-lg p-3 mb-4">
                  <div className="text-xs text-gray-400 mb-1">Your Final Stats</div>
                  <div className="flex items-center justify-center gap-3 text-xs flex-wrap">
                    <span className="text-yellow-400">⭐Lv.{mySnake.level}</span>
                    <span className="text-red-400">💀{mySnake.kills}</span>
                    <span className="text-green-400">🏆{mySnake.score}</span>
                  </div>
                </div>
                <button
                  onClick={onBack}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm pointer-events-auto"
                >
                  Leave Game
                </button>
              </div>
            </div>
          )}

          {/* Game Over */}
          {gameState.gameOver && (
            <div className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-50 p-4">
              <h2 className={`text-3xl font-bold mb-3 text-center ${gameState.winner === mySnake?.name ? 'text-green-400' : 'text-yellow-400'}`}>
                {gameState.winner ? `${gameState.winner} WINS!` : 'GAME OVER'}
              </h2>

              {mySnake && (
                <div className="bg-gray-800 p-3 rounded-lg mb-4 text-center">
                  <div className="text-xs text-gray-400 mb-1">Your Stats</div>
                  <div className="flex items-center justify-center gap-3 text-xs flex-wrap">
                    <span className="text-yellow-400">⭐Lv.{mySnake.level}</span>
                    <span className="text-blue-400">{mySnake.xp}XP</span>
                    <span className="text-red-400">💀{mySnake.kills}</span>
                    <span className="text-green-400">🏆{mySnake.score}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={handlePlayAgain} className="px-5 py-2 bg-green-600 hover:bg-green-500 rounded-lg font-bold">
                  Play Again
                </button>
                <button onClick={onBack} className="px-5 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg font-bold">
                  Exit
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <AchievementToast
        achievement={currentAchievement ? {
          name: currentAchievement.name,
          icon: currentAchievement.icon,
          coins: currentAchievement.reward.coins
        } : null}
        onClose={() => setCurrentAchievement(null)}
      />
    </div>
  );
};

export default BattleGame;