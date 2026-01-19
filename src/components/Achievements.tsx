import React, { useState, useEffect } from 'react';
import { X, Lock, Check, Star } from 'lucide-react';
import { storage, AchievementProgress } from '../utils/storage';
import { ACHIEVEMENTS, Achievement, getAchievementsByCategory } from '../data/achievements';

interface AchievementsProps {
    onClose: () => void;
}

const Achievements: React.FC<AchievementsProps> = ({ onClose }) => {
    const [tab, setTab] = useState<'all' | 'battle' | 'classic' | 'general' | 'secret'>('all');
    const [progress, setProgress] = useState<Record<string, AchievementProgress>>({});

    useEffect(() => {
        setProgress(storage.getAchievements());
    }, []);

    const getFiltered = () => {
        if (tab === 'all') return ACHIEVEMENTS;
        return getAchievementsByCategory(tab);
    };

    const getProgress = (a: Achievement) => {
        const p = progress[a.id];
        if (!p) return { unlocked: false, progress: 0 };
        return p;
    };

    const unlockedCount = ACHIEVEMENTS.filter(a => progress[a.id]?.unlocked).length;

    const renderAchievement = (a: Achievement) => {
        const p = getProgress(a);
        const percent = Math.min(100, (p.progress / a.target) * 100);

        return (
            <div
                key={a.id}
                className={`p-3 rounded-lg border transition-all ${p.unlocked
                        ? 'border-green-500 bg-green-500/10'
                        : 'border-gray-700 bg-gray-800/50 opacity-75'
                    }`}
            >
                <div className="flex items-start gap-3">
                    <div className={`text-2xl ${p.unlocked ? '' : 'grayscale opacity-50'}`}>
                        {a.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <span className={`font-medium text-sm ${p.unlocked ? 'text-white' : 'text-gray-400'}`}>
                                {a.name}
                            </span>
                            {p.unlocked && <Check size={14} className="text-green-400" />}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">{a.description}</div>

                        {/* Progress Bar */}
                        {!p.unlocked && (
                            <div className="mt-2">
                                <div className="flex justify-between text-xs text-gray-500 mb-1">
                                    <span>{p.progress}/{a.target}</span>
                                    <span>{Math.round(percent)}%</span>
                                </div>
                                <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-blue-500 transition-all"
                                        style={{ width: `${percent}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Reward */}
                        <div className="mt-2 flex items-center gap-2 text-xs">
                            <span className="text-yellow-400">🪙 {a.reward.coins}</span>
                            {a.reward.skin && <span className="text-purple-400">+ 🎨 {a.reward.skin}</span>}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
            <div className="bg-gray-800 rounded-xl w-full max-w-lg max-h-[85vh] flex flex-col border border-gray-700">
                {/* Header */}
                <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Star className="text-yellow-400" /> Achievements
                    </h2>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-400">{unlockedCount}/{ACHIEVEMENTS.length}</span>
                        <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="p-2 border-b border-gray-700 flex gap-1 overflow-x-auto">
                    {(['all', 'battle', 'classic', 'general', 'secret'] as const).map(t => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap ${tab === t ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
                                }`}
                        >
                            {t === 'all' ? '🏆 All' :
                                t === 'battle' ? '⚔️ Battle' :
                                    t === 'classic' ? '🐍 Classic' :
                                        t === 'general' ? '🎮 General' : '🔮 Secret'}
                        </button>
                    ))}
                </div>

                {/* Progress Bar */}
                <div className="px-4 py-2 bg-gray-700/50">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Overall Progress</span>
                        <span>{Math.round((unlockedCount / ACHIEVEMENTS.length) * 100)}%</span>
                    </div>
                    <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-yellow-500 to-yellow-300 transition-all"
                            style={{ width: `${(unlockedCount / ACHIEVEMENTS.length) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Achievements Grid */}
                <div className="flex-1 overflow-y-auto p-3">
                    <div className="space-y-2">
                        {getFiltered().map(renderAchievement)}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Achievements;
