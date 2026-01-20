// Level System Types and Utilities
import { Position } from '../types/game';

export interface LevelConfig {
    id: number;
    name: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard' | 'expert';
    // Classic mode specific
    speed?: number; // 1-20 (higher = faster)
    obstacles?: Position[];
    wrapAround?: boolean;
    // Puzzle mode specific
    targetScore?: number;
    movesLimit?: number;
    gridSize?: number;
    wallPattern?: Position[];
    // Physics mode specific
    gravity?: number; // 0.1 - 1.0
    platforms?: { x: number; y: number; width: number }[];
    wind?: { direction: 'left' | 'right'; strength: number };
    // Rewards
    starThresholds: { one: number; two: number; three: number }; // score thresholds
    coinReward: number;
}

export interface LevelProgress {
    completed: boolean;
    stars: number;
    highScore: number;
    bestTime?: number;
    attempts: number;
}

// Level progress storage key
export const getLevelProgressKey = (mode: string) => `snake_${mode}_levels`;

// Save level progress
export const saveLevelProgress = (mode: string, levelId: number, progress: Partial<LevelProgress>) => {
    const key = getLevelProgressKey(mode);
    const allProgress = JSON.parse(localStorage.getItem(key) || '{}');
    allProgress[levelId] = { ...allProgress[levelId], ...progress };
    localStorage.setItem(key, JSON.stringify(allProgress));
};

// Get level progress
export const getLevelProgress = (mode: string, levelId: number): LevelProgress => {
    const key = getLevelProgressKey(mode);
    const allProgress = JSON.parse(localStorage.getItem(key) || '{}');
    return allProgress[levelId] || { completed: false, stars: 0, highScore: 0, attempts: 0 };
};

// Get all levels progress
export const getAllLevelProgress = (mode: string): Record<number, LevelProgress> => {
    const key = getLevelProgressKey(mode);
    return JSON.parse(localStorage.getItem(key) || '{}');
};

// Check if level is unlocked
export const isLevelUnlocked = (mode: string, levelId: number): boolean => {
    if (levelId === 1) return true; // First level always unlocked
    const prevProgress = getLevelProgress(mode, levelId - 1);
    return prevProgress.completed;
};

// Calculate stars based on score and thresholds
export const calculateStars = (score: number, thresholds: { one: number; two: number; three: number }): number => {
    if (score >= thresholds.three) return 3;
    if (score >= thresholds.two) return 2;
    if (score >= thresholds.one) return 1;
    return 0;
};

// Get difficulty color
export const getDifficultyColor = (difficulty: LevelConfig['difficulty']): string => {
    switch (difficulty) {
        case 'easy': return 'text-green-400';
        case 'medium': return 'text-yellow-400';
        case 'hard': return 'text-orange-400';
        case 'expert': return 'text-red-400';
    }
};

// Get difficulty background
export const getDifficultyBg = (difficulty: LevelConfig['difficulty']): string => {
    switch (difficulty) {
        case 'easy': return 'bg-green-600/20';
        case 'medium': return 'bg-yellow-600/20';
        case 'hard': return 'bg-orange-600/20';
        case 'expert': return 'bg-red-600/20';
    }
};
