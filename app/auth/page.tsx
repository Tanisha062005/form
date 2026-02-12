import React from "react";
import AuthForm from "@/components/AuthForm";

export default function AuthPage() {
    return (
        <div className="min-h-screen w-full flex items-center justify-center px-4">
            <div className="relative z-10 w-full max-w-md">
                <AuthForm />
            </div>
        </div>
    );
}
