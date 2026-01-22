// Social Features Firestore Utilities
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
    where,
    serverTimestamp,
    Timestamp,
    onSnapshot,
    increment
} from 'firebase/firestore';
import { db } from './firebase';

// ==================== TOURNAMENTS ====================

export interface TournamentEntry {
    userId: string;
    name: string;
    score: number;
    photoURL?: string;
    submittedAt: Timestamp;
}

export interface Tournament {
    id: string;
    weekId: string;
    title: string;
    description: string;
    mode: 'classic' | 'battle' | 'puzzle' | 'physics';
    specialRules?: string[];
    startDate: Timestamp;
    endDate: Timestamp;
    prizes: { rank: number; coins: number; skin?: string }[];
}

// Get current week ID (YYYY-WW format)
export const getCurrentWeekId = (): string => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const weekNum = Math.ceil((((now.getTime() - startOfYear.getTime()) / 86400000) + startOfYear.getDay() + 1) / 7);
    return `${now.getFullYear()}-W${weekNum.toString().padStart(2, '0')}`;
};

// Get current tournament
export const getCurrentTournament = async (): Promise<Tournament | null> => {
    try {
        const weekId = getCurrentWeekId();
        const tournamentRef = doc(db, 'tournaments', weekId);
        const docSnap = await getDoc(tournamentRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Tournament;
        }
        return null;
    } catch (error) {
        console.error('Failed to get tournament:', error);
        return null;
    }
};

// Submit tournament score
export const submitTournamentScore = async (
    userId: string,
    name: string,
    score: number,
    photoURL?: string
): Promise<void> => {
    try {
        const weekId = getCurrentWeekId();
        const entryRef = doc(db, 'tournaments', weekId, 'entries', userId);

        const existingEntry = await getDoc(entryRef);
        if (existingEntry.exists() && existingEntry.data().score >= score) {
            return; // Don't update if existing score is higher
        }

        await setDoc(entryRef, {
            userId,
            name,
            score,
            photoURL: photoURL || null,
            submittedAt: serverTimestamp()
        });
        console.log('✅ Tournament score submitted');
    } catch (error) {
        console.error('❌ Failed to submit tournament score:', error);
    }
};

// Get tournament leaderboard
export const getTournamentLeaderboard = async (weekId?: string): Promise<TournamentEntry[]> => {
    try {
        const targetWeek = weekId || getCurrentWeekId();
        const entriesRef = collection(db, 'tournaments', targetWeek, 'entries');
        const q = query(entriesRef, orderBy('score', 'desc'), limit(50));
        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => doc.data() as TournamentEntry);
    } catch (error) {
        console.error('Failed to get tournament leaderboard:', error);
        return [];
    }
};

// ==================== FRIENDS SYSTEM ====================

export interface Friend {
    userId: string;
    name: string;
    photoURL?: string;
    addedAt: Timestamp;
}

export interface FriendRequest {
    fromId: string;
    fromName: string;
    fromPhoto?: string;
    sentAt: Timestamp;
}

// Generate friend code
export const generateFriendCode = (userId: string): string => {
    // Simple hash of userId to create a 6-char code
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
        hash = ((hash << 5) - hash) + userId.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash).toString(36).toUpperCase().substring(0, 6);
};

// Save friend code mapping
export const saveFriendCode = async (userId: string, name: string, photoURL?: string): Promise<string> => {
    const code = generateFriendCode(userId);
    try {
        await setDoc(doc(db, 'friendCodes', code), {
            userId,
            name,
            photoURL: photoURL || null,
            createdAt: serverTimestamp()
        });
        return code;
    } catch (error) {
        console.error('Failed to save friend code:', error);
        return code;
    }
};

// Find user by friend code
export const findUserByCode = async (code: string): Promise<{ userId: string; name: string; photoURL?: string } | null> => {
    try {
        const docRef = doc(db, 'friendCodes', code.toUpperCase());
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data() as { userId: string; name: string; photoURL?: string };
        }
        return null;
    } catch (error) {
        console.error('Failed to find user:', error);
        return null;
    }
};

