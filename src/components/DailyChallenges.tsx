import React, { useState, useEffect } from 'react';
import { X, Calendar, Flame, Check, Clock } from 'lucide-react';
import { storage, DailyChallengeState } from '../utils/storage';
import { getSeededDailyChallenges, Challenge, getDailySeed } from '../data/challengePool';

interface DailyChallengesProps {
    onClose: () => void;
}

const DailyChallenges: React.FC<DailyChallengesProps> = ({ onClose }) => {
    const [challenges, setChallenges] = useState<(Challenge & { progress: number; completed: boolean })[]>([]);
    const [streak, setStreak] = useState(0);
    const [timeLeft, setTimeLeft] = useState('');

    useEffect(() => {
        loadChallenges();
        const timer = setInterval(updateTimeLeft, 1000);
        return () => clearInterval(timer);
    }, []);

    const loadChallenges = () => {
        const today = new Date().toDateString();
        const saved = storage.getDailyChallenges();

        // Check if challenges are from today
        if (saved && saved.date === today) {
            const dailyChallenges = getSeededDailyChallenges();
            setChallenges(dailyChallenges.map((c, i) => ({
                ...c,
                progress: saved.challenges[i]?.progress || 0,
                completed: saved.challenges[i]?.completed || false,
            })));
            setStreak(saved.streak);
        } else {
            // New day - generate new challenges
            const dailyChallenges = getSeededDailyChallenges();
            const player = storage.getPlayer();
            const yesterday = new Date(Date.now() - 86400000).toDateString();
            const newStreak = saved?.date === yesterday ? (saved.streak || 0) + 1 : 1;

            const newState: DailyChallengeState = {
                date: today,
                challenges: dailyChallenges.map(c => ({ id: c.id, progress: 0, completed: false })),
                streak: newStreak,
            };
            storage.saveDailyChallenges(newState);

            setChallenges(dailyChallenges.map(c => ({ ...c, progress: 0, completed: false })));
            setStreak(newStreak);
        }
    };

    const updateTimeLeft = () => {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        const diff = tomorrow.getTime() - now.getTime();
        const hours = Math.floor(diff / 3600000);
        const mins = Math.floor((diff % 3600000) / 60000);
        const secs = Math.floor((diff % 60000) / 1000);

        setTimeLeft(`${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
    };

    const getDifficultyColor = (d: string) => {
        if (d === 'easy') return 'text-green-400 bg-green-500/20';
        if (d === 'medium') return 'text-yellow-400 bg-yellow-500/20';
        return 'text-red-400 bg-red-500/20';
    };

    const getStreakBonus = () => {
        if (streak >= 30) return 3;
        if (streak >= 14) return 2;
        if (streak >= 7) return 1.5;
        return 1;
    };

    const completedCount = challenges.filter(c => c.completed).length;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
            <div className="bg-gray-800 rounded-xl w-full max-w-md max-h-[85vh] flex flex-col border border-gray-700">
                {/* Header */}
                <div className="p-4 border-b border-gray-700 flex items-center justify-between">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Calendar className="text-blue-400" /> Daily Challenges
                    </h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded">
                        <X size={24} />
                    </button>
                </div>

                {/* Streak & Timer */}
                <div className="p-3 bg-gradient-to-r from-orange-500/20 to-red-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Flame className="text-orange-400" />
                        <div>
                            <div className="font-bold text-orange-400">{streak} Day Streak!</div>
                            {streak >= 7 && (
                                <div className="text-xs text-orange-300">
                                    {getStreakBonus()}x bonus active
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center gap-1 text-sm text-gray-400">
                            <Clock size={14} /> Resets in
                        </div>
                        <div className="font-mono font-bold text-blue-400">{timeLeft}</div>
                    </div>
                </div>

                {/* Progress */}
                <div className="px-4 py-2 bg-gray-700/50 flex items-center justify-between">
                    <span className="text-sm text-gray-400">Completed</span>
                    <span className="font-bold">{completedCount}/{challenges.length}</span>
                </div>

                {/* Challenges */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                    {challenges.map((c, idx) => {
                        const percent = Math.min(100, (c.progress / c.target) * 100);
                        const bonusReward = Math.floor(c.reward.coins * getStreakBonus());

                        return (
                            <div
                                key={c.id}
                                className={`p-4 rounded-lg border transition-all ${c.completed ? 'border-green-500 bg-green-500/10' : 'border-gray-700 bg-gray-800/80'
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`text-2xl ${c.completed ? '' : 'opacity-80'}`}>
                                        {c.icon}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium">{c.title}</span>
                                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${getDifficultyColor(c.difficulty)}`}>
                                                {c.difficulty}
                                            </span>
                                            {c.completed && <Check size={16} className="text-green-400" />}
                                        </div>
                                        <div className="text-sm text-gray-400">{c.description}</div>

                                        {/* Progress */}
                                        <div className="mt-2">
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="text-gray-500">{c.progress}/{c.target}</span>
                                                <span className={c.completed ? 'text-green-400' : 'text-gray-500'}>
                                                    {Math.round(percent)}%
                                                </span>
                                            </div>
                                            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all ${c.completed ? 'bg-green-500' : 'bg-blue-500'}`}
                                                    style={{ width: `${percent}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Reward */}
                                        <div className="mt-2 flex items-center gap-1 text-xs">
                                            <span className="text-yellow-400">🪙 {bonusReward}</span>
                                            {streak >= 7 && <span className="text-orange-400">(+{bonusReward - c.reward.coins} bonus)</span>}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Info */}
                <div className="p-3 border-t border-gray-700 text-center text-xs text-gray-400">
                    Complete challenges to earn coins! 🔥 Keep your streak for bonus rewards
                </div>
            </div>
        </div>
    );
};

export default DailyChallenges;
