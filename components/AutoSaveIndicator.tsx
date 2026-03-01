"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Poppins } from "next/font/google";

const poppins = Poppins({
    weight: ["400"],
    subsets: ["latin"],
});

interface AutoSaveIndicatorProps {
    lastSaved: Date | null;
}

export default function AutoSaveIndicator({ lastSaved }: AutoSaveIndicatorProps) {
    const [pulse, setPulse] = useState(false);

    // Trigger the animation whenever the lastSaved timestamp is updated
    useEffect(() => {
        if (lastSaved) {
            setPulse(true);
            const timer = setTimeout(() => {
                setPulse(false);
            }, 1000); // Allow animation to complete before resetting
            return () => clearTimeout(timer);
        }
    }, [lastSaved]);

    if (!lastSaved) return null; // Don't show indicator if no data has been saved yet

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{
                    opacity: pulse ? 1 : 0.4,
                    scale: pulse ? 1.05 : 1,
                    y: 0,
                    boxShadow: pulse
                        ? "0px 0px 15px rgba(79, 70, 229, 0.7)" // Neon Indigo Shadow
                        : "0px 0px 0px rgba(0,0,0,0)",
                }}
                exit={{ opacity: 0 }}
                transition={{
                    duration: pulse ? 0.3 : 0.6, // Quick pop in, slow fade out
                    ease: "easeOut",
                }}
                className={`fixed bottom-24 right-6 z-40 flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 ${poppins.className} text-[12px] text-white pointer-events-none`}
            >
                <motion.div
                    animate={{
                        rotate: pulse ? [0, 15, -15, 0] : 0,
                        color: pulse ? "#a855f7" : "#fff", // Purple-500 equivalent color pulse
                    }}
                    transition={{ duration: 0.5 }}
                >
                    <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={pulse ? "text-purple-400" : "text-white/40"}
                    >
                        {pulse ? (
                            <>
                                {/* Loading/Syncing Icon equivalent */}
                                <path d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 0 1 9-9" />
                            </>
                        ) : (
                            <>
                                {/* Check Icon equivalent */}
                                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                                <polyline points="17 21 17 13 7 13 7 21" />
                                <polyline points="7 3 7 8 15 8" />
                            </>
                        )}

                    </svg>
                </motion.div>
                <span>Draft Saved</span>
            </motion.div>
        </AnimatePresence>
    );
}
