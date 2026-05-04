"use client";

import { usePathname } from "next/navigation";
import React from "react";

export function MainLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFormPage = pathname?.startsWith('/f/');

  return (
    <main className={isFormPage ? "" : "pt-32 pb-12 px-6"}>
      {children}
    </main>
  );
}
