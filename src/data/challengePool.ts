// Daily Challenge Pool

export interface Challenge {
    id: string;
    title: string;
    description: string;
    icon: string;
    type: 'wins' | 'kills' | 'score' | 'food' | 'games' | 'level' | 'survive' | 'powerups';
    mode?: 'battle' | 'classic' | 'any';
    target: number;
    reward: { coins: number; xp?: number };
    difficulty: 'easy' | 'medium' | 'hard';
}

export const CHALLENGE_POOL: Challenge[] = [
    // Easy
    { id: 'play_1', title: 'Warm Up', description: 'Play 1 game', icon: '🎮', type: 'games', mode: 'any', target: 1, reward: { coins: 20 }, difficulty: 'easy' },
    { id: 'play_3', title: 'Getting Started', description: 'Play 3 games', icon: '🕹️', type: 'games', mode: 'any', target: 3, reward: { coins: 40 }, difficulty: 'easy' },
    { id: 'food_10', title: 'Snack Time', description: 'Eat 10 food', icon: '🍎', type: 'food', mode: 'any', target: 10, reward: { coins: 25 }, difficulty: 'easy' },
    { id: 'food_25', title: 'Light Meal', description: 'Eat 25 food', icon: '🍕', type: 'food', mode: 'any', target: 25, reward: { coins: 40 }, difficulty: 'easy' },
    { id: 'score_50', title: 'Baby Steps', description: 'Score 50 points', icon: '📊', type: 'score', mode: 'classic', target: 50, reward: { coins: 25 }, difficulty: 'easy' },
    { id: 'survive_30', title: 'Stay Alive', description: 'Survive 30 seconds in battle', icon: '⏱️', type: 'survive', mode: 'battle', target: 30, reward: { coins: 30 }, difficulty: 'easy' },

    // Medium
    { id: 'win_1', title: 'Victory', description: 'Win 1 battle', icon: '🏆', type: 'wins', mode: 'battle', target: 1, reward: { coins: 50 }, difficulty: 'medium' },
    { id: 'win_3', title: 'Triple Crown', description: 'Win 3 battles', icon: '👑', type: 'wins', mode: 'battle', target: 3, reward: { coins: 150 }, difficulty: 'medium' },
    { id: 'kills_3', title: 'Hunter', description: 'Get 3 kills', icon: '💀', type: 'kills', mode: 'battle', target: 3, reward: { coins: 50 }, difficulty: 'medium' },
    { id: 'kills_10', title: 'Predator', description: 'Get 10 kills', icon: '☠️', type: 'kills', mode: 'battle', target: 10, reward: { coins: 100 }, difficulty: 'medium' },
    { id: 'score_200', title: 'Go Big', description: 'Score 200 in Classic', icon: '🎯', type: 'score', mode: 'classic', target: 200, reward: { coins: 60 }, difficulty: 'medium' },
    { id: 'food_50', title: 'Feast', description: 'Eat 50 food', icon: '🍔', type: 'food', mode: 'any', target: 50, reward: { coins: 60 }, difficulty: 'medium' },
    { id: 'level_3', title: 'Level Up', description: 'Reach Level 3 in battle', icon: '⬆️', type: 'level', mode: 'battle', target: 3, reward: { coins: 50 }, difficulty: 'medium' },
    { id: 'survive_60', title: 'Survivor', description: 'Survive 1 minute in battle', icon: '⌛', type: 'survive', mode: 'battle', target: 60, reward: { coins: 60 }, difficulty: 'medium' },
    { id: 'powerup_3', title: 'Power Grab', description: 'Collect 3 power-ups', icon: '⚡', type: 'powerups', mode: 'battle', target: 3, reward: { coins: 40 }, difficulty: 'medium' },
    { id: 'play_5', title: 'Marathon', description: 'Play 5 games', icon: '🏃', type: 'games', mode: 'any', target: 5, reward: { coins: 75 }, difficulty: 'medium' },

    // Hard
    { id: 'win_5', title: 'Dominator', description: 'Win 5 battles', icon: '🔥', type: 'wins', mode: 'battle', target: 5, reward: { coins: 250 }, difficulty: 'hard' },
    { id: 'kills_20', title: 'Slayer', description: 'Get 20 kills', icon: '🗡️', type: 'kills', mode: 'battle', target: 20, reward: { coins: 200 }, difficulty: 'hard' },
    { id: 'score_500', title: 'High Scorer', description: 'Score 500 in Classic', icon: '🏅', type: 'score', mode: 'classic', target: 500, reward: { coins: 150 }, difficulty: 'hard' },
    { id: 'level_5', title: 'Elite', description: 'Reach Level 5 in battle', icon: '⭐', type: 'level', mode: 'battle', target: 5, reward: { coins: 120 }, difficulty: 'hard' },
    { id: 'survive_120', title: 'Immortal', description: 'Survive 2 minutes in battle', icon: '💪', type: 'survive', mode: 'battle', target: 120, reward: { coins: 150 }, difficulty: 'hard' },
    { id: 'food_100', title: 'Glutton', description: 'Eat 100 food', icon: '🍗', type: 'food', mode: 'any', target: 100, reward: { coins: 120 }, difficulty: 'hard' },
    { id: 'powerup_10', title: 'Power Master', description: 'Collect 10 power-ups', icon: '🔋', type: 'powerups', mode: 'battle', target: 10, reward: { coins: 100 }, difficulty: 'hard' },
];

// Get random challenges for the day
export const getDailyChallenges = (count: number = 3): Challenge[] => {
    const shuffled = [...CHALLENGE_POOL].sort(() => Math.random() - 0.5);
    // Get 1 easy, 1 medium, 1 hard
    const easy = shuffled.find(c => c.difficulty === 'easy');
    const medium = shuffled.find(c => c.difficulty === 'medium');
    const hard = shuffled.find(c => c.difficulty === 'hard');
    return [easy!, medium!, hard!].filter(Boolean).slice(0, count);
};

// Generate seed for consistent daily challenges
export const getDailySeed = (): number => {
    const today = new Date();
    return today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
};

// Seeded random for consistent daily challenges
export const getSeededDailyChallenges = (): Challenge[] => {
    const seed = getDailySeed();
    const seededRandom = (n: number) => {
        const x = Math.sin(seed * n) * 10000;
        return x - Math.floor(x);
    };

    const easy = CHALLENGE_POOL.filter(c => c.difficulty === 'easy');
    const medium = CHALLENGE_POOL.filter(c => c.difficulty === 'medium');
    const hard = CHALLENGE_POOL.filter(c => c.difficulty === 'hard');

    return [
        easy[Math.floor(seededRandom(1) * easy.length)],
        medium[Math.floor(seededRandom(2) * medium.length)],
        hard[Math.floor(seededRandom(3) * hard.length)],
    ];
};
