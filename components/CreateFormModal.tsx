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
import { Plus, Loader2, Sparkles, PenLine } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const CreateFormModal = ({ children }: { children?: React.ReactNode }) => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [aiPrompt, setAiPrompt] = useState('');
    const [mode, setMode] = useState<'manual' | 'ai'>('manual');
    const router = useRouter();
    const { toast } = useToast();

    const handleCreate = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        
        if (mode === 'manual' && !title.trim()) return;
        if (mode === 'ai' && !aiPrompt.trim()) return;

        setLoading(true);
        try {
            let formData = { title, description, fields: [] };

            if (mode === 'ai') {
                toast({
                    title: "Generating with AI...",
                    description: "Please wait while we create your form.",
                });
                
                const aiRes = await fetch('/api/forms/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt: aiPrompt }),
                });

                if (!aiRes.ok) throw new Error('Failed to generate form with AI');
                const generatedData = await aiRes.json();
                formData = {
                    title: generatedData.title || 'AI Generated Form',
                    description: generatedData.description || '',
                    fields: generatedData.fields || []
                };
            }

            const res = await fetch('/api/forms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) throw new Error('Failed to create form');

            const data = await res.json();
            toast({
                title: "Success",
                description: mode === 'ai' ? "AI Form generated successfully!" : "Form created successfully!",
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
                        Choose how you want to build your new form.
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={mode} onValueChange={(v) => setMode(v as 'manual' | 'ai')} className="w-full mt-4">
                    <TabsList className="grid w-full grid-cols-2 bg-white/5 border border-white/10 p-1 rounded-xl mb-4">
                        <TabsTrigger value="manual" className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white">
                            <PenLine className="w-4 h-4 mr-2" /> Manual
                        </TabsTrigger>
                        <TabsTrigger value="ai" className="rounded-lg data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300">
                            <Sparkles className="w-4 h-4 mr-2" /> Generate with AI
                        </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="manual" className="space-y-6 mt-0">
                        <form onSubmit={handleCreate} className="space-y-6 py-2">
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
                    </TabsContent>
                    
                    <TabsContent value="ai" className="space-y-6 mt-0">
                        <div className="space-y-6 py-2">
                            <div className="space-y-2">
                                <Label htmlFor="prompt" className="text-sm font-medium">What kind of form do you need?</Label>
                                <Textarea
                                    id="prompt"
                                    placeholder="e.g. Create a customer satisfaction survey with rating questions and open feedback..."
                                    value={aiPrompt}
                                    onChange={(e) => setAiPrompt(e.target.value)}
                                    className="bg-purple-500/5 border-purple-500/20 text-white focus:ring-purple-500 focus:border-purple-500 min-h-[140px]"
                                />
                            </div>
                            <DialogFooter>
                                <Button
                                    onClick={() => handleCreate()}
                                    disabled={loading || !aiPrompt.trim()}
                                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white border-0 py-6 shadow-[0_0_15px_rgba(236,72,153,0.3)]"
                                >
                                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Sparkles className="w-4 h-4 mr-2" /> Generate Form</>}
                                </Button>
                            </DialogFooter>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
};

export default CreateFormModal;
