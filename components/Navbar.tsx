"use client";

import React from 'react';
import Link from 'next/link';

import CreateFormModal from './CreateFormModal';

const Navbar = () => {
    return (
        <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-7xl">
            <div className="glass px-6 py-4 flex items-center justify-between rounded-2xl">
                <Link href="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-400">
                    FormFlow
                </Link>
                <div className="flex items-center gap-4">
                    <CreateFormModal />
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
