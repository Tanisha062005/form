"use client";

import React, { useState } from 'react';
import { format } from 'date-fns';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Eye, Smartphone, Tablet, Laptop, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Field {
    id: string;
    label: string;
    type: string;
}

interface Form {
    _id: string;
    fields: Field[];
}

interface Submission {
    _id: string;
    submittedAt: string | Date;
    answers: Record<string, unknown>;
    metadata?: {
        device?: string;
        location?: {
            city?: string;
            country?: string;
        };
    };
}

export default function SubmissionsTable({ form, submissions }: { form: Form, submissions: Submission[] }) {
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    if (submissions.length === 0) {
        return (
            <div className="glass backdrop-blur-xl rounded-[2rem] p-20 text-center border-white/5">
                <p className="text-muted-foreground text-lg">No responses collected yet.</p>
            </div>
        );
    }

    const totalPages = Math.ceil(submissions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentSubmissions = submissions.slice(startIndex, startIndex + itemsPerPage);

    const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    const getDeviceIcon = (device: string) => {
        switch (device) {
            case 'mobile':
                return <Smartphone className="w-4 h-4" />;
            case 'tablet':
                return <Tablet className="w-4 h-4" />;
            case 'desktop':
                return <Laptop className="w-4 h-4" />;
            default:
                return <Laptop className="w-4 h-4 opacity-30" />;
        }
    };

    const isFileUrl = (value: unknown): boolean => {
        if (typeof value !== 'string') return false;
        return value.includes('cloudinary.com') || value.startsWith('http');
    };

    return (
        <div className="glass backdrop-blur-xl rounded-[2rem] border-white/5 overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.3)] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-white/5 flex-wrap gap-4">
                <div className="text-sm text-muted-foreground">
                    Showing <span className="text-white font-medium">{startIndex + 1}</span> to <span className="text-white font-medium">{Math.min(startIndex + itemsPerPage, submissions.length)}</span> of <span className="text-white font-medium">{submissions.length}</span> entries
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Rows per page:</span>
                        <select 
                            value={itemsPerPage} 
                            onChange={handleItemsPerPageChange}
                            className="bg-black/20 border border-white/10 rounded-lg px-2 py-1 text-white focus:outline-none focus:border-purple-500/50"
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="w-8 h-8 border-white/10 bg-white/5 hover:bg-white/10"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="w-8 h-8 border-white/10 bg-white/5 hover:bg-white/10"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
            <ScrollArea className="w-full">
                <div className="min-w-full inline-block align-middle">
                    <table className="min-w-full divide-y divide-white/5">
                        <thead className="bg-white/5 backdrop-blur-md">
                            <tr>
                                <th scope="col" className="px-6 py-5 text-left text-xs font-bold text-muted-foreground uppercase tracking-widest sticky left-0 bg-white/5 backdrop-blur-md z-10">
                                    Submission Time
                                </th>
                                <th scope="col" className="px-6 py-5 text-left text-xs font-bold text-muted-foreground uppercase tracking-widest min-w-[150px]">
                                    Location
                                </th>
                                <th scope="col" className="px-6 py-5 text-left text-xs font-bold text-muted-foreground uppercase tracking-widest min-w-[120px]">
                                    Device
                                </th>
                                {form.fields.map((field: Field) => (
                                    <th key={field.id} scope="col" className="px-6 py-5 text-left text-xs font-bold text-muted-foreground uppercase tracking-widest min-w-[200px]">
                                        {field.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 bg-transparent">
                            {currentSubmissions.map((submission) => (
                                <tr key={submission._id} className="hover:bg-white/5 transition-colors group">
                                    {/* Submission Time */}
                                    <td className="px-6 py-6 whitespace-nowrap text-sm font-medium sticky left-0 bg-black/20 backdrop-blur-md group-hover:bg-white/5 z-10">
                                        <div className="flex flex-col">
                                            <span className="text-white font-semibold">
                                                {format(new Date(submission.submittedAt), 'MMM d, yyyy')}
                                            </span>
                                            <span className="text-muted-foreground text-xs">
                                                {format(new Date(submission.submittedAt), 'HH:mm:ss')}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Location */}
                                    <td className="px-6 py-6 text-sm">
                                        {submission.metadata?.location?.city && submission.metadata?.location?.country ? (
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-purple-400" />
                                                <div className="flex flex-col">
                                                    <span className="text-white font-medium">{submission.metadata.location.city}</span>
                                                    <span className="text-muted-foreground text-xs">{submission.metadata.location.country}</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground/30 italic">Not available</span>
                                        )}
                                    </td>

                                    {/* Device */}
                                    <td className="px-6 py-6 text-sm">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                                                {getDeviceIcon(submission.metadata?.device || 'unknown')}
                                            </div>
                                            <span className="text-white capitalize font-medium">
                                                {submission.metadata?.device || 'Unknown'}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Form Fields */}
                                    {form.fields.map((field: Field) => {
                                        let val = submission.answers[field.id];
                                        let fileUrl: string | null = null;

                                        // Handle location field (address only, no url)
                                        if (field.type === 'location' && val && typeof val === 'object') {
                                            val = (val as { address?: string }).address || 'N/A';
                                        }

                                        // Handle array values
                                        if (Array.isArray(val)) {
                                            val = val.join(', ');
                                        } else if (typeof val === 'object' && val !== null) {
                                            const obj = val as Record<string, unknown>;
                                            // Check url/secure_url FIRST — file uploads store the Cloudinary link here
                                            if (typeof obj.url === 'string') {
                                                fileUrl = obj.url;
                                                val = obj.address || obj.url; // show filename as label, url for button
                                            } else if (typeof obj.secure_url === 'string') {
                                                fileUrl = obj.secure_url;
                                                val = obj.address || obj.secure_url;
                                            } else if (typeof obj.address === 'string') {
                                                // Pure location field — no url stored
                                                val = obj.address;
                                            } else {
                                                val = JSON.stringify(val);
                                            }
                                        }

                                        // Also detect if val itself is a direct file URL string
                                        const isFile = fileUrl !== null || isFileUrl(val);
                                        const viewHref = fileUrl || (isFileUrl(val) ? val as string : null);
                                        const displayVal = val as React.ReactNode;

                                        return (
                                            <td key={field.id} className="px-6 py-6 text-sm">
                                                {val ? (
                                                    isFile ? (
                                                        <div className="flex items-center gap-3">
                                                            <span className="bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 text-foreground truncate max-w-[180px]" title={String(val)}>
                                                                {String(val)}
                                                            </span>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => window.open(viewHref!, '_blank')}
                                                                className="p-2 h-auto rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 transition-all group/preview flex items-center gap-1.5"
                                                            >
                                                                <Eye className="w-4 h-4 text-purple-400 group-hover/preview:scale-110 transition-transform" />
                                                                <span className="text-xs text-purple-400 font-medium">View</span>
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <span className="bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 text-foreground">
                                                            {displayVal}
                                                        </span>
                                                    )
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
