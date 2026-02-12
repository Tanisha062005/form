"use client";

import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
    Activity,
    CheckCircle2,
    Power,
    Settings,
    Clock
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Activity {
    _id: string;
    eventType: string;
    description: string;
    timestamp: Date | string;
    metadata?: {
        device?: string;
        [key: string]: unknown;
    };
}

interface FormActivitySidebarProps {
    activities: Activity[];
}

const eventIcons = {
    created: CheckCircle2,
    status_changed: Power,
    response_received: Activity,
    settings_updated: Settings,
};

const eventColors = {
    created: 'text-green-400 bg-green-500/20 border-green-500/30',
    status_changed: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
    response_received: 'text-purple-400 bg-purple-500/20 border-purple-500/30',
    settings_updated: 'text-orange-400 bg-orange-500/20 border-orange-500/30',
};

export default function FormActivitySidebar({ activities }: FormActivitySidebarProps) {
    return (
        <div className="glass backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 space-y-6 h-fit sticky top-24">
            {/* Header */}
            <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-500/30">
                    <Clock className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                    <h3 className="text-lg font-bold">Form Activity</h3>
                    <p className="text-xs text-muted-foreground">Recent events</p>
                </div>
            </div>

            {/* Activity List */}
            <ScrollArea className="h-[600px] pr-4">
                {activities.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground text-sm">No activity yet</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {activities.map((activity, index) => {
                            const Icon = eventIcons[activity.eventType as keyof typeof eventIcons] || Activity;
                            const colorClass = eventColors[activity.eventType as keyof typeof eventColors] || 'text-gray-400 bg-gray-500/20 border-gray-500/30';

                            return (
                                <div
                                    key={activity._id || index}
                                    className="relative pl-8 pb-4 border-l-2 border-white/10 last:border-l-0 last:pb-0"
                                >
                                    {/* Icon */}
                                    <div className={`absolute -left-[17px] top-0 p-2 rounded-lg border ${colorClass}`}>
                                        <Icon className="w-3 h-3" />
                                    </div>

                                    {/* Content */}
                                    <div className="space-y-1">
                                        <p className="text-sm font-semibold text-white">
                                            {activity.description}
                                        </p>
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                                        </p>
                                        {activity.metadata?.device && (
                                            <p className="text-xs text-muted-foreground/70">
                                                Device: {activity.metadata.device}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </ScrollArea>
        </div>
    );
}
