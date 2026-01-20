
import { ACHIEVEMENTS, Achievement } from '../data/achievements';
import storage from './storage';

export interface GameEvent {
    type: 'GAME_OVER' | 'WIN' | 'KILL';
    mode: 'battle' | 'classic';
    score?: number;
    kills?: number;
    level?: number;
    length?: number;
    foodEaten?: number;
    gameTime?: number; // seconds
    activePowerUps?: string[];
    eventId?: string | null;
    itemType?: string;
    novaBlasts?: number;
}

export const checkAchievements = (event: GameEvent): Achievement[] => {
    const unlocked: Achievement[] = [];
    const player = storage.getPlayer();
    const currentAchievements = storage.getAchievements();

    // Track seasonal challenges if applicable
    if (event.eventId && event.itemType) {
        const player = storage.getPlayer();
        const eventProgress = player.eventProgress || {};

        // Define challenge mapping (this should ideally be dynamic but for now matches data)
        const challengeMapping: Record<string, string[]> = {
            diwali: ['d1', 'd2'], // d1: Collect Diyas, d2: Light Lamps (same thing for now)
            christmas: ['c1', 'c2'], // c1: Presents, c2: Candy Canes
            valentine: ['v1'], // v1: Hearts
            chhath: ['ch1'], // ch1: Offerings
            dussehra: ['ds1', 'ds2'], // ds1: Score, ds2: Enemies
            eid: ['e1'], // e1: Crescents
        };

        const challenges = challengeMapping[event.eventId];
        if (challenges) {
            challenges.forEach(cId => {
                const key = `${event.eventId}_${cId}`;
                const currentProgress = eventProgress[key] || 0;
                eventProgress[key] = currentProgress + 1;
            });
            storage.savePlayer({ eventProgress });
        }
    }

    // Helper to check if already unlocked
    const isLocked = (id: string) => !currentAchievements[id]?.unlocked;

    // Helper to get progress value for an achievement
    const getProgressValue = (achievement: Achievement): number => {
        switch (achievement.id) {
            // Battle kills (total)
            case 'first_blood': return Math.min(player.totalKills, 1);
            case 'killer_5': return Math.min(player.totalKills, 5);
            case 'killer_25': return Math.min(player.totalKills, 25);
            case 'killer_100': return Math.min(player.totalKills, 100);

            // Kill streak (single game)
            case 'kill_streak_3': return Math.min(event.kills || 0, 3);
            case 'kill_streak_5': return Math.min(event.kills || 0, 5);
            case 'kill_streak_10': return Math.min(event.kills || 0, 10);

            // Wins (total)
            case 'winner_1': return Math.min(player.wins, 1);
            case 'winner_5': return Math.min(player.wins, 5);
            case 'winner_10': return Math.min(player.wins, 10);
            case 'winner_25': return Math.min(player.wins, 25);

            // Survival (single game)
            case 'survivor_60': return Math.min(event.gameTime || 0, 60);
            case 'survivor_180': return Math.min(event.gameTime || 0, 180);

            // Level
            case 'level_5': return Math.min(event.level || 0, 5);
            case 'level_10': return Math.min(event.level || 0, 10);

            // Classic scores
            case 'score_100': return Math.min(event.score || 0, 100);
            case 'score_500': return Math.min(event.score || 0, 500);
            case 'score_1000': return Math.min(event.score || 0, 1000);
            case 'score_2500': return Math.min(event.score || 0, 2500);
            case 'score_5000': return Math.min(event.score || 0, 5000);

            // Length
            case 'length_20': return Math.min(event.length || 0, 20);
            case 'length_50': return Math.min(event.length || 0, 50);
            case 'length_100': return Math.min(event.length || 0, 100);

            // Food (inferred from total score)
            case 'food_50': return Math.min(Math.floor(player.totalScore / 10), 50);
            case 'food_250': return Math.min(Math.floor(player.totalScore / 10), 250);
            case 'food_1000': return Math.min(Math.floor(player.totalScore / 10), 1000);

            // General
            case 'games_10': return Math.min(player.gamesPlayed, 10);
            case 'games_50': return Math.min(player.gamesPlayed, 50);
            case 'games_100': return Math.min(player.gamesPlayed, 100);
            case 'coins_500': return Math.min(player.coins, 500);
            case 'coins_2000': return Math.min(player.coins, 2000);
            case 'coins_5000': return Math.min(player.coins, 5000);
            case 'skins_3': return Math.min(player.unlockedSkins.length, 3);
            case 'skins_6': return Math.min(player.unlockedSkins.length, 6);
            case 'streak_3': return Math.min(player.longestStreak, 3);
            case 'streak_7': return Math.min(player.longestStreak, 7);
            case 'streak_30': return Math.min(player.longestStreak, 30);
            case 'nova_1': return Math.min(event.novaBlasts || 0, 1);
            case 'nova_10': return Math.min(event.novaBlasts || 0, 10);

            default: return 0;
        }
    };

    ACHIEVEMENTS.forEach(achievement => {
        if (!isLocked(achievement.id)) return;

        let conditionMet = false;

        // BATTLE MODE ACHIEVEMENTS
        if (achievement.category === 'battle' && event.mode === 'battle') {
            switch (achievement.id) {
                case 'first_blood': conditionMet = player.totalKills >= 1; break;
                case 'killer_5': conditionMet = player.totalKills >= 5; break;
                case 'killer_25': conditionMet = player.totalKills >= 25; break;
                case 'killer_100': conditionMet = player.totalKills >= 100; break;
                case 'kill_streak_3': conditionMet = (event.kills || 0) >= 3; break;
                case 'kill_streak_5': conditionMet = (event.kills || 0) >= 5; break;
                case 'kill_streak_10': conditionMet = (event.kills || 0) >= 10; break;
                case 'winner_1': conditionMet = player.wins >= 1; break;
                case 'winner_5': conditionMet = player.wins >= 5; break;
                case 'winner_10': conditionMet = player.wins >= 10; break;
                case 'winner_25': conditionMet = player.wins >= 25; break;
                case 'survivor_60': conditionMet = (event.gameTime || 0) >= 60; break;
                case 'survivor_180': conditionMet = (event.gameTime || 0) >= 180; break;
                case 'level_5': conditionMet = (event.level || 0) >= 5; break;
                case 'level_10': conditionMet = (event.level || 0) >= 10; break;
            }
        }

        // CLASSIC MODE ACHIEVEMENTS
        if (achievement.category === 'classic' && event.mode === 'classic') {
            switch (achievement.id) {
                case 'score_100': conditionMet = (event.score || 0) >= 100; break;
                case 'score_500': conditionMet = (event.score || 0) >= 500; break;
                case 'score_1000': conditionMet = (event.score || 0) >= 1000; break;
                case 'score_2500': conditionMet = (event.score || 0) >= 2500; break;
                case 'score_5000': conditionMet = (event.score || 0) >= 5000; break;
                case 'length_20': conditionMet = (event.length || 0) >= 20; break;
                case 'length_50': conditionMet = (event.length || 0) >= 50; break;
                case 'length_100': conditionMet = (event.length || 0) >= 100; break;
                case 'food_50': conditionMet = player.totalScore >= 500; break;
                case 'food_250': conditionMet = player.totalScore >= 2500; break;
                case 'food_1000': conditionMet = player.totalScore >= 10000; break;
            }
        }

        // GENERAL ACHIEVEMENTS
        if (achievement.category === 'general') {
            switch (achievement.id) {
                case 'games_10': conditionMet = player.gamesPlayed >= 10; break;
                case 'games_50': conditionMet = player.gamesPlayed >= 50; break;
                case 'games_100': conditionMet = player.gamesPlayed >= 100; break;
                case 'coins_500': conditionMet = player.coins >= 500; break;
                case 'coins_2000': conditionMet = player.coins >= 2000; break;
                case 'coins_5000': conditionMet = player.coins >= 5000; break;
                case 'skins_3': conditionMet = player.unlockedSkins.length >= 3; break;
                case 'skins_6': conditionMet = player.unlockedSkins.length >= 6; break;
                case 'streak_3': conditionMet = player.longestStreak >= 3; break;
                case 'streak_7': conditionMet = player.longestStreak >= 7; break;
                case 'streak_30': conditionMet = player.longestStreak >= 30; break;
            }
        }

        // SECRET ACHIEVEMENTS
        if (achievement.category === 'secret') {
            switch (achievement.id) {
                case 'pacifist':
                    conditionMet = event.mode === 'battle' && event.type === 'WIN' && (event.kills || 0) === 0;
                    break;
                case 'speed_demon':
                    conditionMet = event.mode === 'battle' && event.type === 'WIN' && event.activePowerUps?.includes('speed') || false;
                    break;
            }
        }

        // Save progress (even if not unlocked yet) - but only update if new progress is higher
        const progressValue = getProgressValue(achievement);
        const existingProgress = currentAchievements[achievement.id]?.progress || 0;
        if (progressValue > existingProgress) {
            storage.saveAchievement(achievement.id, { progress: progressValue });
        }

        if (conditionMet) {
            storage.saveAchievement(achievement.id, { unlocked: true, progress: achievement.target, unlockedAt: new Date().toISOString() });
            storage.addCoins(achievement.reward.coins);
            unlocked.push(achievement);
        }
    });

    return unlocked;
};

