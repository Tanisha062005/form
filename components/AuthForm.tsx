"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Sparkles } from "lucide-react";

export default function AuthForm() {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Form states
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            if (isLogin) {
                // Login Logic
                const res = await signIn("credentials", {
                    redirect: false,
                    email,
                    password,
                });

                if (res?.error) {
                    setError("Invalid credentials.");
                    setLoading(false);
                } else {
                    router.push("/dashboard");
                }
            } else {
                // Register Logic
                const res = await fetch("/api/auth/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, email, password }),
                });

                if (res.ok) {
                    // Auto-login after registration
                    const loginRes = await signIn("credentials", {
                        redirect: false,
                        email,
                        password,
                    });
                    if (loginRes?.ok) {
                        router.push("/dashboard");
                    } else {
                        setIsLogin(true);
                    }
                } else {
                    const data = await res.json();
                    setError(data.message || "Registration failed.");
                    setLoading(false);
                }
            }
        } catch {
            setError("An unexpected error occurred.");
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setError("");
    };

    return (
        <div className="glass-card p-8 space-y-6 animate-in fade-in zoom-in duration-500">
            {/* Header */}
            <div className="text-center space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-medium text-purple-300">
                    <Sparkles className="w-3 h-3" />
                    <span>FormFlow Authentication</span>
                </div>

                <AnimatePresence mode="wait">
                    <motion.h2
                        key={isLogin ? "login-title" : "register-title"}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400"
                    >
                        {isLogin ? "Welcome Back!" : "Join FormFlow"}
                    </motion.h2>
                </AnimatePresence>

                <p className="text-muted-foreground text-sm">
                    {isLogin
                        ? "Sign in to access your forms and analytics."
                        : "Create an account to start building beautiful forms."}
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {!isLogin && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    required={!isLogin}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-300 placeholder:text-gray-500"
                                    placeholder="John Doe"
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Email Address
                    </label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-300 placeholder:text-gray-500"
                        placeholder="you@example.com"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Password
                    </label>
                    <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-300 placeholder:text-gray-500"
                        placeholder="••••••••"
                    />
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm"
                    >
                        {error}
                    </motion.div>
                )}

                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading}
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl shadow-lg shadow-purple-900/20 hover:shadow-purple-700/40 transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <Loader2 className="animate-spin w-5 h-5" />
                    ) : (
                        isLogin ? "Sign In" : "Create Account"
                    )}
                </motion.button>
            </form>

            {/* Toggle */}
            <div className="text-center pt-4 border-t border-white/5">
                <p className="text-muted-foreground text-sm">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button
                        onClick={toggleMode}
                        className="text-purple-400 hover:text-indigo-400 font-semibold transition-colors underline-offset-4 hover:underline"
                    >
                        {isLogin ? "Sign up" : "Sign in"}
                    </button>
                </p>
            </div>
        </div>
    );
}
