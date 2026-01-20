// Classic Mode: 100 Levels
// Levels 1-30: Easy, 31-60: Medium, 61-85: Hard, 86-100: Expert
import { LevelConfig } from './types';
import { Position } from '../../types/game';

// Helper to generate obstacle patterns
const generateBorderObstacles = (gridSize: number, gaps: number[] = []): Position[] => {
    const obstacles: Position[] = [];
    for (let i = 0; i < gridSize; i++) {
        if (!gaps.includes(i)) {
            obstacles.push({ x: i, y: 0 }); // Top
            obstacles.push({ x: i, y: gridSize - 1 }); // Bottom
            obstacles.push({ x: 0, y: i }); // Left
            obstacles.push({ x: gridSize - 1, y: i }); // Right
        }
    }
    return obstacles;
};

const generateRandomObstacles = (count: number, gridSize: number, seed: number): Position[] => {
    const obstacles: Position[] = [];
    const rng = (n: number) => ((seed * n * 9301 + 49297) % 233280) / 233280;
    for (let i = 0; i < count; i++) {
        const x = Math.floor(rng(i * 2) * (gridSize - 4)) + 2;
        const y = Math.floor(rng(i * 2 + 1) * (gridSize - 4)) + 2;
        if (!obstacles.some(o => o.x === x && o.y === y)) {
            obstacles.push({ x, y });
        }
    }
    return obstacles;
};

const generateMazePattern = (type: number, gridSize: number): Position[] => {
    const obstacles: Position[] = [];
    const mid = Math.floor(gridSize / 2);

    switch (type) {
        case 1: // Vertical lines
            for (let y = 5; y < gridSize - 5; y++) {
                obstacles.push({ x: 10, y });
                obstacles.push({ x: 30, y });
            }
            break;
        case 2: // Horizontal lines
            for (let x = 5; x < gridSize - 5; x++) {
                obstacles.push({ x, y: 10 });
                obstacles.push({ x, y: 20 });
            }
            break;
        case 3: // Cross
            for (let i = 5; i < 35; i++) {
                if (i !== mid) {
                    obstacles.push({ x: mid, y: i });
                    obstacles.push({ x: i, y: mid });
                }
            }
            break;
        case 4: // Corners
            for (let i = 0; i < 8; i++) {
                obstacles.push({ x: 5 + i, y: 5 });
                obstacles.push({ x: 5, y: 5 + i });
                obstacles.push({ x: 35 - i, y: 5 });
                obstacles.push({ x: 35, y: 5 + i });
                obstacles.push({ x: 5 + i, y: 25 });
                obstacles.push({ x: 5, y: 25 - i });
                obstacles.push({ x: 35 - i, y: 25 });
                obstacles.push({ x: 35, y: 25 - i });
            }
            break;
        default:
            break;
    }
    return obstacles;
};

