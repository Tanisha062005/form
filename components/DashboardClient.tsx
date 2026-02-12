"use client";

import React, { useState, useMemo } from 'react';
import {
    LayoutGrid,
    Grid2X2,
    List
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DndContext,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import CreateFormModal from './CreateFormModal';
import DashboardSidebar from './DashboardSidebar';
import SearchSortBar from './SearchSortBar';
import FormCard from './FormCard';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface Form {
    _id: string;
    title: string;
    description?: string;
    updatedAt: string;
    responses: number;
    fields: unknown[];
    folderName?: string;
    settings?: {
        status?: 'Draft' | 'Live' | 'Closed';
        isActive?: boolean;
        expiryDate?: string;
        maxResponses?: number;
    };
}

interface DashboardClientProps {
    initialForms: Form[];
}

export default function DashboardClient({ initialForms }: DashboardClientProps) {
    const [forms, setForms] = useState(initialForms);
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("newest");
    const [activeFolder, setActiveFolder] = useState("all");
    const router = useRouter();

    // Folders list derived from forms
    const folders = useMemo(() => {
        const uniqueFolders = Array.from(new Set(forms.map(f => f.folderName || 'Uncategorized')));
        return uniqueFolders;
    }, [forms]);

    // Sensors for DnD
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Filtering & Sorting Logic
    const filteredForms = useMemo(() => {
        let result = [...forms];

        // Folder Filter
        if (activeFolder !== 'all') {
            result = result.filter(f => (f.folderName || 'Uncategorized') === activeFolder);
        }

        // Search Filter
        if (search) {
            const query = search.toLowerCase();
            result = result.filter(f =>
                f.title.toLowerCase().includes(query) ||
                f.description?.toLowerCase().includes(query)
            );
        }

        // Sorting
        result.sort((a, b) => {
            if (sortBy === 'newest') return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
            if (sortBy === 'oldest') return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
            if (sortBy === 'responses') return b.responses - a.responses;
            if (sortBy === 'status') return (a.settings?.status || "").localeCompare(b.settings?.status || "");
            return 0;
        });

        return result;
    }, [forms, search, sortBy, activeFolder]);

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && over.id.toString().startsWith('folder-')) {
            const formId = active.id;
            const folderName = over.data.current?.folderName;

            if (folderName) {
                // Optimistic Update
                setForms(prev => prev.map(f => f._id === formId ? { ...f, folderName } : f));

                try {
                    const res = await fetch(`/api/forms/${formId}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ folderName })
                    });

                    if (!res.ok) throw new Error("Failed to update folder");
                    toast.success(`Moved to ${folderName}`);
                } catch {
                    toast.error("Failed to move form");
                    // Revert? (Optional: fetch again)
                    router.refresh();
                }
            }
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragEnd={handleDragEnd}
        >
            <div className="flex gap-12 pt-8">
                {/* Sidebar */}
                <DashboardSidebar
                    folders={folders}
                    activeFolder={activeFolder}
                    onFolderSelect={setActiveFolder}
                    onFolderCreated={(name) => {
                        // Creating a folder doesn't need an API call immediately 
                        // as it's derived from form labels.
                        setActiveFolder(name);
                    }}
                />

                {/* Main Content */}
                <div className="flex-1 space-y-12">
                    <div className="space-y-8">
                        <div className="flex items-center justify-between gap-4">
                            <h2 className="text-3xl font-black uppercase tracking-tighter text-white">
                                {activeFolder === 'all' ? 'All Forms' : activeFolder}
                                <span className="ml-4 text-sm font-bold text-white/20 bg-white/5 px-3 py-1 rounded-full">{filteredForms.length}</span>
                            </h2>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" className="glass h-10 w-10 text-white/40 hover:text-white rounded-xl">
                                    <Grid2X2 className="w-5 h-5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-10 w-10 text-white/20 hover:text-white rounded-xl">
                                    <List className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>

                        <SearchSortBar
                            search={search}
                            onSearchChange={setSearch}
                            sortBy={sortBy}
                            onSortChange={setSortBy}
                        />
                    </div>

                    {filteredForms.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3 gap-8 pb-20">
                            {filteredForms.map((form) => (
                                <FormCard key={form._id} form={form} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-32 glass rounded-[3rem] border-white/5 text-center px-6">
                            <div className="w-24 h-24 bg-gradient-to-br from-purple-500/20 to-indigo-600/20 rounded-full flex items-center justify-center mb-8 border border-white/10">
                                <LayoutGrid className="w-10 h-10 text-purple-400 opacity-50" />
                            </div>
                            <h3 className="text-2xl font-black text-white uppercase tracking-tight">No Forms Found</h3>
                            <p className="text-white/40 max-w-xs mx-auto mt-2 font-medium">
                                Try adjusting your search or filters to see your forms.
                            </p>
                            <div className="mt-8">
                                <CreateFormModal>
                                    <Button className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-8 h-14 rounded-2xl font-bold transition-all">
                                        Create New Form
                                    </Button>
                                </CreateFormModal>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DndContext>
    );
}
