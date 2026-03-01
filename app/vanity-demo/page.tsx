"use client";

import React, { useState } from 'react';
import { CustomSlugInput } from '@/components/CustomSlugInput';

export default function VanityDemoPage() {
    const [slug, setSlug] = useState('');

    return (
        <div className="min-h-screen bg-[#030303] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">

            {/* Background glow for aesthetics */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-xl w-full relative z-10 text-center space-y-12">
                <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl font-bold font-poppins bg-gradient-to-br from-white via-white/80 to-indigo-400 bg-clip-text text-transparent">
                        Claim Your Identity
                    </h1>
                    <p className="text-white/50 text-lg max-w-md mx-auto">
                        Personalize your FormFlow link. Stand out with a custom vanity URL that reflects your brand.
                    </p>
                </div>

                <div className="mt-12 text-left">
                    <CustomSlugInput
                        value={slug}
                        onChange={setSlug}
                    />
                </div>

                <p className="text-white/30 text-xs mt-12">
                    Try typing &apos;admin&apos; or &apos;tani&apos; to see the taken state.
                </p>
            </div>
        </div>
    );
}
