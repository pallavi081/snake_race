import React, { useState } from 'react';
import { Download, Upload, Check, Copy, AlertTriangle, X, Volume2, VolumeX, Smartphone, Settings as SettingsIcon } from 'lucide-react';
import storage from '../utils/storage';
import { audio } from '../utils/audio';

interface SettingsProps {
  onClose: () => void;
  onImport: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onClose, onImport }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'data'>('general');
  const [exportCode, setExportCode] = useState('');
  const [importCode, setImportCode] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error' | ''; msg: string }>({ type: '', msg: '' });

  const [settings, setSettings] = useState(storage.getSettings());

  const updateSetting = (key: keyof typeof settings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    storage.saveSettings(newSettings);
    audio.playClick();
  };

  const generateExport = () => {
    const code = storage.exportData();
    setExportCode(code);
    setStatus({ type: '', msg: '' });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(exportCode);
    setStatus({ type: 'success', msg: 'Code copied to clipboard!' });
    setTimeout(() => setStatus({ type: '', msg: '' }), 2000);
  };

  const handleImport = () => {
    if (!importCode.trim()) {
      setStatus({ type: 'error', msg: 'Please paste a valid code' });
      return;
    }

    const success = storage.importData(importCode);
    if (success) {
      setStatus({ type: 'success', msg: 'Data loaded successfully! Reloading...' });
      setTimeout(() => {
        onImport();
        window.location.reload();
      }, 1500);
    } else {
      setStatus({ type: 'error', msg: 'Invalid save code. Please try again.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 animate-fade-in">
      <div className="bg-gray-800 rounded-2xl max-w-md w-full border border-gray-700 shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-900/50">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <SettingsIcon className="text-blue-400" size={20} />
            Game Settings
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700 bg-gray-900/30">
          <button
            onClick={() => { setActiveTab('general'); setStatus({ type: '', msg: '' }); }}
            className={`flex-1 p-3 text-sm font-bold transition-all ${activeTab === 'general' ? 'bg-gray-700 text-white shadow-inner' : 'hover:bg-gray-700/50 text-gray-400'
              }`}
          >
            General
          </button>
          <button
            onClick={() => { setActiveTab('data'); setStatus({ type: '', msg: '' }); }}
            className={`flex-1 p-3 text-sm font-bold transition-all ${activeTab === 'data' ? 'bg-gray-700 text-white shadow-inner' : 'hover:bg-gray-700/50 text-gray-400'
              }`}
          >
            Data Sync
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'general' ? (
            <div className="space-y-6">
              {/* Sound Toggle */}
              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${settings.soundEnabled ? 'bg-blue-600/20 text-blue-400' : 'bg-gray-700 text-gray-500'}`}>
                    {settings.soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                  </div>
                  <div>
                    <div className="font-bold text-white">Sound Effects</div>
                    <div className="text-xs text-gray-400">Enable synthesized SFX</div>
                  </div>
                </div>
                <button
                  onClick={() => updateSetting('soundEnabled', !settings.soundEnabled)}
                  className={`w-12 h-6 rounded-full transition-all relative ${settings.soundEnabled ? 'bg-blue-600' : 'bg-gray-600'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.soundEnabled ? 'left-7' : 'left-1'}`} />
                </button>
              </div>

              {/* Vibration Toggle */}
              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${settings.vibrationEnabled ? 'bg-purple-600/20 text-purple-400' : 'bg-gray-700 text-gray-500'}`}>
                    <Smartphone size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-white">Haptic Feedback</div>
                    <div className="text-xs text-gray-400">Vibration on interactions</div>
                  </div>
                </div>
                <button
                  onClick={() => updateSetting('vibrationEnabled', !settings.vibrationEnabled)}
                  className={`w-12 h-6 rounded-full transition-all relative ${settings.vibrationEnabled ? 'bg-purple-600' : 'bg-gray-600'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.vibrationEnabled ? 'left-7' : 'left-1'}`} />
                </button>
              </div>

              {/* Music Toggle */}
              <div className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${settings.musicEnabled ? 'bg-pink-600/20 text-pink-400' : 'bg-gray-700 text-gray-500'}`}>
                    <Volume2 size={20} />
                  </div>
                  <div>
                    <div className="font-bold text-white">Game Music</div>
                    <div className="text-xs text-gray-400">Background music (If available)</div>
                  </div>
                </div>
                <button
                  onClick={() => updateSetting('musicEnabled', !settings.musicEnabled)}
                  className={`w-12 h-6 rounded-full transition-all relative ${settings.musicEnabled ? 'bg-pink-600' : 'bg-gray-600'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.musicEnabled ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex gap-2">
                <button
                  onClick={() => generateExport()}
                  className="flex-1 py-3 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-xl text-blue-400 font-bold transition-all flex flex-col items-center justify-center gap-1"
                >
                  <Download size={20} />
                  <span className="text-[10px] uppercase">Export</span>
                </button>
                <button
                  onClick={() => { setExportCode(''); setStatus({ type: '', msg: '' }); }}
                  className="flex-1 py-3 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded-xl text-red-400 font-bold transition-all flex flex-col items-center justify-center gap-1"
                >
                  <Upload size={20} />
                  <span className="text-[10px] uppercase">Import</span>
                </button>
              </div>

              {exportCode ? (
                <div className="space-y-2 animate-slide-up">
                  <div className="relative">
                    <textarea
                      readOnly
                      value={exportCode}
                      className="w-full h-32 bg-gray-900 border border-gray-600 rounded-lg p-3 text-xs text-gray-300 font-mono resize-none focus:outline-none"
                    />
                    <button
                      onClick={copyToClipboard}
                      className="absolute top-2 right-2 p-2 bg-gray-800 hover:bg-gray-700 rounded-md text-gray-300 transition-colors"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                  <p className="text-[10px] text-yellow-500 flex items-center gap-1 italic">
                    <AlertTriangle size={10} /> Copied code is used to restore data on any device.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <textarea
                    value={importCode}
                    onChange={(e) => setImportCode(e.target.value)}
                    placeholder="Paste your save code here..."
                    className="w-full h-32 bg-gray-900 border border-gray-600 rounded-lg p-3 text-xs text-white font-mono resize-none focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={handleImport}
                    className="w-full py-3 bg-red-600 hover:bg-red-500 rounded-xl text-white font-bold transition-all shadow-lg"
                  >
                    RETORE DATA
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Status Message */}
          {status.msg && (
            <div
              className={`mt-4 p-3 rounded-lg text-sm flex items-center gap-2 animate-bounce-in ${status.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}
            >
              {status.type === 'success' ? <Check size={16} /> : <AlertTriangle size={16} />}
              {status.msg}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
