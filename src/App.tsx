import React, { useState, useEffect } from 'react';
import Game from './components/Game';
import TestPage from './components/TestPage';
import ThemeToggle from './components/ThemeToggle';
import { FileText } from 'lucide-react';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showTestPage, setShowTestPage] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('snake-game-theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    } else {
      setIsDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('snake-game-theme', isDarkMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', isDarkMode);
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleTestPage = () => {
    setShowTestPage(!showTestPage);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-100'
    }`}>
      <ThemeToggle isDarkMode={isDarkMode} onToggle={toggleTheme} />
      
      {!showTestPage && (
        <button
          onClick={toggleTestPage}
          className={`
            fixed top-4 left-4 z-50 p-3 rounded-full transition-all duration-300 flex items-center gap-2
            ${isDarkMode 
              ? 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-600' 
              : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-lg'
            }
            hover:scale-105 active:scale-95
          `}
          aria-label="View test page"
        >
          <FileText size={20} />
          <span className="text-sm font-medium hidden sm:inline">Tests</span>
        </button>
      )}
      
      {showTestPage ? (
        <TestPage isDarkMode={isDarkMode} onBack={toggleTestPage} />
      ) : (
        <Game isDarkMode={isDarkMode} />
      )}
    </div>
  );
}

export default App;
