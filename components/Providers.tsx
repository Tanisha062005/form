"use client";

import { SessionProvider } from "next-auth/react";
import { OfflineProvider } from "./providers/OfflineProvider";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <OfflineProvider>
                {children}
            </OfflineProvider>
        </SessionProvider>
    );
}
