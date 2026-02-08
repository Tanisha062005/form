"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import { Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

// Dynamic imports to prevent SSR issues
const PieChart = dynamic(() => import('recharts').then(mod => mod.PieChart), { ssr: false });
const Pie = dynamic(() => import('recharts').then(mod => mod.Pie), { ssr: false });

const COLORS = ['#a855f7', '#06b6d4', '#ec4899', '#6366f1', '#10b981', '#f59e0b', '#ef4444'];

interface ResponseChartProps {
    label: string;
    data: { name: string; value: number }[];
    total: number;
}

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="glass px-4 py-2 rounded-xl border-white/10 shadow-2xl backdrop-blur-xl">
                <p className="text-sm font-bold text-white">{payload[0].name}</p>
                <p className="text-xs text-purple-400 font-medium">{payload[0].value} Responses</p>
            </div>
        );
    }
    return null;
};

export default function ResponseChart({ label, data, total }: ResponseChartProps) {
    const hasData = total > 0;

    return (
        <div className="glass rounded-[2rem] p-8 border-white/5 flex flex-col h-[450px] group hover:border-purple-500/20 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/5 relative overflow-hidden">
            {/* Decorative background pulse */}
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-purple-500/5 rounded-full blur-3xl group-hover:bg-purple-500/10 transition-all duration-500" />

            <div className="mb-8 z-10">
                <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">{label}</h3>
                <div className="flex items-center gap-2 mt-2">
                    <div className="w-8 h-1 rounded-full bg-purple-500/50" />
                    <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">Answer Distribution</p>
                </div>
            </div>

            <div className="flex-1 w-full min-h-0 flex items-center justify-center z-10">
                {!hasData ? (
                    <div className="text-center space-y-2">
                        <div className="w-16 h-16 rounded-full bg-white/5 mx-auto flex items-center justify-center border border-white/10 italic text-white/20 text-xs">
                            ?
                        </div>
                        <p className="text-sm text-white/30 font-medium italic">No data to visualize yet</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                innerRadius={80}
                                outerRadius={110}
                                paddingAngle={8}
                                dataKey="value"
                                stroke="none"
                            >
                                {data.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index % COLORS.length]}
                                        className="outline-none"
                                    />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                iconType="circle"
                                formatter={(value) => <span className="text-[10px] text-white/60 font-medium uppercase tracking-wider">{value}</span>}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                )}
            </div>

            {hasData && (
                <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center z-10">
                    <p className="text-[10px] text-white/40 font-bold uppercase">Total Sample</p>
                    <p className="text-lg font-black text-white">{total}</p>
                </div>
            )}
        </div>
    );
}
