"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Sparkles, ArrowRight } from "lucide-react";

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
                const res = await fetch("/api/auth/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, email, password }),
                });

                if (res.ok) {
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
        <div className="auth-container w-full max-w-[750px] min-h-[460px] relative z-10">
            <div className="relative z-10 w-full min-h-[460px]">

                {/* ── Both Form Panels sit side-by-side behind the overlay ── */}
                <div className="hidden md:flex w-full min-h-[460px]">
                    {/* Login Form — always on the LEFT half */}
                    <div className="w-1/2 flex items-center justify-center p-8">
                        <AnimatePresence mode="wait">
                            {isLogin && (
                                <motion.div
                                    key="login-form"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0, transition: { duration: 0.4, delay: 0.25 } }}
                                    exit={{ opacity: 0, x: -20, transition: { duration: 0.25 } }}
                                    className="w-full max-w-[280px] space-y-5"
                                >
                                    <FormHeader
                                        title="Sign In"
                                        subtitle="Access your forms and analytics"
                                    />
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <InputField
                                            label="Email"
                                            type="email"
                                            value={email}
                                            onChange={setEmail}
                                            placeholder="you@example.com"
                                        />
                                        <InputField
                                            label="Password"
                                            type="password"
                                            value={password}
                                            onChange={setPassword}
                                            placeholder="••••••••"
                                        />
                                        <ErrorMessage error={error} />
                                        <SubmitButton loading={loading} text="Sign In" />
                                    </form>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Signup Form — always on the RIGHT half */}
                    <div className="w-1/2 flex items-center justify-center p-8">
                        <AnimatePresence mode="wait">
                            {!isLogin && (
                                <motion.div
                                    key="signup-form"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0, transition: { duration: 0.4, delay: 0.25 } }}
                                    exit={{ opacity: 0, x: 20, transition: { duration: 0.25 } }}
                                    className="w-full max-w-[280px] space-y-5"
                                >
                                    <FormHeader
                                        title="Create Account"
                                        subtitle="Start building beautiful forms"
                                    />
                                    <form onSubmit={handleSubmit} className="space-y-3">
                                        <InputField
                                            label="Full Name"
                                            type="text"
                                            value={name}
                                            onChange={setName}
                                            placeholder="John Doe"
                                        />
                                        <InputField
                                            label="Email"
                                            type="email"
                                            value={email}
                                            onChange={setEmail}
                                            placeholder="you@example.com"
                                        />
                                        <InputField
                                            label="Password"
                                            type="password"
                                            value={password}
                                            onChange={setPassword}
                                            placeholder="••••••••"
                                        />
                                        <ErrorMessage error={error} />
                                        <SubmitButton loading={loading} text="Create Account" />
                                    </form>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* ── Mobile: Single column layout ── */}
                <div className="flex md:hidden items-center justify-center p-6 min-h-[460px]">
                    <AnimatePresence mode="wait">
                        {isLogin ? (
                            <motion.div
                                key="mobile-login"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1, transition: { duration: 0.3 } }}
                                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                                className="w-full max-w-[300px] space-y-5"
                            >
                                <FormHeader
                                    title="Sign In"
                                    subtitle="Access your forms and analytics"
                                />
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <InputField label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
                                    <InputField label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" />
                                    <ErrorMessage error={error} />
                                    <SubmitButton loading={loading} text="Sign In" />
                                </form>
                                <p className="text-center text-xs text-white/30 pt-2">
                                    Don&apos;t have an account?{" "}
                                    <button onClick={toggleMode} className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
                                        Sign Up
                                    </button>
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="mobile-signup"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1, transition: { duration: 0.3 } }}
                                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                                className="w-full max-w-[300px] space-y-5"
                            >
                                <FormHeader
                                    title="Create Account"
                                    subtitle="Start building beautiful forms"
                                />
                                <form onSubmit={handleSubmit} className="space-y-3">
                                    <InputField label="Full Name" type="text" value={name} onChange={setName} placeholder="John Doe" />
                                    <InputField label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
                                    <InputField label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" />
                                    <ErrorMessage error={error} />
                                    <SubmitButton loading={loading} text="Create Account" />
                                </form>
                                <p className="text-center text-xs text-white/30 pt-2">
                                    Already have an account?{" "}
                                    <button onClick={toggleMode} className="text-purple-400 hover:text-purple-300 font-semibold transition-colors">
                                        Sign In
                                    </button>
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* ── The Sliding Welcome Overlay (Desktop Only) ── */}
                <motion.div
                    className="hidden md:flex absolute top-0 w-1/2 h-full z-20 items-center justify-center pointer-events-auto"
                    initial={false}
                    animate={{
                        x: isLogin ? "100%" : "0%",
                    }}
                    transition={{
                        duration: 0.6,
                        ease: [0.4, 0, 0.2, 1],
                    }}
                    style={{ left: 0 }}
                >
                    {/* Gradient Glass Background */}
                    <div className="absolute inset-0 rounded-xl overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/90 via-indigo-600/85 to-violet-700/90" />
                        <div className="absolute inset-0 backdrop-blur-sm bg-white/[0.03]" />
                        <div
                            className="absolute inset-0 opacity-20"
                            style={{
                                backgroundImage:
                                    "radial-gradient(circle at 20% 80%, rgba(255,255,255,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)",
                            }}
                        />
                    </div>

                    {/* Panel Content */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={isLogin ? "cta-signup" : "cta-login"}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                            className="relative z-10 text-center px-8 space-y-5"
                        >
                            <motion.div
                                initial={{ y: 15, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3, duration: 0.4 }}
                            >
                                <h3 className="text-3xl font-bold text-white mb-2">
                                    {isLogin ? "Hello, Friend!" : "Welcome Back!"}
                                </h3>
                                <p className="text-white/70 text-sm leading-relaxed max-w-[200px] mx-auto">
                                    {isLogin
                                        ? "Enter your personal details and start your journey with us"
                                        : "To keep connected with us please login with your personal info"}
                                </p>
                            </motion.div>

                            <motion.button
                                initial={{ y: 10, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4, duration: 0.4 }}
                                onClick={toggleMode}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="px-8 py-2.5 rounded-full border-2 border-white/40 text-white text-sm font-semibold hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
                            >
                                {isLogin ? "Sign Up" : "Sign In"}
                            </motion.button>
                        </motion.div>
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
}

