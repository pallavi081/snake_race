import React, { useState } from 'react';
import { Download, Upload, Check, Copy, AlertTriangle, X } from 'lucide-react';
import storage from '../utils/storage';

interface DataSyncProps {
    onClose: () => void;
    onImport: () => void;
}

const DataSync: React.FC<DataSyncProps> = ({ onClose, onImport }) => {
    const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
    const [exportCode, setExportCode] = useState('');
    const [importCode, setImportCode] = useState('');
    const [status, setStatus] = useState<{ type: 'success' | 'error' | ''; msg: string }>({ type: '', msg: '' });

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="bg-gray-800 rounded-xl max-w-md w-full border border-gray-700 relative overflow-hidden">
                {/* Header */}
                <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-900/50">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Download className="text-blue-400" size={20} />
                        Data Sync
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-700">
                    <button
                        onClick={() => { setActiveTab('export'); setStatus({ type: '', msg: '' }); }}
                        className={`flex-1 p-3 text-sm font-medium transition-colors ${activeTab === 'export' ? 'bg-gray-700 text-white' : 'hover:bg-gray-700/50 text-gray-400'
                            }`}
                    >
                        Export Save
                    </button>
                    <button
                        onClick={() => { setActiveTab('import'); setStatus({ type: '', msg: '' }); }}
                        className={`flex-1 p-3 text-sm font-medium transition-colors ${activeTab === 'import' ? 'bg-gray-700 text-white' : 'hover:bg-gray-700/50 text-gray-400'
                            }`}
                    >
                        Import Save
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {activeTab === 'export' ? (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-300">
                                Generate a code to transfer your progress (Coins, Statistics, Skins) to another device.
                            </p>

                            {!exportCode ? (
                                <button
                                    onClick={generateExport}
                                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-lg text-white font-medium transition-colors flex items-center justify-center gap-2"
                                >
                                    <Download size={18} /> Generate Save Code
                                </button>
                            ) : (
                                <div className="space-y-2">
                                    <div className="relative">
                                        <textarea
                                            readOnly
                                            value={exportCode}
                                            className="w-full h-32 bg-gray-900 border border-gray-600 rounded-lg p-3 text-xs text-gray-300 font-mono resize-none focus:outline-none focus:border-blue-500"
                                        />
                                        <button
                                            onClick={copyToClipboard}
                                            className="absolute top-2 right-2 p-2 bg-gray-800 hover:bg-gray-700 rounded-md text-gray-300 transition-colors"
                                            title="Copy"
                                        >
                                            <Copy size={14} />
                                        </button>
                                    </div>
                                    <p className="text-xs text-yellow-500 flex items-center gap-1">
                                        <AlertTriangle size={12} /> Keep this code safe!
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-sm text-gray-300">
                                Paste your save code below to restore your progress.
                                <br />
                                <span className="text-red-400 font-bold text-xs">WARNING: This will overwrite your current data!</span>
                            </p>

                            <textarea
                                value={importCode}
                                onChange={(e) => setImportCode(e.target.value)}
                                placeholder="Paste code here..."
                                className="w-full h-32 bg-gray-900 border border-gray-600 rounded-lg p-3 text-xs text-white font-mono resize-none focus:outline-none focus:border-blue-500"
                            />

                            <button
                                onClick={handleImport}
                                className="w-full py-3 bg-red-600 hover:bg-red-500 rounded-lg text-white font-medium transition-colors flex items-center justify-center gap-2"
                            >
                                <Upload size={18} /> Load Data
                            </button>
                        </div>
                    )}

                    {/* Status Message */}
                    {status.msg && (
                        <div
                            className={`mt-4 p-3 rounded-lg text-sm flex items-center gap-2 ${status.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
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

export default DataSync;
