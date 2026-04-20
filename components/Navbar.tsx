"use client";

import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { LogOut, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import CreateFormModal from './CreateFormModal';
import { Button } from '@/components/ui/button';
import { useOfflineSync } from './providers/OfflineProvider';

const Navbar = () => {
    const { data: session } = useSession();
    const { isOffline, isSyncing, pendingCount } = useOfflineSync();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

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

                <div className="hidden md:flex items-center gap-4">
                    <CreateFormModal />
                    {session && (
                        <button
                            onClick={() => signOut({ callbackUrl: '/auth' })}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden md:inline">Sign Out</span>
                        </button>
                    )}
                </div>

                <div className="md:hidden flex items-center">
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2 text-white/70 hover:text-white"
                    >
                        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
                        className="md:hidden absolute top-full w-full mt-4"
                    >
                        <div className="glass rounded-2xl p-4 flex flex-col gap-4 shadow-2xl border border-white/10">
                            <CreateFormModal>
                                <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold border-0 h-12 rounded-xl text-lg relative z-50">
                                    Create Form
                                </Button>
                            </CreateFormModal>
                            {session && (
                                <button
                                    onClick={() => signOut({ callbackUrl: '/auth' })}
                                    className="w-full flex justify-center items-center gap-2 px-3 py-3 rounded-xl text-sm font-bold text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 transition-all duration-200"
                                >
                                    <LogOut className="w-5 h-5" />
                                    <span>Sign Out</span>
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
};

export default Navbar;
