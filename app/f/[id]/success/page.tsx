import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, ArrowLeft, Home } from "lucide-react";

export default function SuccessPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#030014]">
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
            </div>

            <div className="max-w-md w-full glass p-12 rounded-[2.5rem] border border-white/10 text-center space-y-8 relative z-10">
                <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(34,197,94,0.2)]">
                    <CheckCircle2 className="w-12 h-12 text-green-400" />
                </div>

                <div className="space-y-4">
                    <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/40">
                        Response Submitted! 🚀
                    </h1>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        Thank you for your response. Your data has been recorded successfully.
                    </p>
                </div>

                <div className="pt-4 space-y-3">
                    <Link href="/">
                        <Button className="w-full h-14 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 font-bold gap-2 text-lg border-0">
                            <Home className="w-5 h-5" />
                            Return Home
                        </Button>
                    </Link>
                    <p className="text-xs text-muted-foreground pt-4">
                        Powered by <span className="text-purple-400 font-bold">FormFlow</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
