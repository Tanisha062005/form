"use client";

import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

import CreateFormModal from './CreateFormModal';
import { useOfflineSync } from './providers/OfflineProvider';

const Navbar = () => {
    const { data: session } = useSession();
    const { isOffline, isSyncing, pendingCount } = useOfflineSync();

    return (
        <motion.nav
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-7xl"
        >
            <div className="glass px-6 py-4 flex items-center justify-between rounded-2xl">
                <div className="flex items-center gap-3">
                    <Link href="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">
                        FormFlow
                    </Link>

                    {/* Offline / Syncing Indicator Dot */}
                    {(isOffline || isSyncing || pendingCount > 0) && (
                        <div className="relative flex items-center justify-center w-6 h-6">
                            {isOffline ? (
                                <motion.div
                                    title="Offline - Data will be saved locally"
                                    animate={{
                                        boxShadow: ["0 0 5px #4f46e5", "0 0 15px #4f46e5", "0 0 5px #4f46e5"],
                                        opacity: [0.5, 1, 0.5]
                                    }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                    className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_#4f46e5]"
                                />
                            ) : (isSyncing || pendingCount > 0) ? (
                                <motion.div
                                    title={`Syncing ${pendingCount} items...`}
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    className="w-4 h-4 rounded-full border-2 border-transparent border-t-indigo-500 border-r-purple-500"
                                    style={{
                                        filter: "drop-shadow(0 0 8px rgba(79, 70, 229, 0.8))"
                                    }}
                                />
                            ) : null}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    <CreateFormModal />
                    {session && (
                        <button
                            onClick={() => signOut({ callbackUrl: '/auth' })}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Sign Out</span>
                        </button>
                    )}
                </div>
            </div>
        </motion.nav>
    );
};

export default Navbar;
