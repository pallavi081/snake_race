import React, { useState } from 'react';
import { Keyboard, Smartphone, Zap, Award, Swords, ShoppingBag, Calendar, Trophy } from 'lucide-react';

const GameInstructions: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'classic' | 'battle' | 'features'>('classic');

  return (
    <div className="p-4 rounded-lg bg-gray-800 border border-gray-700">
      <h3 className="font-bold mb-4 text-white text-lg">
        How to Play
      </h3>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('classic')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'classic' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
        >
          Classic & Puzzle
        </button>
        <button
          onClick={() => setActiveTab('battle')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'battle' ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
        >
          Battle Royale
        </button>
        <button
          onClick={() => setActiveTab('features')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'features' ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
        >
          New Features
        </button>
      </div>

      <div className="space-y-4 min-h-[300px]">
        {activeTab === 'classic' && (
          <>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Keyboard className="w-4 h-4 text-blue-400" />
                  <span className="font-medium text-white">Desktop Controls</span>
                </div>
                <ul className="text-sm space-y-1 text-gray-300">
                  <li>• Arrow keys to move</li>
                  <li>• SPACE to start/restart</li>
                  <li>• 'P' or 'ESC' to Pause</li>
                </ul>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Smartphone className="w-4 h-4 text-green-400" />
                  <span className="font-medium text-white">Mobile Controls</span>
                </div>
                <ul className="text-sm space-y-1 text-gray-300">
                  <li>• Swipe to move</li>
                  <li>• Tap screen to start/restart</li>
                </ul>
              </div>
            </div>

            <div className="mt-2">
              <h4 className="font-medium mb-2 text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-yellow-500" /> Scoring & Rules
              </h4>
              <ul className="text-sm space-y-1 text-gray-300">
                <li>• Eat red food to grow and earn points</li>
                <li>• Avoid hitting walls or yourself</li>
                <li>• Higher levels = faster speed & more points</li>
                <li>• <strong>Puzzle Mode:</strong> Solve levels with limited moves!</li>
                <li>• <strong>Physics Mode:</strong> Gravity and platforms added!</li>
              </ul>
            </div>
          </>
        )}

        {activeTab === 'battle' && (
          <div className="animate-fade-in">
            <div className="bg-red-900/30 p-3 rounded-lg border border-red-500/30 mb-4">
              <h4 className="font-bold text-red-400 flex items-center gap-2 mb-2">
                <Swords className="w-5 h-5" /> The Objective
              </h4>
              <p className="text-sm text-gray-300">
                Enter a massive arena with other snakes/bots.
                Kill opponents by cutting them off, survive as long as possible,
                and become the champion!
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-white mb-2">Combat Rules</h4>
                <ul className="text-sm space-y-1 text-gray-300">
                  <li>• <span className="text-red-400 font-bold">KILL:</span> Force heads into bodies</li>
                  <li>• <span className="text-green-400 font-bold">EAT:</span> Collect glowing orbs for XP</li>
                  <li>• <span className="text-blue-400 font-bold">LEVEL UP:</span> Grow larger & unlock skins</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-white mb-2">Power-Ups</h4>
                <ul className="text-sm space-y-1 text-gray-300">
                  <li>• ⚡ Speed: Temporary burst</li>
                  <li>• 🛡️ Shield: Invincibility</li>
                  <li>• 🧲 Magnet: Attract food</li>
                  <li>• 🟣 2x XP: Level up faster</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'features' && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <h4 className="font-medium text-white flex items-center gap-2 mb-1">
                <ShoppingBag className="w-4 h-4 text-pink-400" /> Shop & Skins
              </h4>
              <p className="text-xs text-gray-400 mb-1">Customize your snake!</p>
              <ul className="text-sm space-y-1 text-gray-300">
                <li>• Earn <span className="text-yellow-400">Coins</span> by playing games</li>
                <li>• Buy unique skins (Gold, Neon, Glitch)</li>
                <li>• Unlock visual themes for the grid</li>
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-white flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-blue-400" /> Daily Quests
                </h4>
                <p className="text-xs text-gray-300">Complete 3 challenges every day for big coin rewards and streak bonuses!</p>
              </div>
              <div>
                <h4 className="font-medium text-white flex items-center gap-2 mb-1">
                  <Trophy className="w-4 h-4 text-yellow-500" /> Achievements
                </h4>
                <p className="text-xs text-gray-300">Unlock over 50 achievements like "First Blood" or "Pacifist" to earn rewards.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameInstructions;