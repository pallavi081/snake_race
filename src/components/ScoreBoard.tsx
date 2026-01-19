import React from 'react';
import { Trophy, Target, Zap, TrendingUp } from 'lucide-react';

interface ScoreBoardProps {
  score: number;
  highScore: number;
  level: number;
  combo: number;
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({ score, highScore, level, combo }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 rounded-lg bg-gray-800 border border-gray-700">
      <div className="flex items-center gap-2">
        <Target className="w-5 h-5 text-green-400" />
        <div>
          <div className="text-xs text-gray-400">Score</div>
          <div className="font-bold text-white">{score}</div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Trophy className="w-5 h-5 text-yellow-400" />
        <div>
          <div className="text-xs text-gray-400">Best</div>
          <div className="font-bold text-white">{highScore}</div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-blue-400" />
        <div>
          <div className="text-xs text-gray-400">Level</div>
          <div className="font-bold text-white">{level}</div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Zap className={`w-5 h-5 ${combo > 1 ? 'text-orange-400' : 'text-gray-500'}`} />
        <div>
          <div className="text-xs text-gray-400">Combo</div>
          <div className={`font-bold ${combo > 1 ? 'text-orange-400' : 'text-white'}`}>
            {combo > 1 ? `${combo}x` : '-'}
          </div>
        </div>
      </div>
    </div>
  );
};
export default ScoreBoard;