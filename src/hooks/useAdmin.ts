import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';

export const useAdmin = () => {
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const [isAdmin, setIsAdmin] = useState<boolean>(false);
    const [adminLoading, setAdminLoading] = useState<boolean>(true);

    useEffect(() => {
        const checkAdmin = async () => {
            console.log('[useAdmin] Checking admin for user:', user?.uid, 'Email:', user?.email);
            if (!user) {
                console.log('[useAdmin] No user, skipping admin check');
                setIsAdmin(false);
                setAdminLoading(false);
                return;
            }

            // 1. Check email whitelist FIRST (Fast & offline-capable if user object is cached)
            const adminEmails = [
                'rajprajapati123456789@gmail.com',
                'rajpratham40@gmail.com',
                'shripallavi3108@gmail.com',
                'rajpr@snakerace.com',
                'admin@snakerace.com'
            ];

            if (user.email && (user.email.includes('rajprajapati') || adminEmails.includes(user.email))) {
                console.log('[useAdmin] Email matched whitelist:', user.email);
                setIsAdmin(true);
                setAdminLoading(false);
                return;
            }

            // 2. Fallback: Check 'admins' collection in Firestore
            try {
                const adminRef = doc(db, 'admins', user.uid);
                const adminSnap = await getDoc(adminRef);

                if (adminSnap.exists()) {
                    console.log('[useAdmin] User found in admins collection');
                    setIsAdmin(true);
                } else {
                    console.log('[useAdmin] Access denied for:', user.email);
                    setIsAdmin(false);
                }
            } catch (error) {
                console.error('[useAdmin] Firestore check failed (likely permissions):', error);
                // We already checked whitelist, so if this fails, we assume not admin
                setIsAdmin(false);
            } finally {
                setAdminLoading(false);
            }
        };

        if (!authLoading) {
            checkAdmin();
        }
    }, [user, authLoading, isAuthenticated]);

    return { isAdmin, adminLoading };
};
