import React, { useState, useEffect } from 'react';
import { X, Gift, Calendar, Check, Lock, Sparkles } from 'lucide-react';
import { DAILY_REWARDS, getDailyReward, canClaimDailyReward } from '../utils/socialFirestore';
import { storage } from '../utils/storage';

interface DailyRewardsProps {
    onClose: () => void;
    onClaim?: () => void;
}

const DailyRewards: React.FC<DailyRewardsProps> = ({ onClose, onClaim }) => {
    const [player, setPlayer] = useState(storage.getPlayer());
    const [claimed, setClaimed] = useState(false);
    const [lastClaimDate, setLastClaimDate] = useState<string | null>(null);
    const [canClaim, setCanClaim] = useState(false);
    const [claimingAnimation, setClaimingAnimation] = useState(false);

    useEffect(() => {
        const savedLastClaim = localStorage.getItem('snake_last_daily_claim');
        setLastClaimDate(savedLastClaim);
        setCanClaim(canClaimDailyReward(savedLastClaim || ''));
    }, []);

    const handleClaim = () => {
        if (!canClaim || claimed) return;

        setClaimingAnimation(true);

        setTimeout(() => {
            const reward = getDailyReward(player.currentStreak + 1);

            // Update storage
            storage.addCoins(reward.coins);
            storage.updateStreak();

            // Save claim date
            const today = new Date().toISOString();
            localStorage.setItem('snake_last_daily_claim', today);

            setClaimed(true);
            setCanClaim(false);
            setPlayer(storage.getPlayer());
            setClaimingAnimation(false);

            if (onClaim) onClaim();
        }, 1000);
    };

    const currentDay = (player.currentStreak % 7) + 1;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
            <div className="bg-gray-800 rounded-xl w-full max-w-md overflow-hidden border border-gray-700">
                {/* Header */}
                <div className="bg-gradient-to-r from-yellow-600/30 to-orange-600/30 p-4 border-b border-gray-700">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Gift className="text-yellow-400" /> Daily Rewards
                        </h2>
                        <button onClick={onClose} className="p-1 hover:bg-gray-700/50 rounded">
                            <X size={24} />
                        </button>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-sm">
                        <Calendar size={14} className="text-orange-400" />
                        <span className="text-gray-300">
                            Current Streak: <span className="text-orange-400 font-bold">{player.currentStreak} days</span>
                        </span>
                    </div>
                </div>

                {/* Rewards Grid */}
                <div className="p-4">
                    <div className="grid grid-cols-7 gap-2">
                        {DAILY_REWARDS.map((reward, idx) => {
                            const dayNum = idx + 1;
                            const isPast = dayNum < currentDay && !canClaim;
                            const isCurrent = dayNum === currentDay;
                            const isFuture = dayNum > currentDay;

                            return (
                                <div
                                    key={dayNum}
                                    className={`relative rounded-lg p-2 text-center transition-all ${isCurrent && canClaim
                                            ? 'bg-gradient-to-b from-yellow-500/30 to-orange-500/30 ring-2 ring-yellow-400 animate-pulse'
                                            : isPast
                                                ? 'bg-green-900/30 border border-green-700'
                                                : isCurrent
                                                    ? 'bg-yellow-900/30 border border-yellow-600'
                                                    : 'bg-gray-700/50 border border-gray-600'
                                        }`}
                                >
                                    <div className="text-xs text-gray-400 mb-1">Day {dayNum}</div>

                                    <div className="text-lg mb-1">
                                        {isPast ? (
                                            <Check size={18} className="mx-auto text-green-400" />
                                        ) : isFuture ? (
                                            <Lock size={16} className="mx-auto text-gray-500" />
                                        ) : (
                                            <span>🎁</span>
                                        )}
                                    </div>

                                    <div className="text-xs font-bold text-yellow-400">
                                        {reward.coins}🪙
                                    </div>

                                    {reward.bonus && (
                                        <div className="absolute -top-1 -right-1 text-xs">✨</div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Current Reward Detail */}
                    <div className="mt-4 bg-gray-700/50 rounded-lg p-4 text-center">
                        {canClaim && !claimed ? (
                            <>
                                <div className="text-sm text-gray-400 mb-2">Today's Reward</div>
                                <div className="text-4xl mb-2">🎁</div>
                                <div className="text-2xl font-bold text-yellow-400 mb-1">
                                    +{getDailyReward(player.currentStreak + 1).coins} 🪙
                                </div>
                                {getDailyReward(player.currentStreak + 1).bonus && (
                                    <div className="text-sm text-purple-400">
                                        {getDailyReward(player.currentStreak + 1).bonus}
                                    </div>
                                )}

                                <button
                                    onClick={handleClaim}
                                    disabled={claimingAnimation}
                                    className="mt-4 w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold rounded-lg flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02]"
                                >
                                    {claimingAnimation ? (
                                        <>
                                            <Sparkles size={20} className="animate-spin" />
                                            Claiming...
                                        </>
                                    ) : (
                                        <>
                                            <Gift size={20} />
                                            Claim Reward!
                                        </>
                                    )}
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="text-sm text-gray-400 mb-2">
                                    {claimed ? "Today's Reward Claimed!" : 'Come Back Tomorrow!'}
                                </div>
                                <div className="text-4xl mb-2">{claimed ? '✅' : '⏰'}</div>
                                <div className="text-sm text-gray-500">
                                    {claimed
                                        ? `Keep your streak going - Day ${player.currentStreak}!`
                                        : 'Daily rewards reset at midnight'
                                    }
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-gray-700 text-center text-xs text-gray-500">
                    Login every day to maintain your streak and earn bigger rewards!
                </div>
            </div>
        </div>
    );
};

export default DailyRewards;
