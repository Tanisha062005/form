"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Poppins } from "next/font/google";

const poppins = Poppins({
    weight: ["500"],
    subsets: ["latin"],
});

export default function GoogleSignInButton() {
    const [loading, setLoading] = useState(false);

    const handleGoogleSignIn = async () => {
        setLoading(true);
        try {
            await signIn("google", { callbackUrl: "/dashboard" });
        } catch (error) {
            toast.error("Failed to sign in with Google.");
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4, ease: "easeOut" }}
            className="w-full relative group"
        >
            {/* Multi-Color Snake Border via Framer Motion */}
            <div className="absolute -inset-[1px] rounded-xl overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                        repeat: Infinity,
                        duration: 3,
                        ease: "linear",
                    }}
                    className="absolute inset-[-100%] z-0"
                    style={{
                        background:
                            "conic-gradient(from 0deg, transparent 40%, rgba(66, 133, 244, 1), rgba(234, 67, 53, 1), rgba(251, 188, 5, 1), rgba(52, 168, 83, 1), transparent 60%)",
                    }}
                />
            </div>

            {/* Inner background to mask the snake center */}
            <div className="absolute inset-[1px] rounded-xl bg-[#0f0f13] pointer-events-none z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="relative z-10 w-full flex items-center justify-center gap-3 py-2.5 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-transparent transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
            >
                {/* Official Google G SVG */}
                {loading ? (
                    <Loader2 className="animate-spin w-5 h-5 text-purple-400" />
                ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                )}

                <span className={`${poppins.className} text-white font-medium text-sm tracking-wide`}>
                    Continue with Google
                </span>
            </button>
        </motion.div>
    );
}
