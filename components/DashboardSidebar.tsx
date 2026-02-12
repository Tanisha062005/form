"use client";

import React from 'react';
import {
    Folder,
    FolderOpen,
    ChevronRight,
    LayoutDashboard,
    Settings,
} from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';
import NewFolderModal from './NewFolderModal';
import { cn } from '@/lib/utils';

interface DashboardSidebarProps {
    folders: string[];
    activeFolder: string;
    onFolderSelect: (folder: string) => void;
    onFolderCreated: (folderName: string) => void;
}

function FolderItem({
    name,
    isActive,
    onClick
}: {
    name: string,
    isActive: boolean,
    onClick: () => void
}) {
    const { isOver, setNodeRef } = useDroppable({
        id: `folder-${name}`,
        data: { folderName: name }
    });

    return (
        <div
            ref={setNodeRef}
            onClick={onClick}
            className={cn(
                "group flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer transition-all duration-300",
                isActive ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" : "text-white/60 hover:text-white hover:bg-white/5",
                isOver && "bg-purple-500/40 border-purple-500 scale-[1.02] shadow-[0_0_20px_rgba(147,51,234,0.3)]"
            )}
        >
            {isActive ? <FolderOpen className="w-5 h-5 transition-transform group-hover:scale-110" /> : <Folder className="w-5 h-5 transition-transform group-hover:scale-110" />}
            <span className="font-semibold truncate flex-1">{name}</span>
            {isActive && <ChevronRight className="w-4 h-4 text-purple-400" />}
        </div>
    );
}

export default function DashboardSidebar({
    folders,
    activeFolder,
    onFolderSelect,
    onFolderCreated
}: DashboardSidebarProps) {
    return (
        <aside className="w-80 hidden lg:flex flex-col gap-8 h-[calc(100vh-8rem)] sticky top-32">
            {/* Main Navigation */}
            <div className="space-y-4">
                <p className="text-xs font-black uppercase tracking-[0.2em] text-white/30 ml-4">Main Menu</p>
                <div className="space-y-1">
                    <div
                        onClick={() => onFolderSelect('all')}
                        className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer transition-all",
                            activeFolder === 'all' ? "bg-white/10 text-white shadow-lg" : "text-white/60 hover:text-white hover:bg-white/5"
                        )}
                    >
                        <LayoutDashboard className="w-5 h-5" />
                        <span className="font-bold uppercase tracking-tight">Overview</span>
                    </div>
                </div>
            </div>

            {/* Folders Section */}
            <div className="flex flex-col flex-1 gap-4">
                <div className="flex items-center justify-between px-4">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-white/30">Folders</p>
                    <NewFolderModal onFolderCreated={onFolderCreated} />
                </div>

                <div className="space-y-1 overflow-y-auto pr-2 custom-scrollbar">
                    <FolderItem
                        name="Uncategorized"
                        isActive={activeFolder === 'Uncategorized'}
                        onClick={() => onFolderSelect('Uncategorized')}
                    />
                    {folders.filter(f => f !== 'Uncategorized').map((folder) => (
                        <FolderItem
                            key={folder}
                            name={folder}
                            isActive={activeFolder === folder}
                            onClick={() => onFolderSelect(folder)}
                        />
                    ))}
                </div>
            </div>

            {/* Bottom Section */}
            <div className="pt-6 border-t border-white/5 space-y-4">
                <div className="flex items-center gap-4 px-4 py-3 rounded-2xl text-white/40 hover:text-white cursor-pointer hover:bg-white/5 transition-all">
                    <Settings className="w-5 h-5" />
                    <span className="font-bold">Settings</span>
                </div>
            </div>
        </aside>
    );
}
