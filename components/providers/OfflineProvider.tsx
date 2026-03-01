"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { getQueue, removeFromQueue } from '@/lib/indexedDbSync';
import { toast } from 'sonner';

interface OfflineContextType {
    isOffline: boolean;
    isSyncing: boolean;
    pendingCount: number;
    triggerSync: () => Promise<void>;
    updatePendingCount: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextType>({
    isOffline: false,
    isSyncing: false,
    pendingCount: 0,
    triggerSync: async () => { },
    updatePendingCount: async () => { }
});

export const useOfflineSync = () => useContext(OfflineContext);

export const OfflineProvider = ({ children }: { children: React.ReactNode }) => {
    const [isOffline, setIsOffline] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);
    const syncInProgress = useRef(false);

    const updatePendingCount = useCallback(async () => {
        const queue = await getQueue();
        setPendingCount(queue.length);
    }, []);

    const triggerSync = useCallback(async () => {
        if (syncInProgress.current) return;

        const queue = await getQueue();
        if (queue.length === 0) return;

        syncInProgress.current = true;
        setIsSyncing(true);

        let successCount = 0;
        let failureCount = 0;

        for (const item of queue) {
            try {
                const res = await fetch(`/api/f/${item.formId}/submit`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(item.payload),
                });

                if (res.ok) {
                    await removeFromQueue(item.id);
                    successCount++;
                } else {
                    // If it's a permanent error (like 404 Form Not Found, or 400 Bad Request),
                    // we should probably remove it so it doesn't block forever.
                    if (res.status >= 400 && res.status < 500) {
                        console.warn(`Sync failed permanently for form ${item.formId}. Removing from queue. Status: ${res.status}`);
                        await removeFromQueue(item.id);
                    }
                    failureCount++;
                }
            } catch (err) {
                console.error(`Sync network error for form ${item.formId}:`, err);
                failureCount++;
            }
        }

        await updatePendingCount();
        setIsSyncing(false);
        syncInProgress.current = false;

        if (successCount > 0 && failureCount === 0) {
            toast.success("All offline data synced successfully.", {
                className: "glass bg-green-500/10 border-green-500/20 text-white backdrop-blur-xl"
            });
        } else if (successCount > 0 && failureCount > 0) {
            toast.warning(`Synced ${successCount} items, but ${failureCount} failed.`, {
                className: "glass bg-yellow-500/10 border-yellow-500/20 text-white backdrop-blur-xl"
            });
        }
    }, [updatePendingCount]);

    useEffect(() => {
        // Initial setup
        if (typeof window !== 'undefined') {
            setIsOffline(!navigator.onLine);
            updatePendingCount();

            const handleOnline = () => {
                setIsOffline(false);
                triggerSync();
            };

            const handleOffline = () => {
                setIsOffline(true);
            };

            window.addEventListener('online', handleOnline);
            window.addEventListener('offline', handleOffline);

            // Also check on mount if we're online and have pending items
            if (navigator.onLine) {
                triggerSync();
            }

            // Periodic fallback sync check (every 30 seconds)
            const interval = setInterval(() => {
                if (!isOffline && !isSyncing) {
                    triggerSync();
                }
            }, 30000);

            return () => {
                window.removeEventListener('online', handleOnline);
                window.removeEventListener('offline', handleOffline);
                clearInterval(interval);
            };
        }
    }, [triggerSync, updatePendingCount, isOffline, isSyncing]);

    return (
        <OfflineContext.Provider value={{ isOffline, isSyncing, pendingCount, triggerSync, updatePendingCount }}>
            {children}
        </OfflineContext.Provider>
    );
};
