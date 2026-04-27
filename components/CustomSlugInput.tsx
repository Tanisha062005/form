"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CustomSlugInputProps {
    value: string;
    onChange: (value: string) => void;
    className?: string;
    formId?: string; // Added to exclude the current form from uniqueness check
}

type AvailabilityState = 'idle' | 'checking' | 'available' | 'taken';

export function CustomSlugInput({ value, onChange, className, formId }: CustomSlugInputProps) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    const [availability, setAvailability] = useState<AvailabilityState>('idle');
    const [copied, setCopied] = useState(false);
    const [errorMessage, setErrorMessage] = useState("Name already taken");

    // Debounce logic (500ms)
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, 500);

        return () => clearTimeout(handler);
    }, [value]);

    // Actual availability check via API
    useEffect(() => {
        if (!debouncedValue) {
            setAvailability('idle');
            return;
        }

        // Skip full API check if it's less than 3 chars to save requests (optional)
        if (debouncedValue.length < 3) {
            setAvailability('taken');
            setErrorMessage("Minimum 3 characters");
            return;
        }

        setAvailability('checking');

        const checkAvailability = async () => {
            try {
                const query = new URLSearchParams({ slug: debouncedValue });
                if (formId) {
                    query.append('currentFormId', formId);
                }

                const res = await fetch(`/api/forms/check-slug?${query.toString()}`);
                const data = await res.json();

                if (data.available) {
                    setAvailability('available');
                } else {
                    setAvailability('taken');
                    setErrorMessage(data.message || "Name already taken");
                }
            } catch (err) {
                console.error("Availability check failed", err);
                setAvailability('taken');
                setErrorMessage("Error checking availability");
            }
        };

        checkAvailability();
    }, [debouncedValue, formId]);

    const handleCopy = () => {
        // If the window origin is available (client-side), use it.
        const origin = typeof window !== 'undefined' ? window.location.origin : 'https://flowform-self.vercel.app';
        navigator.clipboard.writeText(`${origin}/f/${value}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Determine styles based on state
    const getStateColorClass = () => {
        switch (availability) {
            case 'checking':
                return 'var(--color-checking)';
            case 'available':
                return 'var(--color-available)';
            case 'taken':
                return 'var(--color-taken)';
            default:
                return 'var(--color-idle)';
        }
    };

    return (
        <div className={cn("w-full max-w-md mx-auto group", className)}>

            {/* Inject custom properties for the snake border */}
            <style dangerouslySetInnerHTML={{
                __html: `
        @property --slug-angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }
        @keyframes rotate-slug-border {
          to { --slug-angle: 360deg; }
        }
        .snake-container {
          --color-idle: transparent, transparent, transparent;
          --color-checking: #e5e5e5, #ffffff, #a3a3a3;
          --color-available: #22c55e, #10b981, #22c55e;
          --color-taken: #ef4444, #f43f5e, #ef4444;

          position: relative;
          border-radius: 1rem;
          padding: 2px; /* Border width */
          background-image: conic-gradient(
            from var(--slug-angle),
            transparent 0%,
            ${getStateColorClass()} 20%,
            transparent 40%
          );
          animation: 3s rotate-slug-border linear infinite;
        }
        .snake-container::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 2px;
          background-image: inherit;
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: exclude;
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
        }
        
        /* Outer Glow */
        .snake-container::after {
          content: "";
          position: absolute;
          inset: -4px;
          border-radius: 1.25rem;
          background-image: inherit;
          filter: blur(8px);
          opacity: ${availability === 'available' || availability === 'taken' ? '0.5' : '0'};
          transition: opacity 0.5s ease;
          z-index: -1;
        }
      `}} />

            {/* Main Container */}
            <motion.div
                layout
                className="snake-container transition-all duration-700 ease-in-out"
            >
                {/* Glassmorphic Inner */}
                <div className="relative bg-[#030303]/90 backdrop-blur-2xl border border-white/10 rounded-xl overflow-hidden flex flex-col z-10">

                    <div className="flex items-center px-4 py-3 gap-1">
                        <span className="text-indigo-400 font-medium select-none whitespace-nowrap text-xs sm:text-sm">
                            flowform-self.vercel.app/f/
                        </span>
                        <input
                            type="text"
                            value={value}
                            onChange={(e) => onChange(e.target.value.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase())} // Basic valid slug chars, lowercase
                            placeholder="your-custom-name"
                            className="flex-1 w-full bg-transparent border-none outline-none text-white placeholder-white/20 font-medium p-0 focus:ring-0"
                            spellCheck={false}
                        />
                    </div>

                    {/* Error Message Layout Expansion */}
                    <AnimatePresence>
                        {availability === 'taken' && (
                            <motion.div
                                layout
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                className="px-4 pb-3"
                            >
                                <p className="text-[#f43f5e] text-sm font-medium">{errorMessage}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>

            {/* Live Preview Section */}
            <div className="mt-6 flex items-center justify-between px-2">
                <div className="flex items-center text-sm">
                    <span className="text-white/50 mr-2">Your link:</span>
                    {/* Framer Motion Soft Drift for Preview text */}
                    <div className="text-white font-semibold font-poppins flex items-center h-6 overflow-hidden text-xs sm:text-sm">
                        <span>flowform-self.vercel.app/f/</span>
                        <div className="flex ml-[1px]">
                            <AnimatePresence mode="popLayout">
                                {value.split('').map((char, index) => (
                                    <motion.span
                                        key={`${index}-${char}`}
                                        initial={{ opacity: 0, y: 4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -4 }}
                                        transition={{ duration: 0.2, ease: "easeOut" }}
                                        className="inline-block whitespace-pre"
                                    >
                                        {char}
                                    </motion.span>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Copy Button with pulse */}
                <AnimatePresence>
                    {value && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleCopy}
                            className={cn(
                                "p-2 rounded-full transition-all duration-300 relative",
                                copied ? "text-green-400 bg-green-400/10" : "text-white/50 hover:text-white hover:bg-white/10"
                            )}
                            title="Copy to clipboard"
                        >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}

                            {/* Pulse animation strictly when clicked (or simply reliant on interaction) */}
                            {copied && (
                                <motion.div
                                    initial={{ scale: 1, opacity: 0.8 }}
                                    animate={{ scale: 1.5, opacity: 0 }}
                                    transition={{ duration: 0.4 }}
                                    className="absolute inset-0 rounded-full border border-green-400/50"
                                />
                            )}
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
