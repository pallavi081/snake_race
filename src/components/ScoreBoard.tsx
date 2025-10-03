import React from 'react';
import { Trophy, Target, Zap, TrendingUp } from 'lucide-react';

interface ScoreBoardProps {
  score: number;
  highScore: number;
  level: number;
  combo: number;
  isDarkMode: boolean;
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({ score, highScore, level, combo, isDarkMode }) => {
  return (
    <div className={`
      grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 rounded-lg
      ${isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200 shadow-md'}
    `}>
      <div className="flex items-center gap-2">
        <Target className={`w-5 h-5 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
        <div>
          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Score</div>
          <div className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{score}</div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Trophy className={`w-5 h-5 ${isDarkMode ? 'text-yellow-400' : 'text-yellow-600'}`} />
        <div>
          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Best</div>
          <div className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{highScore}</div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <TrendingUp className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
        <div>
          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Level</div>
          <div className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{level}</div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Zap className={`w-5 h-5 ${combo > 1 ? (isDarkMode ? 'text-orange-400' : 'text-orange-600') : (isDarkMode ? 'text-gray-500' : 'text-gray-400')}`} />
        <div>
          <div className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Combo</div>
          <div className={`font-bold ${combo > 1 ? (isDarkMode ? 'text-orange-400' : 'text-orange-600') : (isDarkMode ? 'text-white' : 'text-gray-800')}`}>
            {combo > 1 ? `${combo}x` : '-'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoreBoard;