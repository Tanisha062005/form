"use client";

import React, { useState } from 'react';
import {
    ArrowLeft,
    Download,
    Copy,
    Check,
    QrCode,
    ExternalLink,
    Link as LinkIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { QRCodeSVG } from 'qrcode.react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

interface Field {
    id: string;
    label: string;
    type: string;
}

interface Form {
    _id: string;
    title: string;
    settings?: {
        isActive?: boolean;
    };
    fields: Field[];
}

interface Submission {
    _id: string;
    submittedAt: string | Date;
    answers: Record<string, unknown>;
}

export default function ResponseHeader({ form, submissions }: { form: Form, submissions: Submission[] }) {
    const router = useRouter();
    const { toast } = useToast();
    const [isActive, setIsActive] = useState(form.settings?.isActive ?? true);
    const [isCopied, setIsCopied] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);

    const publicUrl = typeof window !== 'undefined' ? `${window.location.origin}/f/${form._id}` : '';

    const handleToggleActive = async (checked: boolean) => {
        setIsUpdating(true);
        try {
            const res = await fetch(`/api/forms/${form._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ settings: { ...form.settings, isActive: checked } }),
            });
            if (!res.ok) throw new Error('Failed to update status');
            setIsActive(checked);
            toast({
                title: "Status Updated",
                description: `Form is now ${checked ? 'Active' : 'Inactive'}.`,
            });
        } catch {
            toast({
                title: "Error",
                description: "Failed to update form status.",
                variant: "destructive",
            });
        } finally {
            setIsUpdating(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(publicUrl);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
        toast({
            title: "Copied!",
            description: "Live form link copied to clipboard.",
        });
    };

    const downloadCSV = () => {
        if (submissions.length === 0) {
            toast({
                title: "No data",
                description: "There are no submissions to export.",
                variant: "destructive"
            });
            return;
        }

        try {
            // Headers
            const headers = ['Submission ID', 'Submitted At', ...form.fields.map((f: Field) => `"${f.label.replace(/"/g, '""')}"`)];

            // Rows
            const rows = submissions.map(sub => {
                const values = [
                    sub._id,
                    new Date(sub.submittedAt).toLocaleString(),
                    ...form.fields.map((field: Field) => {
                        let val = sub.answers[field.id];
                        if (Array.isArray(val)) val = val.join('; ');
                        return `"${(val as string | number | boolean | null | undefined ?? '').toString().replace(/"/g, '""')}"`;
                    })
                ];
                return values.join(',');
            });

            const csvContent = [headers.join(','), ...rows].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${form.title.replace(/\s+/g, '_')}_responses.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast({
                title: "Success",
                description: "CSV exported successfully.",
            });
        } catch (err) {
            console.error(err);
            toast({
                title: "Error",
                description: "Failed to generate CSV.",
                variant: "destructive"
            });
        }
    };

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/5">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => router.push('/dashboard')} className="glass border-white/5 h-12 px-5 rounded-2xl gap-2 hover:bg-white/10 transition-all">
                    <ArrowLeft className="w-5 h-5" />
                    <span className="font-bold">Dashboard</span>
                </Button>
                <div>
                    <h1 className="text-3xl font-black">{form.title}</h1>
                    <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-muted-foreground">Responses & Analytics</span>
                        <div className="w-1 h-1 rounded-full bg-white/20" />
                        <span className="text-sm text-muted-foreground">{submissions.length} total</span>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-3 glass px-4 py-2 rounded-2xl border-white/5 mr-2">
                    <Label htmlFor="active-toggle" className="text-sm font-semibold cursor-pointer">
                        {isActive ? 'Live' : 'Closed'}
                    </Label>
                    <Switch
                        id="active-toggle"
                        checked={isActive}
                        onCheckedChange={handleToggleActive}
                        disabled={isUpdating}
                    />
                </div>

                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="ghost" className="glass border-white/5 gap-2 h-12 px-5 rounded-2xl hover:bg-white/10 transition-all">
                            <QrCode className="w-5 h-5 text-purple-400" />
                            QR Code
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="glass border-white/10 max-w-sm rounded-[2.5rem] p-10">
                        <DialogHeader className="space-y-4 mb-6">
                            <DialogTitle className="text-2xl font-black text-center">Share Form</DialogTitle>
                            <DialogDescription className="text-center text-muted-foreground">
                                Scan this QR code to open the form directly on your mobile device.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="bg-white p-6 rounded-3xl mx-auto shadow-2xl shadow-purple-500/20">
                            <QRCodeSVG value={publicUrl} size={200} />
                        </div>
                        <div className="mt-8 space-y-3">
                            <Button onClick={copyToClipboard} className="w-full h-14 rounded-2xl bg-purple-600 hover:bg-purple-500 font-bold gap-2">
                                {isCopied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                Copy Live Link
                            </Button>
                            <Button variant="ghost" onClick={() => window.open(publicUrl, '_blank')} className="w-full h-14 rounded-2xl glass border-white/5 font-bold gap-2">
                                <ExternalLink className="w-5 h-5" />
                                Open Form
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>

                <Button variant="ghost" onClick={copyToClipboard} className="glass border-white/5 gap-2 h-12 px-5 rounded-2xl hover:bg-white/10 transition-all">
                    {isCopied ? <Check className="w-5 h-5 text-green-400" /> : <LinkIcon className="w-5 h-5 text-blue-400" />}
                    Copy Link
                </Button>

                <Button onClick={downloadCSV} className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 border-0 h-12 px-6 rounded-2xl font-bold gap-2 shadow-lg shadow-purple-500/20 transition-all hover:scale-105 active:scale-95">
                    <Download className="w-5 h-5" />
                    Download CSV
                </Button>
            </div>
        </div>
    );
}
