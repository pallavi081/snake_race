import React, { useEffect, useState } from 'react';
import { Award } from 'lucide-react';

interface AchievementToastProps {
    achievement: { name: string; icon: string; coins: number } | null;
    onClose: () => void;
}

const AchievementToast: React.FC<AchievementToastProps> = ({ achievement, onClose }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (achievement) {
            setVisible(true);
            const timer = setTimeout(() => {
                setVisible(false);
                setTimeout(onClose, 300);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [achievement, onClose]);

    if (!achievement) return null;

    return (
        <div
            className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
                }`}
        >
            <div className="bg-gradient-to-r from-yellow-600 to-amber-500 rounded-xl p-4 shadow-2xl border border-yellow-400 flex items-center gap-3 min-w-[280px]">
                <div className="text-3xl animate-bounce">{achievement.icon}</div>
                <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm text-yellow-100">
                        <Award size={14} /> Achievement Unlocked!
                    </div>
                    <div className="font-bold text-white">{achievement.name}</div>
                    <div className="text-xs text-yellow-200">🪙 +{achievement.coins} coins</div>
                </div>
            </div>
        </div>
    );
};

export default AchievementToast;
