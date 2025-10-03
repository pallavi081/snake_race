import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface SoundToggleProps {
  soundEnabled: boolean;
  onToggle: () => void;
  isDarkMode: boolean;
}

const SoundToggle: React.FC<SoundToggleProps> = ({ soundEnabled, onToggle, isDarkMode }) => {
  return (
    <button
      onClick={onToggle}
      className={`
        p-2 rounded-lg transition-all duration-200
        ${isDarkMode 
          ? 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-600' 
          : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-md'
        }
        hover:scale-105 active:scale-95
      `}
      aria-label={soundEnabled ? 'Disable sound' : 'Enable sound'}
    >
      {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
    </button>
  );
};

export default SoundToggle;