/* ── Sub-components ── */

function FormHeader({ title, subtitle }: { title: string; subtitle: string }) {
    return (
        <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] font-medium text-purple-300 uppercase tracking-wider">
                <Sparkles className="w-3 h-3" />
                <span>FormFlow</span>
            </div>
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">
                {title}
            </h2>
            <p className="text-xs text-white/40">{subtitle}</p>
        </div>
    );
}

function InputField({
    label,
    type,
    value,
    onChange,
    placeholder,
}: {
    label: string;
    type: string;
    value: string;
    onChange: (v: string) => void;
    placeholder: string;
}) {
    return (
        <div className="space-y-1">
            <label className="text-[10px] font-semibold text-white/30 uppercase tracking-widest">
                {label}
            </label>
            <input
                type={type}
                required
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="auth-input"
                placeholder={placeholder}
            />
        </div>
    );
}

function ErrorMessage({ error }: { error: string }) {
    if (!error) return null;
    return (
        <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-400 text-xs bg-red-500/10 border border-red-500/15 rounded-lg px-3 py-2"
        >
            {error}
        </motion.p>
    );
}

function SubmitButton({ loading, text }: { loading: boolean; text: string }) {
    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-sm font-semibold py-2.5 rounded-xl shadow-lg shadow-purple-900/30 hover:shadow-purple-700/40 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {loading ? (
                <Loader2 className="animate-spin w-4 h-4" />
            ) : (
                <>
                    {text}
                    <ArrowRight className="w-3.5 h-3.5" />
                </>
            )}
        </motion.button>
    );
}
