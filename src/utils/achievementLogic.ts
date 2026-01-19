
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
}

export const checkAchievements = (event: GameEvent): Achievement[] => {
    const unlocked: Achievement[] = [];
    const player = storage.getPlayer();
    const currentAchievements = storage.getAchievements();

    // Helper to check if already unlocked
    const isLocked = (id: string) => !currentAchievements[id]?.unlocked;

    ACHIEVEMENTS.forEach(achievement => {
        if (!isLocked(achievement.id)) return;

        let conditionMet = false;

        // BATTLE MODE ACHIEVEMENTS
        if (achievement.category === 'battle' && event.mode === 'battle') {
            switch (achievement.id) {
                // Kills (Total)
                case 'first_blood': conditionMet = player.totalKills >= 1; break;
                case 'killer_5': conditionMet = player.totalKills >= 5; break;
                case 'killer_25': conditionMet = player.totalKills >= 25; break;
                case 'killer_100': conditionMet = player.totalKills >= 100; break;

                // Kill Streak (Single Game)
                case 'kill_streak_3': conditionMet = (event.kills || 0) >= 3; break;
                case 'kill_streak_5': conditionMet = (event.kills || 0) >= 5; break;
                case 'kill_streak_10': conditionMet = (event.kills || 0) >= 10; break;

                // Wins (Total)
                case 'winner_1': conditionMet = player.wins >= 1; break;
                case 'winner_5': conditionMet = player.wins >= 5; break;
                case 'winner_10': conditionMet = player.wins >= 10; break;
                case 'winner_25': conditionMet = player.wins >= 25; break;

                // Survival (Single Game)
                case 'survivor_60': conditionMet = (event.gameTime || 0) >= 60; break;
                case 'survivor_180': conditionMet = (event.gameTime || 0) >= 180; break;

                // Level (Single Game)
                case 'level_5': conditionMet = (event.level || 0) >= 5; break;
                case 'level_10': conditionMet = (event.level || 0) >= 10; break;
            }
        }

        // CLASSIC MODE ACHIEVEMENTS
        if (achievement.category === 'classic' && event.mode === 'classic') {
            switch (achievement.id) {
                // Score (Single Game)
                case 'score_100': conditionMet = (event.score || 0) >= 100; break;
                case 'score_500': conditionMet = (event.score || 0) >= 500; break;
                case 'score_1000': conditionMet = (event.score || 0) >= 1000; break;
                case 'score_2500': conditionMet = (event.score || 0) >= 2500; break;
                case 'score_5000': conditionMet = (event.score || 0) >= 5000; break;

                // Snake Length (Single Game - approximated by score/10 or tracked separately)
                // Assuming score roughly correlates to length in classic, or use explicit length if passed
                case 'length_20': conditionMet = (event.length || 0) >= 20; break;
                case 'length_50': conditionMet = (event.length || 0) >= 50; break;
                case 'length_100': conditionMet = (event.length || 0) >= 100; break;

                // Food (Total - need to track food in storage first, for now use score approximation or local storage specific key)
                // Since we don't explicitly track 'totalFood' in PlayerData yet, skipping or inferring from score (Score / 10 = Food)
                // Let's infer from Total Score for now: 1 Food = 10 pts roughly
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
                // Pacifist: Win with 0 kills in Battle
                case 'pacifist':
                    conditionMet = event.mode === 'battle' && event.type === 'WIN' && (event.kills || 0) === 0;
                    break;
                // Speed Demon: Win with speed powerup active
                case 'speed_demon':
                    conditionMet = event.mode === 'battle' && event.type === 'WIN' && event.activePowerUps?.includes('speed') || false;
                    break;
            }
        }

        if (conditionMet) {
            storage.saveAchievement(achievement.id, { unlocked: true, progress: 100, unlockedAt: new Date().toISOString() });
            storage.addCoins(achievement.reward.coins);
            unlocked.push(achievement);
        }
    });

    return unlocked;
};
