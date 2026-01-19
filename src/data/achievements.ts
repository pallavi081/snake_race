// Achievement definitions

export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: 'battle' | 'classic' | 'general' | 'secret';
    target: number;
    reward: { coins: number; xp?: number; skin?: string };
}

export const ACHIEVEMENTS: Achievement[] = [
    // Battle Mode
    { id: 'first_blood', name: 'First Blood', description: 'Get your first kill', icon: '🩸', category: 'battle', target: 1, reward: { coins: 25 } },
    { id: 'killer_5', name: 'Killer', description: 'Get 5 kills in total', icon: '💀', category: 'battle', target: 5, reward: { coins: 50 } },
    { id: 'killer_25', name: 'Serial Killer', description: 'Get 25 kills in total', icon: '☠️', category: 'battle', target: 25, reward: { coins: 100 } },
    { id: 'killer_100', name: 'Massacre', description: 'Get 100 kills in total', icon: '🔥', category: 'battle', target: 100, reward: { coins: 250 } },
    { id: 'kill_streak_3', name: 'Triple Kill', description: 'Get 3 kills in one game', icon: '⚔️', category: 'battle', target: 3, reward: { coins: 50 } },
    { id: 'kill_streak_5', name: 'Rampage', description: 'Get 5 kills in one game', icon: '🗡️', category: 'battle', target: 5, reward: { coins: 100 } },
    { id: 'kill_streak_10', name: 'Unstoppable', description: 'Get 10 kills in one game', icon: '👑', category: 'battle', target: 10, reward: { coins: 250, skin: 'gold' } },
    { id: 'winner_1', name: 'Champion', description: 'Win your first battle', icon: '🏆', category: 'battle', target: 1, reward: { coins: 50 } },
    { id: 'winner_5', name: 'Veteran', description: 'Win 5 battles', icon: '🎖️', category: 'battle', target: 5, reward: { coins: 100 } },
    { id: 'winner_10', name: 'Legend', description: 'Win 10 battles', icon: '⭐', category: 'battle', target: 10, reward: { coins: 200 } },
    { id: 'winner_25', name: 'God', description: 'Win 25 battles', icon: '👼', category: 'battle', target: 25, reward: { coins: 500 } },
    { id: 'survivor_60', name: 'Survivor', description: 'Survive 1 minute in battle', icon: '⏱️', category: 'battle', target: 60, reward: { coins: 30 } },
    { id: 'survivor_180', name: 'Endurance', description: 'Survive 3 minutes in battle', icon: '⌛', category: 'battle', target: 180, reward: { coins: 75 } },
    { id: 'level_5', name: 'Rising Star', description: 'Reach Level 5 in battle', icon: '🌟', category: 'battle', target: 5, reward: { coins: 50 } },
    { id: 'level_10', name: 'Elite', description: 'Reach Level 10 in battle', icon: '💫', category: 'battle', target: 10, reward: { coins: 150 } },

    // Classic Mode
    { id: 'score_100', name: 'Beginner', description: 'Score 100 in Classic', icon: '🎮', category: 'classic', target: 100, reward: { coins: 25 } },
    { id: 'score_500', name: 'Intermediate', description: 'Score 500 in Classic', icon: '🕹️', category: 'classic', target: 500, reward: { coins: 75 } },
    { id: 'score_1000', name: 'Expert', description: 'Score 1000 in Classic', icon: '🎯', category: 'classic', target: 1000, reward: { coins: 150 } },
    { id: 'score_2500', name: 'Master', description: 'Score 2500 in Classic', icon: '🏅', category: 'classic', target: 2500, reward: { coins: 300 } },
    { id: 'score_5000', name: 'Grandmaster', description: 'Score 5000 in Classic', icon: '🥇', category: 'classic', target: 5000, reward: { coins: 500 } },
    { id: 'food_50', name: 'Hungry', description: 'Eat 50 food total', icon: '🍎', category: 'classic', target: 50, reward: { coins: 25 } },
    { id: 'food_250', name: 'Starving', description: 'Eat 250 food total', icon: '🍕', category: 'classic', target: 250, reward: { coins: 75 } },
    { id: 'food_1000', name: 'Glutton', description: 'Eat 1000 food total', icon: '🍔', category: 'classic', target: 1000, reward: { coins: 200 } },
    { id: 'length_20', name: 'Growing', description: 'Reach length 20', icon: '🐍', category: 'classic', target: 20, reward: { coins: 30 } },
    { id: 'length_50', name: 'Long Boi', description: 'Reach length 50', icon: '🐉', category: 'classic', target: 50, reward: { coins: 100 } },
    { id: 'length_100', name: 'Serpent', description: 'Reach length 100', icon: '🦎', category: 'classic', target: 100, reward: { coins: 250 } },

    // General
    { id: 'games_10', name: 'Player', description: 'Play 10 games', icon: '🎲', category: 'general', target: 10, reward: { coins: 25 } },
    { id: 'games_50', name: 'Dedicated', description: 'Play 50 games', icon: '🃏', category: 'general', target: 50, reward: { coins: 100 } },
    { id: 'games_100', name: 'Addicted', description: 'Play 100 games', icon: '🎰', category: 'general', target: 100, reward: { coins: 250 } },
    { id: 'coins_500', name: 'Saver', description: 'Earn 500 coins', icon: '💰', category: 'general', target: 500, reward: { coins: 50 } },
    { id: 'coins_2000', name: 'Rich', description: 'Earn 2000 coins', icon: '💎', category: 'general', target: 2000, reward: { coins: 150 } },
    { id: 'coins_5000', name: 'Wealthy', description: 'Earn 5000 coins', icon: '🤑', category: 'general', target: 5000, reward: { coins: 300 } },
    { id: 'skins_3', name: 'Fashionista', description: 'Unlock 3 skins', icon: '👗', category: 'general', target: 3, reward: { coins: 50 } },
    { id: 'skins_6', name: 'Collector', description: 'Unlock 6 skins', icon: '🎨', category: 'general', target: 6, reward: { coins: 150 } },
    { id: 'streak_3', name: 'Consistent', description: '3 day play streak', icon: '📅', category: 'general', target: 3, reward: { coins: 50 } },
    { id: 'streak_7', name: 'Weekly Warrior', description: '7 day play streak', icon: '🗓️', category: 'general', target: 7, reward: { coins: 150 } },
    { id: 'streak_30', name: 'Monthly Master', description: '30 day play streak', icon: '📆', category: 'general', target: 30, reward: { coins: 500 } },
    { id: 'daily_1', name: 'Challenger', description: 'Complete 1 daily challenge', icon: '✅', category: 'general', target: 1, reward: { coins: 25 } },
    { id: 'daily_10', name: 'Daily Driver', description: 'Complete 10 daily challenges', icon: '📝', category: 'general', target: 10, reward: { coins: 100 } },
    { id: 'daily_50', name: 'Challenge Master', description: 'Complete 50 daily challenges', icon: '📋', category: 'general', target: 50, reward: { coins: 300 } },
    { id: 'powerup_10', name: 'Power Hunter', description: 'Collect 10 power-ups', icon: '⚡', category: 'general', target: 10, reward: { coins: 30 } },
    { id: 'powerup_50', name: 'Power Addict', description: 'Collect 50 power-ups', icon: '🔋', category: 'general', target: 50, reward: { coins: 100 } },

    // Secret
    { id: 'speed_demon', name: 'Speed Demon', description: 'Win with max speed active', icon: '💨', category: 'secret', target: 1, reward: { coins: 200 } },
    { id: 'pacifist', name: 'Pacifist', description: 'Win without any kills', icon: '☮️', category: 'secret', target: 1, reward: { coins: 300 } },
    { id: 'perfect', name: 'Perfect', description: 'Win with full health/shield', icon: '💯', category: 'secret', target: 1, reward: { coins: 250 } },
    { id: 'comeback', name: 'Comeback King', description: 'Win after being lowest', icon: '👑', category: 'secret', target: 1, reward: { coins: 200 } },
    { id: 'explorer', name: 'Explorer', description: 'Visit all corners of map', icon: '🧭', category: 'secret', target: 1, reward: { coins: 100 } },
];

export const getAchievementById = (id: string): Achievement | undefined => ACHIEVEMENTS.find(a => a.id === id);
export const getAchievementsByCategory = (category: string): Achievement[] => ACHIEVEMENTS.filter(a => a.category === category);
