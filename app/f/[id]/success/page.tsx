"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Home, Clock, Edit3 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

export default function SuccessPage() {
    const searchParams = useSearchParams();
    const ts = searchParams.get('ts');

    const submissionTime = ts ? new Date(ts) : new Date();
    const editDeadline = new Date(submissionTime.getTime() + 10 * 60 * 1000);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#030014]">
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
            </div>

            <div className="max-w-md w-full glass p-12 rounded-[2.5rem] border border-white/10 text-center space-y-10 relative z-10 shadow-[0_0_100px_rgba(168,85,247,0.1)]">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 12 }}
                    className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(34,197,94,0.2)]"
                >
                    <CheckCircle2 className="w-12 h-12 text-green-400" />
                </motion.div>

                <div className="space-y-4">
                    <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/40">
                        Response Submitted! 🚀
                    </h1>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        Your response has been secured. You&apos;re all set!
                    </p>
                </div>

                {/* Submission Info Card */}
                <div className="grid grid-cols-1 gap-4 text-left">
                    <div className="glass bg-white/5 border border-white/5 p-6 rounded-3xl space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-white/60">
                                <Clock className="w-4 h-4" />
                                <span className="text-sm font-medium">Submitted At</span>
                            </div>
                            <div className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20">
                                <span className="text-purple-400 font-bold text-sm animate-pulse-subtle shadow-[0_0_10px_rgba(168,85,247,0.5)]">
                                    {formatTime(submissionTime)}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-white/5">
                            <div className="flex items-center gap-3 text-white/60">
                                <Edit3 className="w-4 h-4" />
                                <span className="text-sm font-medium">Edit Window</span>
                            </div>
                            <span className="text-white font-mono text-sm">
                                Until {formatTime(editDeadline)}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="pt-4 space-y-4">
                    <Link href="/">
                        <Button className="w-full h-16 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 font-bold gap-3 text-xl border-0 shadow-[0_0_30px_rgba(147,51,234,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98]">
                            <Home className="w-6 h-6" />
                            Return Home
                        </Button>
                    </Link>

                    <p className="text-xs text-muted-foreground pt-4 flex items-center justify-center gap-2">
                        <span>Powered by</span>
                        <span className="text-purple-400 font-black tracking-wider uppercase text-[0.65rem]">FormFlow</span>
                    </p>
                </div>
            </div>

            <style jsx global>{`
                @keyframes pulse-subtle {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.8; transform: scale(1.02); }
                }
                .animate-pulse-subtle {
                    animation: pulse-subtle 2s infinite ease-in-out;
                }
            `}</style>
        </div>
    );
}
