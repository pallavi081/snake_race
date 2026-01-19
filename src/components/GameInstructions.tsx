import React from 'react';
import { Keyboard, Smartphone, Zap, Award } from 'lucide-react';

const GameInstructions: React.FC = () => {
  return (
    <div className="p-4 rounded-lg bg-gray-800 border border-gray-700">
      <h3 className="font-bold mb-3 text-white">
        How to Play
      </h3>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Keyboard className="w-4 h-4 text-blue-400" />
            <span className="font-medium text-white">
              Desktop Controls
            </span>
          </div>
          <ul className="text-sm space-y-1 text-gray-300">
            <li>• Arrow keys to move</li>
            <li>• SPACE to start/restart</li>
          </ul>
        </div>
        
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Smartphone className="w-4 h-4 text-green-400" />
            <span className="font-medium text-white">
              Mobile Controls
            </span>
          </div>
          <ul className="text-sm space-y-1 text-gray-300">
            <li>• Touch direction buttons</li>
            <li>• Tap start/restart buttons</li>
          </ul>
        </div>
      </div>
      
      <div className="mt-4">
        <h4 className="font-medium mb-2 text-white">
          Rules
        </h4>
        <ul className="text-sm space-y-1 text-gray-300">
          <li>• Eat red food to grow and earn points</li>
          <li>• Avoid hitting walls or yourself</li>
          <li>• Score increases with level and combo multipliers</li>
          <li>• Game speed increases every 50 points</li>
        </ul>
      </div>
      
      <div className="mt-4">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-4 h-4 text-yellow-400" />
          <h4 className="font-medium text-white">
            Power-ups
          </h4>
        </div>
        <ul className="text-sm space-y-1 text-gray-300">
          <li>• ⚡ Speed Boost - Move faster for 5 seconds</li>
          <li>• 🐌 Slow Motion - Move slower for easier control</li>
          <li>• 2x Double Points - Get twice the score</li>
          <li>• ↓ Shrink - Snake shrinks when eating food</li>
        </ul>
      </div>
      
      <div className="mt-4">
        <div className="flex items-center gap-2 mb-2">
          <Award className="w-4 h-4 text-purple-400" />
          <h4 className="font-medium text-white">
            Scoring System
          </h4>
        </div>
        <ul className="text-sm space-y-1 text-gray-300">
          <li>• Base score: 10 points per food</li>
          <li>• Combo multiplier: Eat food quickly for bonus</li>
          <li>• Level multiplier: Higher levels give more points</li>
          <li>• Power-up effects can double your score</li>
        </ul>
      </div>
    </div>
  );
};

export default GameInstructions;