// Add friend (Directly - kept for backward compatibility or direct admin adds)
export const addFriend = async (myId: string, friendId: string, friendName: string, friendPhoto?: string): Promise<boolean> => {
    try {
        const friendRef = doc(db, 'users', myId, 'friends', friendId);
        await setDoc(friendRef, {
            userId: friendId,
            name: friendName,
            photoURL: friendPhoto || null,
            addedAt: serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error('Failed to add friend:', error);
        return false;
    }
};

// Send friend request
export const sendFriendRequest = async (
    fromId: string,
    fromName: string,
    fromPhoto: string | undefined,
    toId: string
): Promise<boolean> => {
    try {
        const requestRef = doc(db, 'users', toId, 'friendRequests', fromId);
        await setDoc(requestRef, {
            fromId,
            fromName,
            fromPhoto: fromPhoto || null,
            sentAt: serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error('Failed to send friend request:', error);
        return false;
    }
};

// Get friend requests (Real-time listener)
export const subscribeToFriendRequests = (userId: string, callback: (requests: FriendRequest[]) => void) => {
    const requestsRef = collection(db, 'users', userId, 'friendRequests');
    return onSnapshot(requestsRef, (snapshot) => {
        const requests = snapshot.docs.map(doc => doc.data() as FriendRequest);
        callback(requests);
    });
};

// Accept friend request
export const acceptFriendRequest = async (
    myId: string,
    myName: string,
    myPhoto: string | undefined,
    friend: FriendRequest
): Promise<boolean> => {
    try {
        const { deleteDoc } = await import('firebase/firestore');

        // 1. Add to my friends
        const myFriendRef = doc(db, 'users', myId, 'friends', friend.fromId);
        await setDoc(myFriendRef, {
            userId: friend.fromId,
            name: friend.fromName,
            photoURL: friend.fromPhoto || null,
            addedAt: serverTimestamp()
        });

        // 2. Add me to friend's friends
        const friendRef = doc(db, 'users', friend.fromId, 'friends', myId);
        await setDoc(friendRef, {
            userId: myId,
            name: myName,
            photoURL: myPhoto || null,
            addedAt: serverTimestamp()
        });

        // 3. Delete the request
        await deleteDoc(doc(db, 'users', myId, 'friendRequests', friend.fromId));

        return true;
    } catch (error) {
        console.error('Failed to accept friend request:', error);
        return false;
    }
};

// Decline friend request
export const declineFriendRequest = async (myId: string, fromId: string): Promise<boolean> => {
    try {
        const { deleteDoc } = await import('firebase/firestore');
        await deleteDoc(doc(db, 'users', myId, 'friendRequests', fromId));
        return true;
    } catch (error) {
        console.error('Failed to decline friend request:', error);
        return false;
    }
};

// Remove friend
export const removeFriend = async (myId: string, friendId: string): Promise<boolean> => {
    try {
        const { deleteDoc } = await import('firebase/firestore');
        await deleteDoc(doc(db, 'users', myId, 'friends', friendId));
        return true;
    } catch (error) {
        console.error('Failed to remove friend:', error);
        return false;
    }
};

// Get friends list
export const getFriends = async (userId: string): Promise<Friend[]> => {
    try {
        const friendsRef = collection(db, 'users', userId, 'friends');
        const snapshot = await getDocs(friendsRef);
        return snapshot.docs.map(doc => doc.data() as Friend);
    } catch (error) {
        console.error('Failed to get friends:', error);
        return [];
    }
};

// ==================== GLOBAL CHAT ====================

export interface ChatMessage {
    id?: string;
    userId: string;
    name: string;
    photoURL?: string;
    message: string;
    timestamp: Timestamp;
}

// Send chat message
export const sendChatMessage = async (
    userId: string,
    name: string,
    message: string,
    photoURL?: string
): Promise<void> => {
    try {
        await addDoc(collection(db, 'chat'), {
            userId,
            name,
            photoURL: photoURL || null,
            message: message.substring(0, 500), // Limit message length
            timestamp: serverTimestamp()
        });
    } catch (error) {
        console.error('Failed to send message:', error);
    }
};

// Get recent messages
export const getRecentMessages = async (count: number = 50): Promise<ChatMessage[]> => {
    try {
        const q = query(
            collection(db, 'chat'),
            orderBy('timestamp', 'desc'),
            limit(count)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage)).reverse();
    } catch (error) {
        console.error('Failed to get messages:', error);
        return [];
    }
};

// Subscribe to new messages (real-time)
export const subscribeToChat = (callback: (messages: ChatMessage[]) => void): (() => void) => {
    const q = query(
        collection(db, 'chat'),
        orderBy('timestamp', 'desc'),
        limit(50)
    );

    return onSnapshot(q, (snapshot) => {
        const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage)).reverse();
        callback(messages);
    });
};

// ==================== PLAYER PROFILES ====================

export interface PlayerProfile {
    userId: string;
    name: string;
    photoURL?: string;
    bio?: string;
    totalScore: number;
    totalKills: number;
    gamesPlayed: number;
    wins: number;
    longestStreak: number;
    achievementsUnlocked: number;
    favoriteMode?: string;
    joinedAt: Timestamp;
    lastActive: Timestamp;
}

// Update public profile
export const updateProfile = async (userId: string, data: Partial<PlayerProfile>): Promise<void> => {
    try {
        await setDoc(doc(db, 'profiles', userId), {
            ...data,
            lastActive: serverTimestamp()
        }, { merge: true });
    } catch (error) {
        console.error('Failed to update profile:', error);
    }
};

// Get profile
export const getProfile = async (userId: string): Promise<PlayerProfile | null> => {
    try {
        const docSnap = await getDoc(doc(db, 'profiles', userId));
        if (docSnap.exists()) {
            return docSnap.data() as PlayerProfile;
        }
        return null;
    } catch (error) {
        console.error('Failed to get profile:', error);
        return null;
    }
};

// ==================== PLAY ANALYTICS ====================

export interface LevelAnalytics {
    levelId: string;
    mode: string;
    totalPlays: number;
    totalCompletions: number;
    averageScore: number;
    averageTime: number;
}

// Track level play
export const trackLevelPlay = async (
    mode: string,
    levelId: string,
    completed: boolean,
    score: number,
    timeMs: number
): Promise<void> => {
    try {
        const analyticsRef = doc(db, 'analytics', `${mode}_${levelId}`);
        await setDoc(analyticsRef, {
            levelId,
            mode,
            totalPlays: increment(1),
            totalCompletions: completed ? increment(1) : increment(0),
            totalScore: increment(score),
            totalTime: increment(timeMs),
            lastPlayed: serverTimestamp()
        }, { merge: true });
    } catch (error) {
        console.error('Failed to track level play:', error);
    }
};

// Get popular levels
export const getPopularLevels = async (mode?: string): Promise<LevelAnalytics[]> => {
    try {
        let q;
        if (mode) {
            q = query(
                collection(db, 'analytics'),
                where('mode', '==', mode),
                orderBy('totalPlays', 'desc'),
                limit(10)
            );
        } else {
            q = query(
                collection(db, 'analytics'),
                orderBy('totalPlays', 'desc'),
                limit(10)
            );
        }

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                levelId: data.levelId,
                mode: data.mode,
                totalPlays: data.totalPlays || 0,
                totalCompletions: data.totalCompletions || 0,
                averageScore: data.totalPlays ? Math.round(data.totalScore / data.totalPlays) : 0,
                averageTime: data.totalPlays ? Math.round(data.totalTime / data.totalPlays) : 0
            };
        });
    } catch (error) {
        console.error('Failed to get popular levels:', error);
        return [];
    }
};

// ==================== DAILY REWARDS ====================

export interface DailyReward {
    day: number;
    coins: number;
    bonus?: string;
}

export const DAILY_REWARDS: DailyReward[] = [
    { day: 1, coins: 25 },
    { day: 2, coins: 50 },
    { day: 3, coins: 75, bonus: '🎁 Bonus Crate' },
    { day: 4, coins: 100 },
    { day: 5, coins: 150 },
    { day: 6, coins: 200 },
    { day: 7, coins: 500, bonus: '🎨 Mystery Skin' },
];

// Get today's reward based on streak
export const getDailyReward = (streak: number): DailyReward => {
    const dayIndex = ((streak - 1) % 7);
    return DAILY_REWARDS[dayIndex] || DAILY_REWARDS[0];
};

// Check if can claim daily reward
export const canClaimDailyReward = (lastClaimDate: string): boolean => {
    if (!lastClaimDate) return true;

    const lastClaim = new Date(lastClaimDate);
    const today = new Date();

    // Reset time to midnight for comparison
    lastClaim.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    return today.getTime() > lastClaim.getTime();
};
