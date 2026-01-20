// Puzzle Mode: 100 Levels
// Levels 1-30: Easy, 31-60: Medium, 61-85: Hard, 86-100: Expert
import { LevelConfig } from './types';
import { Position } from '../../types/game';

// Wall pattern generators
const generateBoxPattern = (size: number, offset: { x: number; y: number }): Position[] => {
    const walls: Position[] = [];
    for (let i = 0; i < size; i++) {
        walls.push({ x: offset.x + i, y: offset.y });
        walls.push({ x: offset.x + i, y: offset.y + size - 1 });
        walls.push({ x: offset.x, y: offset.y + i });
        walls.push({ x: offset.x + size - 1, y: offset.y + i });
    }
    return walls;
};

const generateSpiralPattern = (gridSize: number): Position[] => {
    const walls: Position[] = [];
    const mid = Math.floor(gridSize / 2);
    for (let i = 5; i < mid - 2; i++) {
        walls.push({ x: i, y: 10 });
        walls.push({ x: gridSize - i - 1, y: 20 });
    }
    return walls;
};

const generateRandomWalls = (count: number, gridSize: number, seed: number): Position[] => {
    const walls: Position[] = [];
    for (let i = 0; i < count; i++) {
        const x = Math.floor(((seed * (i + 1) * 7919) % 1000) / 1000 * (gridSize - 6)) + 3;
        const y = Math.floor(((seed * (i + 2) * 6997) % 1000) / 1000 * (gridSize - 6)) + 3;
        if (!walls.some(w => w.x === x && w.y === y)) {
            walls.push({ x, y });
        }
    }
    return walls;
};

// Generate all 100 puzzle levels
const generatePuzzleLevels = (): LevelConfig[] => {
    const levels: LevelConfig[] = [];

    for (let i = 1; i <= 100; i++) {
        let difficulty: LevelConfig['difficulty'];
        let targetScore: number;
        let movesLimit: number;
        let wallCount: number;
        let coinReward: number;

        if (i <= 30) {
            difficulty = 'easy';
            targetScore = 50 + i * 15;
            movesLimit = 100 - i;
            wallCount = Math.floor(i / 3);
            coinReward = 10 + Math.floor(i / 3) * 2;
        } else if (i <= 60) {
            difficulty = 'medium';
            targetScore = 400 + (i - 30) * 25;
            movesLimit = 80 - Math.floor((i - 30) / 2);
            wallCount = 10 + Math.floor((i - 30) / 2);
            coinReward = 30 + (i - 30) * 2;
        } else if (i <= 85) {
            difficulty = 'hard';
            targetScore = 1000 + (i - 60) * 40;
            movesLimit = 70 - Math.floor((i - 60) / 3);
            wallCount = 25 + Math.floor((i - 60) / 2);
            coinReward = 80 + (i - 60) * 3;
        } else {
            difficulty = 'expert';
            targetScore = 2000 + (i - 85) * 60;
            movesLimit = 55 - Math.floor((i - 85) / 2);
            wallCount = 40 + (i - 85) * 2;
            coinReward = 150 + (i - 85) * 10;
        }

        const names = [
            "First Puzzle", "Pattern Start", "Simple Path", "Easy Route", "Beginner's Luck",
            "Getting Better", "Smooth Moves", "Clean Lines", "Quick Think", "Milestone",
            "New Paths", "Zigzag", "Corner Cut", "Speed Up", "Halfway Easy",
            "The Grid", "Fast Lane", "Cross Path", "Growing", "Level Up",
            "Final Easy 1", "Final Easy 2", "Final Easy 3", "Final Easy 4", "Final Easy 5",
            "Final Easy 6", "Final Easy 7", "Final Easy 8", "Final Easy 9", "Easy Master",
            "Medium Start", "Step Up", "Maze Begin", "Speed Run", "Grid Work",
            "Obstacle Run", "Tight Spot", "Rush Mode", "Close Call", "Forty!",
            "Keep Going", "Labyrinth", "Speed Test", "Crowded", "Halfway",
            "No Errors", "Focus", "Path Find", "Final Push", "Fifty!",
            "Getting Hard", "Expert Prep 1", "Expert Prep 2", "Expert Prep 3", "Expert Prep 4",
            "Expert Prep 5", "Medium End 1", "Medium End 2", "Medium End 3", "Medium Master",
            "Hard Mode", "Trial", "Gauntlet", "Death Maze", "Precision",
            "Crucible", "Snake Pro", "Arena", "Lightning", "Seventy!",
            "Veteran", "Elite", "Nightmare", "Impossible", "Champion",
            "Hard End 1", "Hard End 2", "Hard End 3", "Hard End 4", "Eighty!",
            "Hard End 5", "Hard End 6", "Hard End 7", "Hard End 8", "Hard Master",
            "Expert", "Godlike", "Legend", "Mythic", "Ninety!",
            "Immortal", "Titan", "Overlord", "Ascended", "Final 1",
            "Final 2", "Final 3", "Final 4", "The End", "ULTIMATE"
        ];

        levels.push({
            id: i,
            name: names[i - 1] || `Level ${i}`,
            description: `Reach ${targetScore} points`,
            difficulty,
            targetScore,
            movesLimit,
            wallPattern: generateRandomWalls(wallCount, 40, i),
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

export const PUZZLE_LEVELS = generatePuzzleLevels();
export default PUZZLE_LEVELS;
