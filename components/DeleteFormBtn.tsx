"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DeleteFormBtnProps {
    id: string;
}

const DeleteFormBtn: React.FC<DeleteFormBtnProps> = ({ id }) => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const handleDelete = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/forms/${id}`, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error('Failed to delete form');

            toast({
                title: "Success",
                description: "Form deleted successfully!",
            });

            setOpen(false);
            router.refresh();
        } catch {
            toast({
                title: "Error",
                description: "Failed to delete form. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="glass sm:max-w-[425px] border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Delete Form?</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Are you sure you want to delete this form? This action cannot be undone and all collected responses will be lost.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button
                        variant="ghost"
                        onClick={() => setOpen(false)}
                        className="hover:bg-white/10 text-white"
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDelete}
                        className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/20"
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default DeleteFormBtn;
