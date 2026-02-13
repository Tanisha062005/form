"use client";

import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';

import CreateFormModal from './CreateFormModal';

const Navbar = () => {
    const { data: session } = useSession();

    return (
        <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-7xl">
            <div className="glass px-6 py-4 flex items-center justify-between rounded-2xl">
                <Link href="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">
                    FormFlow
                </Link>
                <div className="flex items-center gap-4">
                    <CreateFormModal />
                    {session && (
                        <button
                            onClick={() => signOut({ callbackUrl: '/auth' })}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Sign Out</span>
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
