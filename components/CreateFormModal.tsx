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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CreateFormModal = ({ children }: { children?: React.ReactNode }) => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const router = useRouter();
    const { toast } = useToast();

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        setLoading(true);
        try {
            const res = await fetch('/api/forms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, description }),
            });

            if (!res.ok) throw new Error('Failed to create form');

            const data = await res.json();
            toast({
                title: "Success",
                description: "Form created successfully!",
            });

            setOpen(false);
            router.push(`/builder/${data._id}`);
        } catch {
            toast({
                title: "Error",
                description: "Something went wrong. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button className="group relative flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border-0 shadow-[0_0_15px_rgba(147,51,234,0.3)] transition-all hover:shadow-[0_0_25px_rgba(147,51,234,0.5)]">
                        <Plus className="w-4 h-4" />
                        <span>Create Form</span>
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="glass sm:max-w-[425px] border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Create New Form</DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        Enter a title and description for your new form. You can add fields in the next step.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreate} className="space-y-6 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-sm font-medium">Title *</Label>
                        <Input
                            id="title"
                            placeholder="e.g., Customer Feedback"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="bg-white/5 border-white/10 text-white focus:ring-purple-500 focus:border-purple-500"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                        <Textarea
                            id="description"
                            placeholder="Tell your respondents what this form is about..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="bg-white/5 border-white/10 text-white focus:ring-purple-500 focus:border-purple-500 min-h-[100px]"
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            type="submit"
                            disabled={loading || !title.trim()}
                            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white border-0 py-6"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Start Building"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CreateFormModal;
