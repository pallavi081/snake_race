import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  isDarkMode: boolean;
  onToggle: () => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ isDarkMode, onToggle }) => {
  return (
    <button
      onClick={onToggle}
      className={`
        fixed top-4 right-4 z-50 p-3 rounded-full transition-all duration-300
        ${isDarkMode 
          ? 'bg-gray-800 hover:bg-gray-700 text-yellow-400 border border-gray-600' 
          : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-lg'
        }
        hover:scale-105 active:scale-95
      `}
      aria-label="Toggle theme"
    >
      {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
    </button>
  );
};

export default ThemeToggle;