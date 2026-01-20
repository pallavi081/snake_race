// Skin and Theme definitions

export interface Skin {
    id: string;
    name: string;
    color: string;
    gradient?: string[];
    pattern?: 'solid' | 'striped' | 'dotted' | 'glow';
    price: number;
    isPremium: boolean;
    premiumPrice?: number; // in INR
}

export interface Theme {
    id: string;
    name: string;
    bgColor: string;
    gridColor: string;
    borderColor: string;
    foodColor: string;
    price: number;
    isPremium: boolean;
    premiumPrice?: number;
}

export interface Hat {
    id: string;
    name: string;
    icon: string;
    price: number;
    isPremium: boolean;
    premiumPrice?: number;
}

export interface Trail {
    id: string;
    name: string;
    color: string;
    type: 'particles' | 'glow' | 'solid';
    price: number;
    isPremium: boolean;
    premiumPrice?: number;
}

export const SKINS: Skin[] = [
    { id: 'default', name: 'Classic Green', color: '#22c55e', price: 0, isPremium: false },
    { id: 'neon', name: 'Neon Blue', color: '#00f0ff', pattern: 'glow', price: 100, isPremium: false },
    { id: 'rainbow', name: 'Rainbow', color: '#ff0000', gradient: ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#8b00ff'], price: 200, isPremium: false },
    { id: 'fire', name: 'Fire', color: '#ff4500', gradient: ['#ff4500', '#ff6b00', '#ffa500'], pattern: 'glow', price: 300, isPremium: false },
    { id: 'ice', name: 'Ice', color: '#00bfff', gradient: ['#00bfff', '#87ceeb', '#e0ffff'], price: 400, isPremium: false },
    { id: 'gold', name: 'Gold', color: '#ffd700', gradient: ['#ffd700', '#ffb800', '#ff9500'], pattern: 'glow', price: 500, isPremium: false },
    { id: 'diamond', name: 'Diamond', color: '#b9f2ff', gradient: ['#b9f2ff', '#e0ffff', '#ffffff'], pattern: 'glow', price: 0, isPremium: true, premiumPrice: 29 },
    { id: 'galaxy', name: 'Galaxy', color: '#9400d3', gradient: ['#9400d3', '#4b0082', '#0000ff', '#00ff00'], pattern: 'glow', price: 0, isPremium: true, premiumPrice: 49 },
    { id: 'dragon', name: 'Dragon', color: '#ff1493', gradient: ['#ff1493', '#ff4500', '#ffd700'], pattern: 'glow', price: 0, isPremium: true, premiumPrice: 99 },
];

export const HATS: Hat[] = [
    { id: 'none', name: 'No Hat', icon: '', price: 0, isPremium: false },
    { id: 'crown', name: 'Crown', icon: '👑', price: 500, isPremium: false },
    { id: 'cowboy', name: 'Cowboy', icon: '🤠', price: 200, isPremium: false },
    { id: 'pirate', name: 'Pirate', icon: '🏴‍☠️', price: 250, isPremium: false },
    { id: 'viking', name: 'Viking', icon: '⚔️', price: 300, isPremium: false },
    { id: 'ninja', name: 'Ninja', icon: '🥷', price: 350, isPremium: false },
    { id: 'wizard', name: 'Wizard', icon: '🧙', price: 400, isPremium: false },
    { id: 'tophat', name: 'Top Hat', icon: '🎩', price: 150, isPremium: false },
    { id: 'royal_crown', name: 'Royal Crown', icon: '🔱', price: 0, isPremium: true, premiumPrice: 19 },
];

export const TRAILS: Trail[] = [
    { id: 'none', name: 'No Trail', color: 'transparent', type: 'solid', price: 0, isPremium: false },
    { id: 'fire', name: 'Fire Trail', color: '#ff4500', type: 'particles', price: 300, isPremium: false },
    { id: 'rainbow', name: 'Rainbow Trail', color: 'multi', type: 'glow', price: 500, isPremium: false },
    { id: 'sparkle', name: 'Magic Sparkles', color: '#fcd34d', type: 'particles', price: 400, isPremium: false },
    { id: 'void', name: 'Void Walk', color: '#4c1d95', type: 'glow', price: 0, isPremium: true, premiumPrice: 29 },
];

export const THEMES: Theme[] = [
    { id: 'default', name: 'Classic', bgColor: '#111827', gridColor: '#1f2937', borderColor: '#374151', foodColor: '#fbbf24', price: 0, isPremium: false },
    { id: 'space', name: 'Space', bgColor: '#0a0a1a', gridColor: '#1a1a3a', borderColor: '#3a3a6a', foodColor: '#ffff00', price: 150, isPremium: false },
    { id: 'underwater', name: 'Underwater', bgColor: '#001830', gridColor: '#003060', borderColor: '#0050a0', foodColor: '#00ffff', price: 200, isPremium: false },
    { id: 'jungle', name: 'Jungle', bgColor: '#0a1f0a', gridColor: '#1a3f1a', borderColor: '#2a5f2a', foodColor: '#ff6b00', price: 250, isPremium: false },
    { id: 'lava', name: 'Lava', bgColor: '#1a0a00', gridColor: '#3a1500', borderColor: '#5a2000', foodColor: '#ffff00', price: 300, isPremium: false },
    { id: 'neon_city', name: 'Neon City', bgColor: '#0a001a', gridColor: '#1a0030', borderColor: '#ff00ff', foodColor: '#00ff00', price: 0, isPremium: true, premiumPrice: 39 },
];

export const getSkinById = (id: string): Skin => SKINS.find(s => s.id === id) || SKINS[0];
export const getHatById = (id: string): Hat => HATS.find(h => h.id === id) || HATS[0];
export const getTrailById = (id: string): Trail => TRAILS.find(t => t.id === id) || TRAILS[0];
export const getThemeById = (id: string): Theme => THEMES.find(t => t.id === id) || THEMES[0];
