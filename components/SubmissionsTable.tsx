"use client";

import React from 'react';
import { format } from 'date-fns';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export default function SubmissionsTable({ form, submissions }: { form: any, submissions: any[] }) {
    if (submissions.length === 0) {
        return (
            <div className="glass rounded-[2rem] p-20 text-center border-white/5">
                <p className="text-muted-foreground text-lg">No responses collected yet.</p>
            </div>
        );
    }

    return (
        <div className="glass rounded-[2rem] border-white/5 overflow-hidden">
            <ScrollArea className="w-full">
                <div className="min-w-full inline-block align-middle">
                    <table className="min-w-full divide-y divide-white/5">
                        <thead className="bg-white/5">
                            <tr>
                                <th scope="col" className="px-6 py-5 text-left text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                    Submitted At
                                </th>
                                {form.fields.map((field: any) => (
                                    <th key={field.id} scope="col" className="px-6 py-5 text-left text-xs font-bold text-muted-foreground uppercase tracking-widest min-w-[200px]">
                                        {field.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 bg-transparent">
                            {submissions.map((submission) => (
                                <tr key={submission._id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-6 whitespace-nowrap text-sm text-muted-foreground font-medium">
                                        {format(new Date(submission.submittedAt), 'MMM d, yyyy • HH:mm')}
                                    </td>
                                    {form.fields.map((field: any) => {
                                        let val = submission.answers[field.id];
                                        if (Array.isArray(val)) val = val.join(', ');

                                        return (
                                            <td key={field.id} className="px-6 py-6 text-sm text-foreground">
                                                {val ? (
                                                    <span className="bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                                                        {val}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground/30 italic">Not provided</span>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <ScrollBar orientation="horizontal" />
            </ScrollArea>
        </div>
    );
}
