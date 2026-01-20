// Physics Mode: 100 Levels
// Levels 1-30: Easy, 31-60: Medium, 61-85: Hard, 86-100: Expert
import { LevelConfig } from './types';

// Generate all 100 physics levels
const generatePhysicsLevels = (): LevelConfig[] => {
    const levels: LevelConfig[] = [];

    for (let i = 1; i <= 100; i++) {
        let difficulty: LevelConfig['difficulty'];
        let gravity: number;
        let wind: { direction: 'left' | 'right'; strength: number } | undefined;
        let platformCount: number;
        let coinReward: number;
        let targetScore: number;

        if (i <= 30) {
            difficulty = 'easy';
            gravity = 0.2 + (i / 100);
            platformCount = Math.max(2, Math.floor(i / 5));
            coinReward = 10 + Math.floor(i / 3) * 2;
            targetScore = 50 + i * 15;
        } else if (i <= 60) {
            difficulty = 'medium';
            gravity = 0.4 + ((i - 30) / 100);
            platformCount = 6 + Math.floor((i - 30) / 5);
            wind = i % 3 === 0 ? { direction: i % 2 === 0 ? 'left' : 'right', strength: 0.3 } : undefined;
            coinReward = 30 + (i - 30) * 2;
            targetScore = 400 + (i - 30) * 25;
        } else if (i <= 85) {
            difficulty = 'hard';
            gravity = 0.6 + ((i - 60) / 80);
            platformCount = 12 + Math.floor((i - 60) / 3);
            wind = { direction: i % 2 === 0 ? 'left' : 'right', strength: 0.3 + ((i - 60) / 100) };
            coinReward = 80 + (i - 60) * 3;
            targetScore = 1000 + (i - 60) * 40;
        } else {
            difficulty = 'expert';
            gravity = 0.8 + ((i - 85) / 50);
            platformCount = 20 + (i - 85);
            wind = { direction: i % 2 === 0 ? 'left' : 'right', strength: 0.5 + ((i - 85) / 30) };
            coinReward = 150 + (i - 85) * 10;
            targetScore = 2000 + (i - 85) * 60;
        }

        // Generate platforms based on level
        const platforms: { x: number; y: number; width: number }[] = [];
        for (let p = 0; p < platformCount; p++) {
            const seed = i * 100 + p;
            platforms.push({
                x: Math.floor(((seed * 7919) % 1000) / 1000 * 30) + 2,
                y: Math.floor(((seed * 6997) % 1000) / 1000 * 20) + 5,
                width: Math.floor(((seed * 5003) % 1000) / 1000 * 6) + 3
            });
        }

        const names = [
            "Gravity Intro", "Light Fall", "Easy Drop", "Soft Landing", "Gentle Slope",
            "Float Down", "Smooth Fall", "Easy Bounce", "Low Gravity", "Milestone",
            "New Heights", "Platform Jump", "Rising Up", "Speed Fall", "Halfway Easy",
            "Multi-Level", "Fast Drop", "Cross Jump", "Growing Fall", "Level Up",
            "Final Easy 1", "Final Easy 2", "Final Easy 3", "Final Easy 4", "Final Easy 5",
            "Final Easy 6", "Final Easy 7", "Final Easy 8", "Final Easy 9", "Easy Master",
            "Medium Gravity", "Heavier Fall", "Wind Starts", "Speed Drop", "Platform Pro",
            "Gravity Pull", "Tight Land", "Rush Fall", "Close Land", "Forty!",
            "Keep Falling", "Windy Path", "Speed Test", "Crowded Air", "Halfway",
            "No Mistakes", "Focus Fall", "Path Down", "Final Push", "Fifty!",
            "Heavy Mode", "Expert Prep 1", "Expert Prep 2", "Expert Prep 3", "Expert Prep 4",
            "Expert Prep 5", "Medium End 1", "Medium End 2", "Medium End 3", "Medium Master",
            "Hard Gravity", "Heavy Pull", "Storm Mode", "Death Drop", "Precision",
            "Crucible", "Physics Pro", "Arena Fall", "Lightning", "Seventy!",
            "Veteran Drop", "Elite Fall", "Nightmare", "Impossible", "Champion",
            "Hard End 1", "Hard End 2", "Hard End 3", "Hard End 4", "Eighty!",
            "Hard End 5", "Hard End 6", "Hard End 7", "Hard End 8", "Hard Master",
            "Expert", "Godlike", "Legend", "Mythic", "Ninety!",
            "Immortal", "Titan", "Overlord", "Ascended", "Final 1",
            "Final 2", "Final 3", "Final 4", "The End", "ULTIMATE"
        ];

        levels.push({
            id: i,
            name: names[i - 1] || `Level ${i}`,
            description: wind ? `Gravity: ${gravity.toFixed(1)}, Wind: ${wind.direction}` : `Gravity: ${gravity.toFixed(1)}`,
            difficulty,
            gravity,
            wind,
            platforms,
            targetScore,
            starThresholds: {
                one: targetScore,
                two: Math.floor(targetScore * 1.5),
                three: targetScore * 2
            },
            coinReward
        });
    }

    return levels;
};

export const PHYSICS_LEVELS = generatePhysicsLevels();
export default PHYSICS_LEVELS;
