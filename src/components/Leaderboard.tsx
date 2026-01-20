import React, { useState, useEffect } from 'react';
import { X, Trophy, Medal, Award, Calendar, Clock, Globe, HardDrive } from 'lucide-react';
import { storage, LeaderboardEntry } from '../utils/storage';
import { getGlobalLeaderboard, LeaderboardEntry as GlobalEntry } from '../utils/cloudStorage';

interface LeaderboardProps {
    onClose: () => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ onClose }) => {
    const [source, setSource] = useState<'local' | 'global'>('local');
    const [tab, setTab] = useState<'all' | 'battle' | 'classic'>('all');
    const [timeFilter, setTimeFilter] = useState<'all' | 'week' | 'today'>('all');
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [globalEntries, setGlobalEntries] = useState<GlobalEntry[]>([]);
    const [loadingGlobal, setLoadingGlobal] = useState(false);

    // Load local entries
    useEffect(() => {
        if (source === 'local') {
            let data = storage.getLeaderboard(tab === 'all' ? undefined : tab);

            if (timeFilter !== 'all') {
                const now = Date.now();
                const cutoff = timeFilter === 'today' ? now - 86400000 : now - 604800000;
                data = data.filter(e => new Date(e.date).getTime() > cutoff);
            }

            setEntries(data.slice(0, 100));
        }
    }, [tab, timeFilter, source]);

    // Load global entries
    useEffect(() => {
        if (source === 'global') {
            setLoadingGlobal(true);
            getGlobalLeaderboard(tab === 'all' ? undefined : tab)
                .then((data) => {
                    setGlobalEntries(data);
                    setLoadingGlobal(false);
                })
                .catch(() => setLoadingGlobal(false));
        }
    }, [tab, source]);

    const getRankStyle = (rank: number) => {
        if (rank === 1) return 'bg-yellow-500 text-black';
        if (rank === 2) return 'bg-gray-300 text-black';
        if (rank === 3) return 'bg-amber-600 text-white';
        return 'bg-gray-700 text-white';
    };

    const getRankIcon = (rank: number) => {
        if (rank === 1) return <Trophy size={16} className="text-yellow-400" />;
        if (rank === 2) return <Medal size={16} className="text-gray-300" />;
        if (rank === 3) return <Award size={16} className="text-amber-500" />;
        return null;
    };

    const displayEntries = source === 'global' ? globalEntries : entries;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
            <div className="bg-gray-800 rounded-xl w-full max-w-lg max-h-[85vh] flex flex-col border border-gray-700">
                {/* Header */}
                <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Trophy className="text-yellow-400" /> Leaderboard
                    </h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded">
                        <X size={24} />
                    </button>
                </div>

                {/* Source Toggle: Local vs Global */}
                <div className="p-2 border-b border-gray-700 flex gap-2">
                    <button
                        onClick={() => setSource('local')}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${source === 'local' ? 'bg-purple-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                    >
                        <HardDrive size={16} /> Local
                    </button>
                    <button
                        onClick={() => setSource('global')}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${source === 'global' ? 'bg-green-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                    >
                        <Globe size={16} /> Global
                    </button>
                </div>

                {/* Mode Tabs */}
                <div className="p-2 border-b border-gray-700 flex gap-2">
                    {(['all', 'battle', 'classic'] as const).map(t => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                        >
                            {t === 'all' ? '🏆 All' : t === 'battle' ? '⚔️ Battle' : '🐍 Classic'}
                        </button>
                    ))}
                </div>

                {/* Time Filter (only for local) */}
                {source === 'local' && (
                    <div className="p-2 border-b border-gray-700 flex gap-2">
                        {([
                            { key: 'all', label: 'All Time', icon: <Clock size={14} /> },
                            { key: 'week', label: 'This Week', icon: <Calendar size={14} /> },
                            { key: 'today', label: 'Today', icon: <Calendar size={14} /> },
                        ] as const).map(f => (
                            <button
                                key={f.key}
                                onClick={() => setTimeFilter(f.key)}
                                className={`flex-1 py-1.5 rounded text-xs font-medium flex items-center justify-center gap-1 ${timeFilter === f.key ? 'bg-purple-600' : 'bg-gray-700 hover:bg-gray-600'}`}
                            >
                                {f.icon} {f.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* Entries */}
                <div className="flex-1 overflow-y-auto p-2">
                    {loadingGlobal ? (
                        <div className="text-center py-12 text-gray-400">
                            <div className="animate-spin w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                            <p>Loading global leaderboard...</p>
                        </div>
                    ) : displayEntries.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <Trophy size={48} className="mx-auto mb-4 opacity-50" />
                            <p>No scores yet!</p>
                            <p className="text-sm">{source === 'global' ? 'Be the first to submit a global score!' : 'Play a game to get on the leaderboard'}</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {displayEntries.map((entry, idx) => (
                                <div
                                    key={(entry as any).id || idx}
                                    className={`flex items-center gap-3 p-3 rounded-lg ${idx < 3 ? 'bg-gradient-to-r from-gray-700 to-gray-800' : 'bg-gray-700/50'}`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getRankStyle(idx + 1)}`}>
                                        {idx + 1}
                                    </div>

                                    {/* Photo for global entries */}
                                    {source === 'global' && (entry as GlobalEntry).photoURL && (
                                        <img src={(entry as GlobalEntry).photoURL!} alt="" className="w-6 h-6 rounded-full" />
                                    )}

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            {getRankIcon(idx + 1)}
                                            <span className="font-medium truncate">{entry.name}</span>
                                            <span className="text-xs text-gray-400 px-1.5 py-0.5 bg-gray-600 rounded">
                                                {entry.mode}
                                            </span>
                                            {source === 'global' && (
                                                <span className="text-xs text-green-400">🌐</span>
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-400 flex gap-2">
                                            {(entry as any).level && <span>Lv.{(entry as any).level}</span>}
                                            {(entry as any).kills > 0 && <span>💀{(entry as any).kills}</span>}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-yellow-400">{entry.score.toLocaleString()}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Leaderboard;
