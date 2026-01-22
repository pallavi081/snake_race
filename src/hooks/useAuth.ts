// Authentication Hook for Firebase Google Sign-In
import { useState, useEffect, useCallback } from 'react';
import {
    User,
    signInWithPopup,
    signOut as firebaseSignOut,
    onAuthStateChanged
} from 'firebase/auth';
import { auth, googleProvider } from '../utils/firebase';
import { syncPlayerToCloud, loadPlayerFromCloud, getCloudUserRef } from '../utils/cloudStorage';
import { onSnapshot } from 'firebase/firestore';
import storage from '../utils/storage';

export interface AuthUser {
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
}

export const useAuth = () => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Listen to auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
            if (firebaseUser) {
                const authUser: AuthUser = {
                    uid: firebaseUser.uid,
                    displayName: firebaseUser.displayName,
                    email: firebaseUser.email,
                    photoURL: firebaseUser.photoURL
                };
                setUser(authUser);

                // Load cloud data and merge with local
                try {
                    const cloudData = await loadPlayerFromCloud(firebaseUser.uid);
                    if (cloudData) {
                        const localPlayer = storage.getPlayer();
                        const mergedPlayer = {
                            ...localPlayer,
                            ...cloudData.playerData,
                            totalScore: Math.max(localPlayer.totalScore, cloudData.playerData?.totalScore || 0),
                            coins: Math.max(localPlayer.coins, cloudData.playerData?.coins || 0),
                            wins: Math.max(localPlayer.wins, cloudData.playerData?.wins || 0),
                            gamesPlayed: Math.max(localPlayer.gamesPlayed, cloudData.playerData?.gamesPlayed || 0),
                        };
                        storage.savePlayer(mergedPlayer);

                        // Dispatch event to notify components
                        window.dispatchEvent(new CustomEvent('playerDataUpdated'));
                    }
                } catch (err) {
                    console.error('Failed to load cloud data:', err);
                }

                // Set up real-time listener for cloud updates (e.g., from Admin Panel)
                const userRef = getCloudUserRef(firebaseUser.uid);
                const unsubCloud = onSnapshot(userRef, (docSnap) => {
                    const data = docSnap.data();
                    if (data && data.playerData) {
                        const localPlayer = storage.getPlayer();

                        // Check if we actually need to update to avoid infinite loops if we sync back
                        const remoteCoins = data.playerData.coins || 0;
                        const remoteWins = data.playerData.wins || 0;

                        // We only update if remote values are different from local
                        // This allows admin to override local values
                        if (remoteCoins !== localPlayer.coins || remoteWins !== localPlayer.wins) {
                            const mergedPlayer = {
                                ...localPlayer,
                                ...data.playerData
                            };
                            storage.savePlayer(mergedPlayer);
                            window.dispatchEvent(new CustomEvent('playerDataUpdated'));
                        }
                    }
                }, (err) => {
                    console.error('Cloud sync listener error:', err);
                });

                return () => {
                    unsubscribe();
                    unsubCloud();
                };
            } else {
                setUser(null);
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    // Sign in with Google
    const signInWithGoogle = useCallback(async () => {
        setError(null);
        setLoading(true);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const firebaseUser = result.user;

            // Sync current local data to cloud
            const localPlayer = storage.getPlayer();
            await syncPlayerToCloud(firebaseUser.uid, {
                displayName: firebaseUser.displayName,
                email: firebaseUser.email,
                photoURL: firebaseUser.photoURL,
                playerData: localPlayer
            });

            return true;
        } catch (err: any) {
            console.error('Sign in error:', err);
            setError(err.message || 'Failed to sign in');
            setLoading(false);
            return false;
        }
    }, []);

    // Sign out
    const signOut = useCallback(async () => {
        try {
            // Sync data before signing out
            if (user) {
                const localPlayer = storage.getPlayer();
                await syncPlayerToCloud(user.uid, { playerData: localPlayer });
            }
            await firebaseSignOut(auth);
            setUser(null);
        } catch (err: any) {
            console.error('Sign out error:', err);
            setError(err.message || 'Failed to sign out');
        }
    }, [user]);

    // Sync current data to cloud (call after important actions)
    const syncToCloud = useCallback(async () => {
        if (!user) return;
        try {
            const localPlayer = storage.getPlayer();
            await syncPlayerToCloud(user.uid, { playerData: localPlayer });
        } catch (err) {
            console.error('Failed to sync:', err);
        }
    }, [user]);

    return {
        user,
        loading,
        error,
        signInWithGoogle,
        signOut,
        syncToCloud,
        isAuthenticated: !!user
    };
};
