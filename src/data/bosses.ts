// Boss Battles Data - 5 Unique Bosses
import { Position } from '../types/game';

export interface BossAbility {
    id: string;
    name: string;
    description: string;
    cooldown: number; // seconds
    duration?: number; // seconds for persistent effects
}

export interface Boss {
    id: string;
    name: string;
    title: string;
    emoji: string;
    description: string;
    health: number;
    speed: number; // milliseconds per move
    color: string;
    tailColor: string;
    difficulty: 'easy' | 'medium' | 'hard' | 'extreme' | 'legendary';
    abilities: BossAbility[];
    attackPatterns: string[];
    rewards: {
        coins: number;
        xp: number;
        skin?: string;
    };
    worldTheme: string;
}

export const BOSS_POWER_UPS = [
    { id: 'speed', name: 'Speed Boost', emoji: '⚡', duration: 5, color: '#eab308' },
    { id: 'shield', name: 'Shield', emoji: '🛡️', duration: 3, color: '#3b82f6' },
    { id: 'freeze', name: 'Freeze Boss', emoji: '❄️', duration: 2, color: '#06b6d4' },
    { id: 'shrink', name: 'Shrink', emoji: '🔻', duration: 0, color: '#f97316' },
    { id: 'double', name: 'Double Damage', emoji: '⚔️', duration: 5, color: '#ef4444' },
];

export const BOSSES: Boss[] = [
    // Boss 1: Viper King - Easy
    {
        id: 'viper_king',
        name: 'Viper King',
        title: 'The Swift Predator',
        emoji: '🐍',
        description: 'A lightning-fast snake that strikes without warning.',
        health: 100,
        speed: 150,
        color: '#22c55e',
        tailColor: '#15803d',
        difficulty: 'easy',
        abilities: [
            { id: 'dash', name: 'Venom Dash', description: 'Charges forward at high speed', cooldown: 8 },
            { id: 'split', name: 'Scale Throw', description: 'Throws poisonous scales', cooldown: 12 },
        ],
        attackPatterns: ['chase', 'dash', 'circle'],
        rewards: { coins: 100, xp: 500 },
        worldTheme: 'jungle'
    },

    // Boss 2: Fire Serpent - Medium
    {
        id: 'fire_serpent',
        name: 'Inferno Serpent',
        title: 'Lord of Flames',
        emoji: '🔥',
        description: 'A blazing serpent that leaves trails of fire wherever it goes.',
        health: 200,
        speed: 180,
        color: '#f97316',
        tailColor: '#ea580c',
        difficulty: 'medium',
        abilities: [
            { id: 'fire_trail', name: 'Fire Trail', description: 'Leaves damaging fire behind', cooldown: 5, duration: 8 },
            { id: 'fireball', name: 'Fireball', description: 'Shoots fireballs in 8 directions', cooldown: 10 },
            { id: 'eruption', name: 'Volcanic Eruption', description: 'Creates fire zones on map', cooldown: 15 },
        ],
        attackPatterns: ['trail', 'burst', 'zone'],
        rewards: { coins: 250, xp: 1000, skin: 'fire_snake' },
        worldTheme: 'volcano'
    },

    // Boss 3: Ice Python - Hard
    {
        id: 'ice_python',
        name: 'Frost Python',
        title: 'The Frozen Horror',
        emoji: '❄️',
        description: 'An ancient serpent encased in eternal ice.',
        health: 300,
        speed: 200,
        color: '#06b6d4',
        tailColor: '#0891b2',
        difficulty: 'hard',
        abilities: [
            { id: 'freeze_zone', name: 'Blizzard', description: 'Creates slowing ice zones', cooldown: 6, duration: 5 },
            { id: 'ice_wall', name: 'Ice Wall', description: 'Creates walls of ice', cooldown: 10 },
            { id: 'shatter', name: 'Ice Shatter', description: 'Shatters into deadly shards', cooldown: 15 },
        ],
        attackPatterns: ['zone', 'wall', 'shatter', 'chase'],
        rewards: { coins: 400, xp: 2000, skin: 'ice_snake' },
        worldTheme: 'tundra'
    },

    // Boss 4: Storm Dragon - Extreme
    {
        id: 'storm_dragon',
        name: 'Thunder Wyrm',
        title: 'Bringer of Storms',
        emoji: '⚡',
        description: 'A legendary dragon that commands thunder and lightning.',
        health: 500,
        speed: 160,
        color: '#a855f7',
        tailColor: '#9333ea',
        difficulty: 'extreme',
        abilities: [
            { id: 'lightning', name: 'Lightning Strike', description: 'Strikes random locations', cooldown: 4 },
            { id: 'storm', name: 'Thunderstorm', description: 'Covers entire arena in danger', cooldown: 12, duration: 4 },
            { id: 'teleport', name: 'Flash Step', description: 'Teleports behind player', cooldown: 8 },
            { id: 'chain', name: 'Chain Lightning', description: 'Lightning that bounces', cooldown: 10 },
        ],
        attackPatterns: ['lightning', 'teleport', 'storm', 'chase'],
        rewards: { coins: 750, xp: 4000, skin: 'storm_dragon' },
        worldTheme: 'sky'
    },

    // Boss 5: Shadow Cobra - Legendary
    {
        id: 'shadow_cobra',
        name: 'Void Cobra',
        title: 'The Eternal Darkness',
        emoji: '💀',
        description: 'An entity from the void itself, master of shadows and death.',
        health: 800,
        speed: 140,
        color: '#1f2937',
        tailColor: '#111827',
        difficulty: 'legendary',
        abilities: [
            { id: 'shadow', name: 'Shadow Clone', description: 'Creates deadly shadow clones', cooldown: 6 },
            { id: 'void', name: 'Void Zone', description: 'Creates instant-kill zones', cooldown: 12, duration: 5 },
            { id: 'teleport', name: 'Shadow Step', description: 'Teleports anywhere', cooldown: 5 },
            { id: 'drain', name: 'Life Drain', description: 'Steals player health', cooldown: 8 },
            { id: 'darkness', name: 'Eternal Darkness', description: 'Blacks out the screen', cooldown: 20, duration: 3 },
        ],
        attackPatterns: ['clone', 'void', 'teleport', 'drain', 'darkness'],
        rewards: { coins: 1500, xp: 10000, skin: 'void_cobra' },
        worldTheme: 'void'
    }
];

// Boss difficulty multipliers
export const DIFFICULTY_MULTIPLIERS = {
    easy: 1,
    medium: 1.5,
    hard: 2,
    extreme: 3,
    legendary: 5
};

// Get boss by ID
export const getBossById = (id: string): Boss | undefined => BOSSES.find(b => b.id === id);

// Get bosses by difficulty
export const getBossesByDifficulty = (difficulty: Boss['difficulty']): Boss[] =>
    BOSSES.filter(b => b.difficulty === difficulty);