export const CLASSIC_LEVELS: LevelConfig[] = [
    // ===== EASY LEVELS (1-30) =====
    { id: 1, name: "First Steps", description: "Learn the basics", difficulty: 'easy', speed: 5, obstacles: [], starThresholds: { one: 50, two: 100, three: 200 }, coinReward: 10 },
    { id: 2, name: "Getting Started", description: "Collect more food", difficulty: 'easy', speed: 5, obstacles: [], starThresholds: { one: 75, two: 150, three: 250 }, coinReward: 10 },
    { id: 3, name: "Warming Up", description: "Keep growing", difficulty: 'easy', speed: 6, obstacles: [], starThresholds: { one: 100, two: 200, three: 300 }, coinReward: 10 },
    { id: 4, name: "Slow and Steady", description: "Take your time", difficulty: 'easy', speed: 6, obstacles: generateRandomObstacles(3, 40, 4), starThresholds: { one: 100, two: 200, three: 350 }, coinReward: 12 },
    { id: 5, name: "First Obstacles", description: "Watch out!", difficulty: 'easy', speed: 6, obstacles: generateRandomObstacles(5, 40, 5), starThresholds: { one: 100, two: 250, three: 400 }, coinReward: 12 },
    { id: 6, name: "Pathfinder", description: "Navigate around", difficulty: 'easy', speed: 7, obstacles: generateRandomObstacles(7, 40, 6), starThresholds: { one: 125, two: 275, three: 450 }, coinReward: 15 },
    { id: 7, name: "Quick Thinking", description: "Speed increases!", difficulty: 'easy', speed: 7, obstacles: generateRandomObstacles(8, 40, 7), starThresholds: { one: 150, two: 300, three: 500 }, coinReward: 15 },
    { id: 8, name: "Corner Cutter", description: "Master tight turns", difficulty: 'easy', speed: 7, obstacles: generateMazePattern(4, 40), starThresholds: { one: 125, two: 275, three: 450 }, coinReward: 15 },
    { id: 9, name: "The Long Way", description: "Efficiency matters", difficulty: 'easy', speed: 8, obstacles: generateRandomObstacles(10, 40, 9), starThresholds: { one: 150, two: 350, three: 550 }, coinReward: 18 },
    { id: 10, name: "Checkpoint", description: "First milestone!", difficulty: 'easy', speed: 8, obstacles: generateRandomObstacles(12, 40, 10), starThresholds: { one: 175, two: 400, three: 600 }, coinReward: 20 },
    { id: 11, name: "New Challenges", description: "More obstacles", difficulty: 'easy', speed: 8, obstacles: generateRandomObstacles(14, 40, 11), starThresholds: { one: 175, two: 400, three: 625 }, coinReward: 20 },
    { id: 12, name: "Zigzag Zone", description: "Weave through", difficulty: 'easy', speed: 8, obstacles: generateMazePattern(1, 40), starThresholds: { one: 150, two: 350, three: 575 }, coinReward: 20 },
    { id: 13, name: "Speed Bump", description: "Faster now", difficulty: 'easy', speed: 9, obstacles: generateRandomObstacles(10, 40, 13), starThresholds: { one: 200, two: 425, three: 650 }, coinReward: 22 },
    { id: 14, name: "Careful Steps", description: "Precision needed", difficulty: 'easy', speed: 9, obstacles: generateRandomObstacles(15, 40, 14), starThresholds: { one: 200, two: 450, three: 675 }, coinReward: 22 },
    { id: 15, name: "Halfway Easy", description: "You're improving!", difficulty: 'easy', speed: 9, obstacles: generateRandomObstacles(16, 40, 15), starThresholds: { one: 225, two: 475, three: 700 }, coinReward: 25 },
    { id: 16, name: "The Gauntlet", description: "Many blocks", difficulty: 'easy', speed: 9, obstacles: generateRandomObstacles(18, 40, 16), starThresholds: { one: 225, two: 500, three: 725 }, coinReward: 25 },
    { id: 17, name: "Quick Reflexes", description: "React fast!", difficulty: 'easy', speed: 10, obstacles: generateRandomObstacles(12, 40, 17), starThresholds: { one: 250, two: 525, three: 750 }, coinReward: 28 },
    { id: 18, name: "Cross Roads", description: "Pick your path", difficulty: 'easy', speed: 10, obstacles: generateMazePattern(3, 40), starThresholds: { one: 225, two: 500, three: 725 }, coinReward: 28 },
    { id: 19, name: "Growing Pains", description: "Long snake!", difficulty: 'easy', speed: 10, obstacles: generateRandomObstacles(20, 40, 19), starThresholds: { one: 275, two: 550, three: 800 }, coinReward: 30 },
    { id: 20, name: "Level Up!", description: "20 cleared!", difficulty: 'easy', speed: 10, obstacles: generateRandomObstacles(22, 40, 20), starThresholds: { one: 300, two: 600, three: 850 }, coinReward: 35 },
    { id: 21, name: "Final Easy 1", description: "Last stretch", difficulty: 'easy', speed: 10, obstacles: generateRandomObstacles(24, 40, 21), starThresholds: { one: 300, two: 625, three: 875 }, coinReward: 35 },
    { id: 22, name: "Final Easy 2", description: "Almost there", difficulty: 'easy', speed: 11, obstacles: generateRandomObstacles(20, 40, 22), starThresholds: { one: 325, two: 650, three: 900 }, coinReward: 38 },
    { id: 23, name: "Final Easy 3", description: "Keep going", difficulty: 'easy', speed: 11, obstacles: generateMazePattern(2, 40), starThresholds: { one: 300, two: 625, three: 875 }, coinReward: 38 },
    { id: 24, name: "Final Easy 4", description: "Medium awaits", difficulty: 'easy', speed: 11, obstacles: generateRandomObstacles(26, 40, 24), starThresholds: { one: 350, two: 675, three: 925 }, coinReward: 40 },
    { id: 25, name: "Final Easy 5", description: "Push through", difficulty: 'easy', speed: 11, obstacles: generateRandomObstacles(28, 40, 25), starThresholds: { one: 350, two: 700, three: 950 }, coinReward: 40 },
    { id: 26, name: "Final Easy 6", description: "You've got this", difficulty: 'easy', speed: 11, obstacles: generateRandomObstacles(25, 40, 26), starThresholds: { one: 375, two: 725, three: 975 }, coinReward: 42 },
    { id: 27, name: "Final Easy 7", description: "Stay focused", difficulty: 'easy', speed: 12, obstacles: generateRandomObstacles(22, 40, 27), starThresholds: { one: 375, two: 750, three: 1000 }, coinReward: 42 },
    { id: 28, name: "Final Easy 8", description: "Nearly done", difficulty: 'easy', speed: 12, obstacles: generateRandomObstacles(28, 40, 28), starThresholds: { one: 400, two: 775, three: 1025 }, coinReward: 45 },
    { id: 29, name: "Final Easy 9", description: "One more!", difficulty: 'easy', speed: 12, obstacles: generateRandomObstacles(30, 40, 29), starThresholds: { one: 400, two: 800, three: 1050 }, coinReward: 45 },
    { id: 30, name: "Easy Champion", description: "Easy complete!", difficulty: 'easy', speed: 12, obstacles: generateRandomObstacles(32, 40, 30), starThresholds: { one: 425, two: 850, three: 1100 }, coinReward: 50 },

    // ===== MEDIUM LEVELS (31-60) =====
    { id: 31, name: "Medium Begins", description: "New difficulty", difficulty: 'medium', speed: 12, obstacles: generateRandomObstacles(20, 40, 31), starThresholds: { one: 400, two: 800, three: 1100 }, coinReward: 50 },
    { id: 32, name: "Stepping Up", description: "Real challenge", difficulty: 'medium', speed: 12, obstacles: generateRandomObstacles(25, 40, 32), starThresholds: { one: 425, two: 850, three: 1150 }, coinReward: 52 },
    { id: 33, name: "Maze Runner", description: "Complex paths", difficulty: 'medium', speed: 13, obstacles: generateMazePattern(1, 40).concat(generateMazePattern(2, 40)), starThresholds: { one: 400, two: 825, three: 1125 }, coinReward: 52 },
    { id: 34, name: "Speed Demon", description: "Fast and furious", difficulty: 'medium', speed: 13, obstacles: generateRandomObstacles(25, 40, 34), starThresholds: { one: 450, two: 875, three: 1175 }, coinReward: 55 },
    { id: 35, name: "The Grid", description: "Precision only", difficulty: 'medium', speed: 13, obstacles: generateRandomObstacles(30, 40, 35), starThresholds: { one: 450, two: 900, three: 1200 }, coinReward: 55 },
    { id: 36, name: "Obstacle Course", description: "Many blocks", difficulty: 'medium', speed: 13, obstacles: generateRandomObstacles(35, 40, 36), starThresholds: { one: 475, two: 925, three: 1225 }, coinReward: 58 },
    { id: 37, name: "Snake Pit", description: "Tight spaces", difficulty: 'medium', speed: 14, obstacles: generateRandomObstacles(32, 40, 37), starThresholds: { one: 475, two: 950, three: 1250 }, coinReward: 58 },
    { id: 38, name: "Rush Hour", description: "No time to spare", difficulty: 'medium', speed: 14, obstacles: generateRandomObstacles(28, 40, 38), starThresholds: { one: 500, two: 975, three: 1275 }, coinReward: 60 },
    { id: 39, name: "Narrow Escape", description: "Close calls", difficulty: 'medium', speed: 14, obstacles: generateRandomObstacles(35, 40, 39), starThresholds: { one: 500, two: 1000, three: 1300 }, coinReward: 60 },
    { id: 40, name: "Forty Strong", description: "40 levels!", difficulty: 'medium', speed: 14, obstacles: generateRandomObstacles(38, 40, 40), starThresholds: { one: 525, two: 1025, three: 1350 }, coinReward: 65 },
    { id: 41, name: "Persistence", description: "Keep trying", difficulty: 'medium', speed: 14, obstacles: generateRandomObstacles(40, 40, 41), starThresholds: { one: 525, two: 1050, three: 1375 }, coinReward: 65 },
    { id: 42, name: "Labyrinth", description: "Find the way", difficulty: 'medium', speed: 15, obstacles: generateMazePattern(3, 40).concat(generateMazePattern(4, 40)), starThresholds: { one: 500, two: 1000, three: 1350 }, coinReward: 68 },
    { id: 43, name: "Speed Master", description: "Fast reflexes", difficulty: 'medium', speed: 15, obstacles: generateRandomObstacles(35, 40, 43), starThresholds: { one: 550, two: 1075, three: 1400 }, coinReward: 68 },
    { id: 44, name: "Crowded Space", description: "So many blocks", difficulty: 'medium', speed: 15, obstacles: generateRandomObstacles(42, 40, 44), starThresholds: { one: 550, two: 1100, three: 1425 }, coinReward: 70 },
    { id: 45, name: "Halfway There", description: "45 complete!", difficulty: 'medium', speed: 15, obstacles: generateRandomObstacles(45, 40, 45), starThresholds: { one: 575, two: 1125, three: 1475 }, coinReward: 75 },
    { id: 46, name: "No Mistakes", description: "Perfection", difficulty: 'medium', speed: 15, obstacles: generateRandomObstacles(40, 40, 46), starThresholds: { one: 575, two: 1150, three: 1500 }, coinReward: 75 },
    { id: 47, name: "Tunnel Vision", description: "Stay focused", difficulty: 'medium', speed: 16, obstacles: generateRandomObstacles(38, 40, 47), starThresholds: { one: 600, two: 1175, three: 1525 }, coinReward: 78 },
    { id: 48, name: "Path Master", description: "Plan ahead", difficulty: 'medium', speed: 16, obstacles: generateRandomObstacles(42, 40, 48), starThresholds: { one: 600, two: 1200, three: 1550 }, coinReward: 78 },
    { id: 49, name: "Final Stretch", description: "Almost there", difficulty: 'medium', speed: 16, obstacles: generateRandomObstacles(45, 40, 49), starThresholds: { one: 625, two: 1225, three: 1575 }, coinReward: 80 },
    { id: 50, name: "Fifty!", description: "Halfway done!", difficulty: 'medium', speed: 16, obstacles: generateRandomObstacles(48, 40, 50), starThresholds: { one: 650, two: 1275, three: 1650 }, coinReward: 100 },
    { id: 51, name: "Into the Hard", description: "Harder now", difficulty: 'medium', speed: 16, obstacles: generateRandomObstacles(50, 40, 51), starThresholds: { one: 650, two: 1300, three: 1675 }, coinReward: 85 },
    { id: 52, name: "Expert Prep 1", description: "Getting ready", difficulty: 'medium', speed: 16, obstacles: generateRandomObstacles(48, 40, 52), starThresholds: { one: 675, two: 1325, three: 1700 }, coinReward: 85 },
    { id: 53, name: "Expert Prep 2", description: "Training hard", difficulty: 'medium', speed: 17, obstacles: generateRandomObstacles(45, 40, 53), starThresholds: { one: 675, two: 1350, three: 1725 }, coinReward: 88 },
    { id: 54, name: "Expert Prep 3", description: "Almost ready", difficulty: 'medium', speed: 17, obstacles: generateRandomObstacles(50, 40, 54), starThresholds: { one: 700, two: 1375, three: 1750 }, coinReward: 88 },
    { id: 55, name: "Expert Prep 4", description: "Stay sharp", difficulty: 'medium', speed: 17, obstacles: generateRandomObstacles(52, 40, 55), starThresholds: { one: 700, two: 1400, three: 1775 }, coinReward: 90 },
    { id: 56, name: "Expert Prep 5", description: "Final push", difficulty: 'medium', speed: 17, obstacles: generateRandomObstacles(48, 40, 56), starThresholds: { one: 725, two: 1425, three: 1800 }, coinReward: 90 },
    { id: 57, name: "Medium Final 1", description: "End in sight", difficulty: 'medium', speed: 17, obstacles: generateRandomObstacles(54, 40, 57), starThresholds: { one: 725, two: 1450, three: 1825 }, coinReward: 92 },
    { id: 58, name: "Medium Final 2", description: "Keep going", difficulty: 'medium', speed: 18, obstacles: generateRandomObstacles(50, 40, 58), starThresholds: { one: 750, two: 1475, three: 1850 }, coinReward: 95 },
    { id: 59, name: "Medium Final 3", description: "One more", difficulty: 'medium', speed: 18, obstacles: generateRandomObstacles(55, 40, 59), starThresholds: { one: 750, two: 1500, three: 1875 }, coinReward: 95 },
    { id: 60, name: "Medium Master", description: "Medium done!", difficulty: 'medium', speed: 18, obstacles: generateRandomObstacles(58, 40, 60), starThresholds: { one: 775, two: 1550, three: 1950 }, coinReward: 100 },

    // ===== HARD LEVELS (61-85) =====
    { id: 61, name: "Hard Mode", description: "Real challenge", difficulty: 'hard', speed: 17, obstacles: generateRandomObstacles(45, 40, 61), starThresholds: { one: 750, two: 1500, three: 1900 }, coinReward: 100 },
    { id: 62, name: "Trial by Fire", description: "No mercy", difficulty: 'hard', speed: 17, obstacles: generateRandomObstacles(50, 40, 62), starThresholds: { one: 775, two: 1550, three: 1950 }, coinReward: 105 },
    { id: 63, name: "Gauntlet Run", description: "Survive!", difficulty: 'hard', speed: 18, obstacles: generateRandomObstacles(55, 40, 63), starThresholds: { one: 800, two: 1600, three: 2000 }, coinReward: 105 },
    { id: 64, name: "Death Maze", description: "Deadly paths", difficulty: 'hard', speed: 18, obstacles: generateRandomObstacles(58, 40, 64), starThresholds: { one: 825, two: 1650, three: 2050 }, coinReward: 110 },
    { id: 65, name: "Precision", description: "Pixel perfect", difficulty: 'hard', speed: 18, obstacles: generateRandomObstacles(60, 40, 65), starThresholds: { one: 850, two: 1700, three: 2100 }, coinReward: 110 },
    { id: 66, name: "The Crucible", description: "Test yourself", difficulty: 'hard', speed: 18, obstacles: generateRandomObstacles(62, 40, 66), starThresholds: { one: 875, two: 1750, three: 2150 }, coinReward: 115 },
    { id: 67, name: "Snake Master", description: "Pro moves", difficulty: 'hard', speed: 19, obstacles: generateRandomObstacles(55, 40, 67), starThresholds: { one: 900, two: 1800, three: 2200 }, coinReward: 115 },
    { id: 68, name: "The Arena", description: "Battle ready", difficulty: 'hard', speed: 19, obstacles: generateRandomObstacles(58, 40, 68), starThresholds: { one: 925, two: 1850, three: 2250 }, coinReward: 120 },
    { id: 69, name: "Lightning", description: "Super fast", difficulty: 'hard', speed: 19, obstacles: generateRandomObstacles(50, 40, 69), starThresholds: { one: 950, two: 1900, three: 2300 }, coinReward: 120 },
    { id: 70, name: "Seventy!", description: "70 cleared!", difficulty: 'hard', speed: 19, obstacles: generateRandomObstacles(62, 40, 70), starThresholds: { one: 975, two: 1950, three: 2400 }, coinReward: 150 },
    { id: 71, name: "Veteran", description: "Experienced", difficulty: 'hard', speed: 19, obstacles: generateRandomObstacles(64, 40, 71), starThresholds: { one: 1000, two: 2000, three: 2450 }, coinReward: 130 },
    { id: 72, name: "Elite Snake", description: "Top tier", difficulty: 'hard', speed: 20, obstacles: generateRandomObstacles(58, 40, 72), starThresholds: { one: 1025, two: 2050, three: 2500 }, coinReward: 130 },
    { id: 73, name: "Nightmare", description: "Scary hard", difficulty: 'hard', speed: 20, obstacles: generateRandomObstacles(65, 40, 73), starThresholds: { one: 1050, two: 2100, three: 2550 }, coinReward: 135 },
    { id: 74, name: "Impossible?", description: "Or is it?", difficulty: 'hard', speed: 20, obstacles: generateRandomObstacles(68, 40, 74), starThresholds: { one: 1075, two: 2150, three: 2600 }, coinReward: 135 },
    { id: 75, name: "Champion", description: "75% done!", difficulty: 'hard', speed: 20, obstacles: generateRandomObstacles(70, 40, 75), starThresholds: { one: 1100, two: 2200, three: 2700 }, coinReward: 175 },
    { id: 76, name: "Final Hard 1", description: "End game", difficulty: 'hard', speed: 20, obstacles: generateRandomObstacles(65, 40, 76), starThresholds: { one: 1125, two: 2250, three: 2750 }, coinReward: 140 },
    { id: 77, name: "Final Hard 2", description: "Expert prep", difficulty: 'hard', speed: 20, obstacles: generateRandomObstacles(68, 40, 77), starThresholds: { one: 1150, two: 2300, three: 2800 }, coinReward: 140 },
    { id: 78, name: "Final Hard 3", description: "Almost there", difficulty: 'hard', speed: 21, obstacles: generateRandomObstacles(62, 40, 78), starThresholds: { one: 1175, two: 2350, three: 2850 }, coinReward: 145 },
    { id: 79, name: "Final Hard 4", description: "So close", difficulty: 'hard', speed: 21, obstacles: generateRandomObstacles(70, 40, 79), starThresholds: { one: 1200, two: 2400, three: 2900 }, coinReward: 145 },
    { id: 80, name: "Eighty!", description: "80 complete!", difficulty: 'hard', speed: 21, obstacles: generateRandomObstacles(72, 40, 80), starThresholds: { one: 1250, two: 2500, three: 3000 }, coinReward: 200 },
    { id: 81, name: "Final Hard 5", description: "Push through", difficulty: 'hard', speed: 21, obstacles: generateRandomObstacles(68, 40, 81), starThresholds: { one: 1275, two: 2550, three: 3050 }, coinReward: 150 },
    { id: 82, name: "Final Hard 6", description: "No giving up", difficulty: 'hard', speed: 21, obstacles: generateRandomObstacles(74, 40, 82), starThresholds: { one: 1300, two: 2600, three: 3100 }, coinReward: 150 },
    { id: 83, name: "Final Hard 7", description: "Expert awaits", difficulty: 'hard', speed: 22, obstacles: generateRandomObstacles(70, 40, 83), starThresholds: { one: 1325, two: 2650, three: 3150 }, coinReward: 155 },
    { id: 84, name: "Final Hard 8", description: "One more!", difficulty: 'hard', speed: 22, obstacles: generateRandomObstacles(75, 40, 84), starThresholds: { one: 1350, two: 2700, three: 3200 }, coinReward: 155 },
    { id: 85, name: "Hard Master", description: "Hard done!", difficulty: 'hard', speed: 22, obstacles: generateRandomObstacles(78, 40, 85), starThresholds: { one: 1400, two: 2800, three: 3300 }, coinReward: 175 },

    // ===== EXPERT LEVELS (86-100) =====
    { id: 86, name: "Expert Mode", description: "Ultimate test", difficulty: 'expert', speed: 21, obstacles: generateRandomObstacles(70, 40, 86), starThresholds: { one: 1350, two: 2700, three: 3250 }, coinReward: 175 },
    { id: 87, name: "Godlike", description: "Inhuman", difficulty: 'expert', speed: 21, obstacles: generateRandomObstacles(75, 40, 87), starThresholds: { one: 1400, two: 2800, three: 3350 }, coinReward: 180 },
    { id: 88, name: "Legend", description: "Legendary", difficulty: 'expert', speed: 22, obstacles: generateRandomObstacles(72, 40, 88), starThresholds: { one: 1450, two: 2900, three: 3450 }, coinReward: 185 },
    { id: 89, name: "Mythic", description: "Beyond normal", difficulty: 'expert', speed: 22, obstacles: generateRandomObstacles(78, 40, 89), starThresholds: { one: 1500, two: 3000, three: 3550 }, coinReward: 190 },
    { id: 90, name: "Ninety!", description: "90 levels!", difficulty: 'expert', speed: 22, obstacles: generateRandomObstacles(80, 40, 90), starThresholds: { one: 1550, two: 3100, three: 3700 }, coinReward: 250 },
    { id: 91, name: "Immortal", description: "Can't be beat", difficulty: 'expert', speed: 22, obstacles: generateRandomObstacles(75, 40, 91), starThresholds: { one: 1600, two: 3200, three: 3800 }, coinReward: 200 },
    { id: 92, name: "Titan", description: "Giant slayer", difficulty: 'expert', speed: 23, obstacles: generateRandomObstacles(78, 40, 92), starThresholds: { one: 1650, two: 3300, three: 3900 }, coinReward: 210 },
    { id: 93, name: "Overlord", description: "Supreme", difficulty: 'expert', speed: 23, obstacles: generateRandomObstacles(82, 40, 93), starThresholds: { one: 1700, two: 3400, three: 4000 }, coinReward: 220 },
    { id: 94, name: "Ascended", description: "Transcendent", difficulty: 'expert', speed: 23, obstacles: generateRandomObstacles(80, 40, 94), starThresholds: { one: 1750, two: 3500, three: 4100 }, coinReward: 230 },
    { id: 95, name: "Final Five 1", description: "End game", difficulty: 'expert', speed: 23, obstacles: generateRandomObstacles(85, 40, 95), starThresholds: { one: 1800, two: 3600, three: 4250 }, coinReward: 250 },
    { id: 96, name: "Final Five 2", description: "Almost done", difficulty: 'expert', speed: 24, obstacles: generateRandomObstacles(82, 40, 96), starThresholds: { one: 1850, two: 3700, three: 4400 }, coinReward: 275 },
    { id: 97, name: "Final Five 3", description: "So close", difficulty: 'expert', speed: 24, obstacles: generateRandomObstacles(88, 40, 97), starThresholds: { one: 1900, two: 3800, three: 4550 }, coinReward: 300 },
    { id: 98, name: "Final Five 4", description: "One more!", difficulty: 'expert', speed: 24, obstacles: generateRandomObstacles(85, 40, 98), starThresholds: { one: 1950, two: 3900, three: 4700 }, coinReward: 350 },
    { id: 99, name: "The Final", description: "Last level!", difficulty: 'expert', speed: 25, obstacles: generateRandomObstacles(90, 40, 99), starThresholds: { one: 2000, two: 4000, three: 4850 }, coinReward: 400 },
    { id: 100, name: "ULTIMATE", description: "100% Complete!", difficulty: 'expert', speed: 25, obstacles: generateRandomObstacles(95, 40, 100), starThresholds: { one: 2100, two: 4200, three: 5000 }, coinReward: 500 },
];

export default CLASSIC_LEVELS;
