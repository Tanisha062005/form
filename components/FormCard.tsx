"use client";

import React from 'react';
import {
    Clock,
    MoreVertical,
    Link as LinkIcon,
    GripHorizontal
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import DeleteFormBtn from './DeleteFormBtn';
import { useDraggable } from '@dnd-kit/core';
import { cn } from '@/lib/utils';

interface FormCardForm {
    _id: string;
    title: string;
    description?: string;
    updatedAt: string;
    responses: number;
    fields: unknown[];
    settings?: {
        status?: 'Draft' | 'Live' | 'Closed';
        isActive?: boolean;
        expiryDate?: string;
        maxResponses?: number;
    };
}

interface FormCardProps {
    form: FormCardForm;
}

export default function FormCard({ form }: FormCardProps) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: form._id,
        data: { formId: form._id }
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: isDragging ? 50 : undefined,
    } : undefined;

    const isActive = form.settings?.isActive ?? true;
    const isExpired = form.settings?.expiryDate ? new Date(form.settings.expiryDate) < new Date() : false;
    const isLimitReached = (form.settings?.maxResponses || 0) > 0 && form.responses >= (form.settings?.maxResponses || 0);

    // Status Logic from Block 3 Task 2
    let status: string = form.settings?.status || 'Draft';
    let statusGlow = "";

    if (status === 'Live') {
        statusGlow = "shadow-[0_0_15px_rgba(34,197,94,0.4)] border-green-500/50 text-green-400";
    } else if (status === 'Draft') {
        statusGlow = "shadow-[0_0_15px_rgba(245,158,11,0.4)] border-amber-500/50 text-amber-400";
    } else if (status === 'Closed' || !isActive || isExpired || isLimitReached) {
        status = (status === 'Closed' || !isActive) ? 'Closed' : isExpired ? 'Expired' : 'Limit Reached';
        statusGlow = "shadow-[0_0_15px_rgba(239,68,68,0.4)] border-red-500/50 text-red-400";
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "glass-card p-6 flex flex-col justify-between min-h-[220px] group transition-all duration-300 hover:border-white/20 relative",
                isDragging && "opacity-50 scale-95"
            )}
        >
            {/* Drag Handle */}
            <div
                {...listeners}
                {...attributes}
                className="absolute top-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 cursor-grab active:cursor-grabbing p-1 hover:bg-white/5 rounded-md transition-all"
            >
                <GripHorizontal className="w-4 h-4 text-white/20" />
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-start">
                    <div className="space-y-1 flex-1 min-w-0">
                        <h3 className="text-xl font-bold group-hover:text-purple-400 transition-colors truncate pr-4 uppercase tracking-tight">
                            {form.title}
                        </h3>
                        <p className="text-sm text-white/40 line-clamp-1">{form.description || "No description provided"}</p>
                    </div>
                    <div className="flex items-center gap-1">
                        <Link href={`/builder/${form._id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-white/30 hover:text-white hover:bg-white/5">
                                <MoreVertical className="w-4 h-4" />
                            </Button>
                        </Link>
                        <DeleteFormBtn id={form._id} />
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <Badge className={cn("bg-transparent border px-3 py-1 rounded-full text-[0.7rem] font-black uppercase tracking-widest", statusGlow)}>
                        {status}
                    </Badge>
                    <span className="text-[0.7rem] text-white/30 font-bold uppercase tracking-widest flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {form.updatedAt ? formatDistanceToNow(new Date(form.updatedAt), { addSuffix: true }) : "Recent"}
                    </span>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div>
                        <p className="text-2xl font-black text-white">{form.responses}</p>
                        <p className="text-[0.6rem] text-white/30 font-bold uppercase tracking-widest">Responses</p>
                    </div>
                    <div>
                        <p className="text-2xl font-black text-white/40">{form.fields?.length || 0}</p>
                        <p className="text-[0.6rem] text-white/30 font-bold uppercase tracking-widest">Fields</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Link href={`/f/${form._id}`} target="_blank">
                        <Button variant="ghost" size="icon" className="h-10 w-10 text-white/30 hover:text-blue-400 hover:bg-blue-400/10 rounded-xl">
                            <LinkIcon className="w-5 h-5" />
                        </Button>
                    </Link>
                    <Link href={`/dashboard/responses/${form._id}`}>
                        <Button className="glass bg-white/5 hover:bg-purple-500/20 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all border border-white/5 hover:border-purple-500/50">
                            Results
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
