"use client";

import React from 'react';
import { processSubmissions } from '@/lib/analytics';
import ResponseChart from './ResponseChart';
import { TrendingUp, Award, Users } from 'lucide-react';

interface Field {
    id: string;
    label: string;
    type: string;
    options?: string[];
}

interface Form {
    fields: Field[];
}

interface Submission {
    formId: string;
    answers: Record<string, string | number | boolean | string[] | Record<string, unknown>>;
    submittedAt: Date;
}

export default function AnalyticsCharts({ form, submissions }: { form: Form, submissions: Submission[] }) {
    const stats = processSubmissions(form.fields, submissions);

    if (stats.length === 0) {
        return (
            <div className="glass rounded-[2rem] p-12 text-center border-white/5">
                <p className="text-muted-foreground">No visual analytics available for this form yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-12">
            {/* Summary Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.slice(0, 4).map((stat, index) => (
                    <div key={`summary-${index}`} className="glass p-6 rounded-3xl border-white/5 relative overflow-hidden group hover:border-purple-500/30 transition-all duration-500">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 group-hover:scale-110 transition-transform duration-500">
                                {index % 2 === 0 ? <TrendingUp className="w-4 h-4 text-purple-400" /> : <Award className="w-4 h-4 text-cyan-400" />}
                            </div>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest truncate">{stat.label}</span>
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-2xl font-black text-white">{stat.summary.percentage}%</h4>
                            <p className="text-[10px] text-white/40 font-medium leading-relaxed">
                                most select <span className="text-purple-400 font-bold">&quot;{stat.summary.topOption}&quot;</span>
                            </p>
                        </div>
                        {/* Progress bar background */}
                        <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-purple-500 to-cyan-500 opacity-20" style={{ width: `${stat.summary.percentage}%` }} />
                    </div>
                ))}

                {submissions.length > 0 && (
                    <div className="glass p-6 rounded-3xl border-white/5 flex flex-col justify-center items-center text-center bg-gradient-to-br from-purple-500/5 to-transparent">
                        <Users className="w-8 h-8 text-white/20 mb-2" />
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Participation</p>
                        <h4 className="text-2xl font-black text-white mt-1">{submissions.length}</h4>
                    </div>
                )}
            </div>

            {/* Detailed Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {stats.map((stat) => (
                    <ResponseChart
                        key={stat.fieldId}
                        label={stat.label}
                        data={stat.data}
                        total={stat.total}
                    />
                ))}
            </div>
        </div>
    );
}

