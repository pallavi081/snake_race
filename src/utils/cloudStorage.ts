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
    Timestamp,
    onSnapshot,
    deleteDoc,
    where
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

// Get global leaderboard (top 50) - one off fetch
export const getGlobalLeaderboard = async (mode?: string): Promise<LeaderboardEntry[]> => {
    try {
        const leaderboardRef = collection(db, 'leaderboard');
        let q = query(leaderboardRef, orderBy('score', 'desc'), limit(50));

        const querySnapshot = await getDocs(q);
        const entries: LeaderboardEntry[] = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (!mode || data.mode === mode) {
                entries.push({
                    id: doc.id,
                    name: data.name,
                    score: data.score,
                    mode: data.mode,
                    level: data.level,
                    kills: data.kills,
                    userId: data.userId,
                    photoURL: data.photoURL,
                    timestamp: data.timestamp
                } as LeaderboardEntry & { id: string });
            }
        });

        return entries;
    } catch (error) {
        console.error('❌ Failed to get leaderboard:', error);
        return [];
    }
};

// Set up a listener for global leaderboard
export const onLeaderboardChange = (callback: (entries: LeaderboardEntry[]) => void, mode?: string): (() => void) => {
    const leaderboardRef = collection(db, 'leaderboard');
    let q = query(leaderboardRef, orderBy('score', 'desc'), limit(50));

    return onSnapshot(q, (snapshot) => {
        const entries: LeaderboardEntry[] = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
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
                } as LeaderboardEntry);
            }
        });
        callback(entries);
    }, (error) => {
        console.error('❌ Failed to listen to leaderboard:', error);
    });
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

// --- Public Room Management (for Quick Match) ---

export const registerPublicRoom = async (roomId: string, peerId: string, name: string, isPrivate: boolean): Promise<void> => {
    if (isPrivate) return;
    try {
        const roomRef = doc(db, 'public_rooms', roomId);
        await setDoc(roomRef, {
            roomId,
            hostPeerId: peerId,
            hostName: name,
            playerCount: 1,
            status: 'waiting',
            lastUpdated: serverTimestamp()
        });
    } catch (error) {
        console.error('❌ Failed to register public room:', error);
    }
};

export const updatePublicRoom = async (roomId: string, data: any): Promise<void> => {
    try {
        const roomRef = doc(db, 'public_rooms', roomId);
        await setDoc(roomRef, {
            ...data,
            lastUpdated: serverTimestamp()
        }, { merge: true });
    } catch (error) {
        // Room might have been deleted, ignore
    }
};

export const deletePublicRoom = async (roomId: string): Promise<void> => {
    try {
        const roomRef = doc(db, 'public_rooms', roomId);
        await deleteDoc(roomRef);
    } catch (error) {
        console.error('❌ Failed to delete public room:', error);
    }
};

export const getAvailablePublicRooms = async (): Promise<any[]> => {
    try {
        const roomsRef = collection(db, 'public_rooms');
        const q = query(
            roomsRef,
            where('status', '==', 'waiting'),
            orderBy('lastUpdated', 'desc'),
            limit(10)
        );
        const snap = await getDocs(q);
        return snap.docs.map(doc => doc.data());
    } catch (error) {
        console.error('❌ Failed to get public rooms:', error);
        return [];
    }
};

// Get global settings (e.g., event overrides)
export const getGlobalSettings = async (): Promise<any> => {
    try {
        const settingsRef = doc(db, 'settings', 'global');
        const snap = await getDoc(settingsRef);
        return snap.exists() ? snap.data() : {};
    } catch (error) {
        console.error('❌ Failed to get global settings:', error);
        return {};
    }
};

// Update global settings
export const updateGlobalSettings = async (settings: any): Promise<void> => {
    try {
        const settingsRef = doc(db, 'settings', 'global');
        await setDoc(settingsRef, {
            ...settings,
            lastUpdated: serverTimestamp()
        }, { merge: true });
        console.log('✅ Global settings updated');
    } catch (error) {
        console.error('❌ Failed to update global settings:', error);
        throw error;
    }
};

// Set up a listener for global settings
export const onGlobalSettingsChange = (callback: (settings: any) => void): (() => void) => {
    const settingsRef = doc(db, 'settings', 'global');
    return onSnapshot(settingsRef, (snap) => {
        if (snap.exists()) {
            callback(snap.data());
        } else {
            callback({});
        }
    }, (error) => {
        console.error('❌ Failed to listen to global settings:', error);
    });
};

// Get all users (for admin management)
export const getAllUsers = async (limitCount: number = 20): Promise<any[]> => {
    try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, orderBy('lastUpdated', 'desc'), limit(limitCount));
        const snap = await getDocs(q);
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('❌ Failed to fetch users:', error);
        return [];
    }
};

// Delete a leaderboard entry
export const deleteLeaderboardEntry = async (entryId: string): Promise<void> => {
    try {
        const entryRef = doc(db, 'leaderboard', entryId);
        await setDoc(entryRef, { deleted: true }, { merge: true }); // Soft delete
        // Or hard delete:
        // await deleteDoc(entryRef);
        console.log('✅ Leaderboard entry deleted');
    } catch (error) {
        console.error('❌ Failed to delete leaderboard entry:', error);
        throw error;
    }
};

// Get system stats
export const getSystemStats = async (): Promise<any> => {
    try {
        console.log('[cloudStorage] Fetching system stats...');
        const usersSnap = await getDocs(collection(db, 'users'));
        const leaderboardSnap = await getDocs(collection(db, 'leaderboard'));
        // ... (rest of function)

        let totalCoins = 0;
        usersSnap.forEach(u => {
            totalCoins += u.data().playerData?.coins || 0;
        });

        return {
            totalUsers: usersSnap.size,
            totalLeaderboardEntries: leaderboardSnap.size,
            totalCoinsInCirculation: totalCoins,
            lastUpdated: new Date().toISOString()
        };
    } catch (error) {
        console.error('❌ Failed to get system stats:', error);
        return { totalUsers: 0, totalLeaderboardEntries: 0, totalCoinsInCirculation: 0 };
    }
};
