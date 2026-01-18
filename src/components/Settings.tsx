import React from 'react';
import { X } from 'lucide-react';

interface SettingsProps {
  onClose: () => void;
  settings: {
    foodColor: string;
    snakeHeadColor: string;
    snakeBodyColor: string;
  };
  onSettingsChange: (newSettings: {
    foodColor: string;
    snakeHeadColor: string;
    snakeBodyColor: string;
  }) => void;
}

const Settings: React.FC<SettingsProps> = ({ onClose, settings, onSettingsChange }) => {
  const handleFoodColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSettingsChange({ ...settings, foodColor: e.target.value });
  };

  const handleSnakeHeadColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSettingsChange({ ...settings, snakeHeadColor: e.target.value });
  };

  const handleSnakeBodyColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSettingsChange({ ...settings, snakeBodyColor: e.target.value });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="relative rounded-lg p-6 max-w-sm w-full bg-gray-900 border border-gray-700">
        <h2 className="text-2xl font-bold mb-4 text-white">Settings</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label htmlFor="foodColor" className="text-white">Food Color</label>
            <input 
              type="color" 
              id="foodColor" 
              value={settings.foodColor} 
              onChange={handleFoodColorChange}
              className="w-16 h-8 p-1 border rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <label htmlFor="snakeHeadColor" className="text-white">Snake Head Color</label>
            <input 
              type="color" 
              id="snakeHeadColor" 
              value={settings.snakeHeadColor} 
              onChange={handleSnakeHeadColorChange}
              className="w-16 h-8 p-1 border rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <label htmlFor="snakeBodyColor" className="text-white">Snake Body Color</label>
            <input 
              type="color" 
              id="snakeBodyColor" 
              value={settings.snakeBodyColor} 
              onChange={handleSnakeBodyColorChange}
              className="w-16 h-8 p-1 border rounded"
            />
          </div>
        </div>

        <button 
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded-full text-gray-400 hover:bg-gray-700"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

export default Settings;
