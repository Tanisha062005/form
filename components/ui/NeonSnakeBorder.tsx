"use client";

import React from "react";
import { motion } from "framer-motion";

interface NeonSnakeBorderProps {
    children: React.ReactNode;
    className?: string;
}

const NeonSnakeBorder: React.FC<NeonSnakeBorderProps> = ({ children, className = "" }) => {
    return (
        <div className={`relative flex items-center justify-center overflow-hidden rounded-[20px] p-[2px] ${className}`}>
            {/* The Traveling Neon Snake */}
            <motion.div
                className="absolute inset-[-50%]"
                style={{
                    background: "conic-gradient(from 0deg, transparent 60%, #9333ea 80%, #db2777 100%)",
                }}
                animate={{ rotate: 360 }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "linear",
                }}
            />

            {/* The Glass Mask - Inner Content Container */}
            <div className="relative z-10 h-full w-full rounded-[20px] bg-black/90 backdrop-blur-3xl">
                {children}
            </div>
        </div>
    );
};

export default NeonSnakeBorder;
