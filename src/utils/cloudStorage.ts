// Cloud Storage Utilities for Firestore
import {
    doc,
    setDoc,
    getDoc,
    collection,
    addDoc,
    query,
    orderBy,
    limit,
    getDocs,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { db } from './firebase';

// Player data structure for cloud storage
export interface CloudPlayerData {
    displayName?: string | null;
    email?: string | null;
    photoURL?: string | null;
    playerData?: {
        name?: string;
        coins?: number;
        totalScore?: number;
        totalKills?: number;
        gamesPlayed?: number;
        wins?: number;
        streak?: number;
        lastPlayDate?: string;
        selectedSkin?: string;
        selectedTheme?: string;
        unlockedSkins?: string[];
    };
    achievements?: string[];
    shopPurchases?: string[];
    puzzleProgress?: {
        currentLevel?: number;
        completed?: number[];
    };
    lastUpdated?: Timestamp;
}

// Leaderboard entry structure
export interface LeaderboardEntry {
    name: string;
    score: number;
    mode: string;
    level?: number;
    kills?: number;
    userId?: string;
    photoURL?: string;
    timestamp?: Timestamp;
}

// Save player data to cloud
export const syncPlayerToCloud = async (userId: string, data: Partial<CloudPlayerData>): Promise<void> => {
    try {
        const userRef = doc(db, 'users', userId);
        await setDoc(userRef, {
            ...data,
            lastUpdated: serverTimestamp()
        }, { merge: true });
        console.log('✅ Player data synced to cloud');
    } catch (error) {
        console.error('❌ Failed to sync player data:', error);
        throw error;
    }
};

// Load player data from cloud
export const loadPlayerFromCloud = async (userId: string): Promise<CloudPlayerData | null> => {
    try {
        const userRef = doc(db, 'users', userId);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
            console.log('✅ Player data loaded from cloud');
            return docSnap.data() as CloudPlayerData;
        }
        return null;
    } catch (error) {
        console.error('❌ Failed to load player data:', error);
        throw error;
    }
};

// Add entry to global leaderboard
export const addToGlobalLeaderboard = async (entry: LeaderboardEntry): Promise<void> => {
    try {
        const leaderboardRef = collection(db, 'leaderboard');
        await addDoc(leaderboardRef, {
            ...entry,
            timestamp: serverTimestamp()
        });
        console.log('✅ Added to global leaderboard');
    } catch (error) {
        console.error('❌ Failed to add to leaderboard:', error);
        throw error;
    }
};

// Get global leaderboard (top 50)
export const getGlobalLeaderboard = async (mode?: string): Promise<LeaderboardEntry[]> => {
    try {
        const leaderboardRef = collection(db, 'leaderboard');
        let q = query(leaderboardRef, orderBy('score', 'desc'), limit(50));

        const querySnapshot = await getDocs(q);
        const entries: LeaderboardEntry[] = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            // Filter by mode if specified
            if (!mode || data.mode === mode) {
                entries.push({
                    name: data.name,
                    score: data.score,
                    mode: data.mode,
                    level: data.level,
                    kills: data.kills,
                    userId: data.userId,
                    photoURL: data.photoURL,
                    timestamp: data.timestamp
                });
            }
        });

        console.log(`✅ Loaded ${entries.length} leaderboard entries`);
        return entries;
    } catch (error) {
        console.error('❌ Failed to get leaderboard:', error);
        return [];
    }
};

// Save puzzle progress
export const savePuzzleProgress = async (userId: string, level: number, completed: number[]): Promise<void> => {
    try {
        const userRef = doc(db, 'users', userId);
        await setDoc(userRef, {
            puzzleProgress: {
                currentLevel: level,
                completed
            },
            lastUpdated: serverTimestamp()
        }, { merge: true });
        console.log('✅ Puzzle progress saved');
    } catch (error) {
        console.error('❌ Failed to save puzzle progress:', error);
    }
};

// Load puzzle progress
export const loadPuzzleProgress = async (userId: string): Promise<{ currentLevel: number; completed: number[] } | null> => {
    try {
        const userRef = doc(db, 'users', userId);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.puzzleProgress) {
                return {
                    currentLevel: data.puzzleProgress.currentLevel || 1,
                    completed: data.puzzleProgress.completed || []
                };
            }
        }
        return null;
    } catch (error) {
        console.error('❌ Failed to load puzzle progress:', error);
        return null;
    }
};
