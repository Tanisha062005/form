"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, Variants } from "framer-motion";

export default function Home() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-8 max-w-4xl mx-auto"
    >
      <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-white/10 text-sm font-medium text-purple-300 animate-bounce">
        <Sparkles className="w-4 h-4" />
        <span>New: Conditional Logic is now live!</span>
      </motion.div>

      <motion.h1 variants={itemVariants} className="text-6xl md:text-8xl font-extrabold tracking-tight leading-tight">
        Forms that feel <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-indigo-400 to-blue-400 animate-gradient">Premium.</span>
      </motion.h1>

      <motion.p variants={itemVariants} className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
        Experience the next generation of form building. Beautifully crafted,
        highly intuitive, and powered by FormFlow&apos;s signature Glassmorphism design.
      </motion.p>

      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-6 pt-8">
        <Link href="/dashboard">
          <Button size="lg" className="h-16 px-10 rounded-2xl text-lg font-bold bg-primary hover:bg-primary/90 shadow-[0_0_20px_rgba(147,51,234,0.4)] transition-all hover:scale-105 active:scale-95">
            Get Started
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </Link>
        <Button variant="ghost" size="lg" className="h-16 px-10 rounded-2xl text-lg font-bold glass border-white/10 hover:bg-white/5">
          View Demo
        </Button>
      </motion.div>

      <motion.div variants={itemVariants} className="pt-20 grid grid-cols-2 md:grid-cols-4 gap-8 w-full">
        {[
          { label: 'Responsive', icon: '📱' },
          { label: 'Fast API', icon: '⚡' },
          { label: 'Secure', icon: '🔒' },
          { label: 'Custom Logic', icon: '🧠' }
        ].map((item, i) => (
          <div key={i} className="glass p-6 rounded-2xl border-white/5">
            <div className="text-3xl mb-2">{item.icon}</div>
            <div className="font-semibold">{item.label}</div>
          </div>
        ))}
      </motion.div>
    </motion.div>
  );
}
