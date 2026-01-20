// Storage utility for localStorage
const STORAGE_KEYS = {
    PLAYER_DATA: 'snake_race_player',
    LEADERBOARD: 'snake_race_leaderboard',
    ACHIEVEMENTS: 'snake_race_achievements',
    DAILY_CHALLENGES: 'snake_race_daily',
    SHOP: 'snake_race_shop',
    SETTINGS: 'snake_race_settings',
};

// Player data
export interface PlayerData {
    name: string;
    coins: number;
    totalScore: number;
    totalKills: number;
    gamesPlayed: number;
    wins: number;
    currentStreak: number;
    longestStreak: number;
    lastPlayDate: string;
    selectedSkin: string;
    selectedTheme: string;
    unlockedSkins: string[];
    unlockedThemes: string[];
}

// Game Settings
export interface GameSettings {
    soundEnabled: boolean;
    vibrationEnabled: boolean;
    musicEnabled: boolean;
    difficulty: 'easy' | 'normal' | 'hard';
}

// Leaderboard entry
export interface LeaderboardEntry {
    id: string;
    name: string;
    score: number;
    level: number;
    kills: number;
    mode: string;
    date: string;
}

// Achievement progress
export interface AchievementProgress {
    id: string;
    unlocked: boolean;
    progress: number;
    unlockedAt?: string;
}

// Daily challenge
export interface DailyChallengeState {
    date: string;
    challenges: { id: string; progress: number; completed: boolean }[];
    streak: number;
}

// Default player data
const defaultPlayerData: PlayerData = {
    name: 'Player',
    coins: 100,
    totalScore: 0,
    totalKills: 0,
    gamesPlayed: 0,
    wins: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastPlayDate: '',
    selectedSkin: 'default',
    selectedTheme: 'default',
    unlockedSkins: ['default'],
    unlockedThemes: ['default'],
};

const defaultSettings: GameSettings = {
    soundEnabled: true,
    vibrationEnabled: true,
    musicEnabled: true,
    difficulty: 'normal',
};

// Storage functions
export const storage = {
    // Player
    getPlayer: (): PlayerData => {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.PLAYER_DATA);
            return data ? { ...defaultPlayerData, ...JSON.parse(data) } : defaultPlayerData;
        } catch {
            return defaultPlayerData;
        }
    },

    savePlayer: (data: Partial<PlayerData>) => {
        const current = storage.getPlayer();
        localStorage.setItem(STORAGE_KEYS.PLAYER_DATA, JSON.stringify({ ...current, ...data }));
    },

    // Leaderboard
    getLeaderboard: (mode?: string): LeaderboardEntry[] => {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.LEADERBOARD);
            const entries: LeaderboardEntry[] = data ? JSON.parse(data) : [];
            if (mode) return entries.filter(e => e.mode === mode).sort((a, b) => b.score - a.score).slice(0, 100);
            return entries.sort((a, b) => b.score - a.score).slice(0, 100);
        } catch {
            return [];
        }
    },

    addLeaderboardEntry: (entry: Omit<LeaderboardEntry, 'id' | 'date'>, userId?: string, userPhoto?: string) => {
        const entries = storage.getLeaderboard();
        const newEntry: LeaderboardEntry = {
            ...entry,
            id: Date.now().toString(),
            date: new Date().toISOString(),
        };
        entries.push(newEntry);
        // Keep top 500 overall
        entries.sort((a, b) => b.score - a.score);
        localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(entries.slice(0, 500)));

        // If user is authenticated, also submit to global leaderboard
        if (userId) {
            import('./cloudStorage').then(({ addToGlobalLeaderboard }) => {
                addToGlobalLeaderboard({
                    name: entry.name,
                    score: entry.score,
                    mode: entry.mode,
                    level: entry.level,
                    kills: entry.kills,
                    userId: userId,
                    photoURL: userPhoto
                }).catch(console.error);
            });
        }
    },

    // Achievements
    getAchievements: (): Record<string, AchievementProgress> => {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
            return data ? JSON.parse(data) : {};
        } catch {
            return {};
        }
    },

    saveAchievement: (id: string, progress: Partial<AchievementProgress>) => {
        const achievements = storage.getAchievements();
        achievements[id] = { unlocked: false, progress: 0, ...achievements[id], ...progress, id };
        localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, JSON.stringify(achievements));
    },

    // Daily Challenges
    getDailyChallenges: (): DailyChallengeState | null => {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.DAILY_CHALLENGES);
            return data ? JSON.parse(data) : null;
        } catch {
            return null;
        }
    },

    saveDailyChallenges: (state: DailyChallengeState) => {
        localStorage.setItem(STORAGE_KEYS.DAILY_CHALLENGES, JSON.stringify(state));
    },

    // Add coins
    addCoins: (amount: number) => {
        const player = storage.getPlayer();
        storage.savePlayer({ coins: player.coins + amount });
    },

    // Check if new day
    isNewDay: (): boolean => {
        const player = storage.getPlayer();
        const today = new Date().toDateString();
        return player.lastPlayDate !== today;
    },

    // Update streak
    updateStreak: () => {
        const player = storage.getPlayer();
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();

        if (player.lastPlayDate === yesterday) {
            const newStreak = player.currentStreak + 1;
            storage.savePlayer({
                currentStreak: newStreak,
                longestStreak: Math.max(newStreak, player.longestStreak),
                lastPlayDate: today,
            });
        } else if (player.lastPlayDate !== today) {
            storage.savePlayer({ currentStreak: 1, lastPlayDate: today });
        }
    },

    // Data Export/Import
    exportData: (): string => {
        const data = {
            player: localStorage.getItem(STORAGE_KEYS.PLAYER_DATA),
            leaderboard: localStorage.getItem(STORAGE_KEYS.LEADERBOARD),
            achievements: localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS),
            daily: localStorage.getItem(STORAGE_KEYS.DAILY_CHALLENGES),
            shop: localStorage.getItem(STORAGE_KEYS.SHOP),
            settings: localStorage.getItem(STORAGE_KEYS.SETTINGS),
            version: '1.0'
        };
        return btoa(JSON.stringify(data));
    },

    importData: (encodedData: string): boolean => {
        try {
            const json = atob(encodedData);
            const data = JSON.parse(json);

            if (!data.version) return false;

            if (data.player) localStorage.setItem(STORAGE_KEYS.PLAYER_DATA, data.player);
            if (data.leaderboard) localStorage.setItem(STORAGE_KEYS.LEADERBOARD, data.leaderboard);
            if (data.achievements) localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, data.achievements);
            if (data.daily) localStorage.setItem(STORAGE_KEYS.DAILY_CHALLENGES, data.daily);
            if (data.shop) localStorage.setItem(STORAGE_KEYS.SHOP, data.shop);
            if (data.settings) localStorage.setItem(STORAGE_KEYS.SETTINGS, data.settings);

            return true;
        } catch (e) {
            console.error('Failed to import data:', e);
            return false;
        }
    },

    // Settings
    getSettings: (): GameSettings => {
        try {
            const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
            return data ? { ...defaultSettings, ...JSON.parse(data) } : defaultSettings;
        } catch {
            return defaultSettings;
        }
    },

    saveSettings: (settings: Partial<GameSettings>) => {
        const current = storage.getSettings();
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify({ ...current, ...settings }));
    }
};

export default storage;
