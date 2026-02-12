"use client";

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FolderPlus, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface NewFolderModalProps {
    children?: React.ReactNode;
    onFolderCreated?: (folderName: string) => void;
}

export default function NewFolderModal({ children, onFolderCreated }: NewFolderModalProps) {
    const [open, setOpen] = useState(false);
    const [folderName, setFolderName] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleCreate = async () => {
        if (!folderName.trim()) {
            toast.error("Please enter a folder name");
            return;
        }

        setLoading(true);
        try {
            // Since folders are just dynamic strings in the Form model, 
            // "creating" a folder mostly means adding it to the local UI list 
            // or creating a dummy/initial form in it? 
            // Actually, the user just wants it to be a "filter category".
            // So we can just inform the parent component.

            if (onFolderCreated) {
                onFolderCreated(folderName.trim());
            }

            toast.success(`Folder "${folderName}" created!`);
            setOpen(false);
            setFolderName("");
            router.refresh();
        } catch {
            toast.error("Failed to create folder");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button variant="ghost" className="w-full justify-start gap-3 glass hover:bg-white/10 text-white/70 hover:text-white rounded-xl h-12">
                        <FolderPlus className="w-5 h-5 text-purple-400" />
                        <span>New Folder</span>
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="glass border-white/10 sm:max-w-md bg-[#030014]/80 backdrop-blur-2xl rounded-[2rem]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                        Create New Folder
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-6 pt-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/50 ml-1">Folder Name</label>
                        <Input
                            placeholder="e.g. Marketing, Feedback, Q1 2024"
                            value={folderName}
                            onChange={(e) => setFolderName(e.target.value)}
                            className="h-14 glass bg-white/5 border-white/10 focus:ring-2 focus:ring-purple-500/50 rounded-xl text-lg"
                            autoFocus
                        />
                    </div>
                    <Button
                        onClick={handleCreate}
                        disabled={loading}
                        className="w-full h-14 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl gap-2 text-lg shadow-[0_0_20px_rgba(147,51,234,0.3)] border-0"
                    >
                        {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Create Folder"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
