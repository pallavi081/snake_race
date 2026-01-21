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

            try {
                // 1. Check if user is in 'admins' collection
                const adminRef = doc(db, 'admins', user.uid);
                const adminSnap = await getDoc(adminRef);

                if (adminSnap.exists()) {
                    console.log('[useAdmin] User found in admins collection');
                    setIsAdmin(true);
                } else {
                    console.log('[useAdmin] User not in admins collection, checking email whitelist');
                    // 2. Fallback: Check email for super-admin (optional/development)
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
                    } else {
                        console.log('[useAdmin] Access denied for email:', user.email);
                        setIsAdmin(false);
                    }
                }
            } catch (error) {
                console.error('[useAdmin] Error checking admin status:', error);
                setIsAdmin(false);
            } finally {
                console.log('[useAdmin] Admin check complete. Result:', isAdmin);
                setAdminLoading(false);
            }
        };

        if (!authLoading) {
            checkAdmin();
        }
    }, [user, authLoading, isAuthenticated]);

    return { isAdmin, adminLoading };
};
