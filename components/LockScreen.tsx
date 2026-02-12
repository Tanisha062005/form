"use client";

import React, { useState } from 'react';
import { Lock, Loader2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import NeonSnakeBorder from './ui/NeonSnakeBorder';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LockScreenProps {
    onVerified: () => void;
    correctPasswordHash: string; // For this demo, we'll just use the raw password or a simple hash check
}

export default function LockScreen({ onVerified, correctPasswordHash }: LockScreenProps) {
    const [password, setPassword] = useState("");
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleVerify = async () => {
        setLoading(true);
        setError(false);

        // Simulate a small delay for premium feel
        await new Promise(resolve => setTimeout(resolve, 800));

        if (password === correctPasswordHash) {
            onVerified();
        } else {
            setError(true);
            setPassword("");
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-[#030014]">
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="max-w-md w-full relative z-10"
            >
                <NeonSnakeBorder className="w-full">
                    <div className="p-12 text-center space-y-10">
                        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.05)] relative overflow-hidden group">
                            <AnimatePresence mode="wait">
                                {loading ? (
                                    <motion.div
                                        key="loader"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    >
                                        <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="lock"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                    >
                                        <Lock className="w-10 h-10 text-white/40 group-hover:text-white transition-colors" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="space-y-4">
                            <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/40 uppercase tracking-tighter">
                                Secured Area
                            </h1>
                            <p className="text-lg text-white/40 font-medium">
                                This form is password protected. Enter the access key to continue.
                            </p>
                        </div>

                        <div className="space-y-6">
                            <div className="relative group">
                                <Input
                                    type="password"
                                    placeholder="Enter Password..."
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                                    className={cn(
                                        "h-16 glass bg-white/5 border-white/10 focus:ring-2 focus:ring-purple-500/50 rounded-2xl text-center text-2xl font-black tracking-[0.5em] placeholder:tracking-normal placeholder:text-white/10 transition-all",
                                        error && "border-red-500/50 bg-red-500/5 shadow-[0_0_20px_rgba(239,68,68,0.2)] animate-shake"
                                    )}
                                    autoFocus
                                />
                                {error && (
                                    <p className="text-red-400 text-xs font-black uppercase tracking-widest mt-3 animate-bounce">
                                        Access Denied. Try Again.
                                    </p>
                                )}
                            </div>

                            <Button
                                onClick={handleVerify}
                                disabled={loading || !password}
                                className="w-full h-16 bg-white text-black hover:bg-white/90 font-black rounded-2xl flex items-center justify-center gap-3 text-xl transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl"
                            >
                                {loading ? "Verifying..." : "Unlock Form"}
                                <ArrowRight className="w-6 h-6" />
                            </Button>
                        </div>
                    </div>
                </NeonSnakeBorder>
            </motion.div>

            <style jsx global>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .animate-shake {
                    animation: shake 0.2s ease-in-out 0s 2;
                }
            `}</style>
        </div>
    );
}

