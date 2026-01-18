import React, { useState, useEffect } from 'react';
import { PowerUpType } from '../types/game';

interface PowerUpInfoProps {
  activePowerUp: PowerUpType | null;
  powerUpEndTime: number;
}

const getPowerUpInfo = (type: PowerUpType) => {
  const info = {
    speed: { name: 'Speed Boost', description: 'Snake moves faster', color: 'blue', symbol: '⚡' },
    slow: { name: 'Slow Motion', description: 'Snake moves slower', color: 'purple', symbol: '🐌' },
    double: { name: 'Double Points', description: 'Food gives 2x points', color: 'yellow', symbol: '2x' },
    shrink: { name: 'Shrink', description: 'Snake shrinks when eating', color: 'cyan', symbol: '↓' }
  };
  return info[type];
};

const PowerUpInfo: React.FC<PowerUpInfoProps> = ({ activePowerUp, powerUpEndTime }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!activePowerUp) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, powerUpEndTime - Date.now());
      setTimeLeft(remaining);
    }, 100);

    return () => clearInterval(interval);
  }, [activePowerUp, powerUpEndTime]);

  if (!activePowerUp || timeLeft <= 0) {
    return (
      <div className="h-16 mb-4 p-3 rounded-lg border-2 border-dashed border-gray-600 bg-gray-800">
        <div className="flex items-center justify-center h-full">
          <span className="text-sm text-gray-400">
            Collect power-ups for special abilities!
          </span>
        </div>
      </div>
    );
  }

  const powerUpInfo = getPowerUpInfo(activePowerUp);
  const progress = (timeLeft / 5000) * 100; // 5 seconds duration

  const colorClasses = {
    blue: 'bg-blue-600 border-blue-500',
    purple: 'bg-purple-600 border-purple-500',
    yellow: 'bg-yellow-600 border-yellow-500',
    cyan: 'bg-cyan-600 border-cyan-500'
  };

  return (
    <div className={`mb-4 p-3 rounded-lg border-2 ${colorClasses[powerUpInfo.color as keyof typeof colorClasses]}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{powerUpInfo.symbol}</span>
          <div>
            <div className="text-white font-semibold text-sm">{powerUpInfo.name}</div>
            <div className="text-white text-xs opacity-90">{powerUpInfo.description}</div>
          </div>
        </div>
        <div className="text-white text-xs font-mono">
          {Math.ceil(timeLeft / 1000)}s
        </div>
      </div>
      <div className="w-full bg-black bg-opacity-30 rounded-full h-1">
        <div 
          className="bg-white h-1 rounded-full transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default PowerUpInfo;