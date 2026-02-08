import React from 'react';
import {
    BarChart3,
    FileText,
    Activity,
    Plus,
    LayoutGrid,
    Clock,
    MoreVertical
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import dbConnect from '@/lib/mongodb';
import Form from '@/models/Form';
import Submission from '@/models/Submission';
import { formatDistanceToNow } from 'date-fns';
import CreateFormModal from '@/components/CreateFormModal';

const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-20 px-6 glass rounded-3xl text-center max-w-2xl mx-auto mt-12 animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20">
            <Plus className="w-10 h-10 text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Start your journey</h2>
        <p className="text-muted-foreground mb-8">You haven&apos;t created any forms yet. Create your first form to start collecting responses.</p>
        <CreateFormModal>
            <Button
                className="bg-primary hover:bg-primary/90 text-white px-8 py-6 rounded-xl text-lg font-semibold transition-all hover:scale-105 active:scale-95 animate-pulse"
            >
                Create Your First Form
            </Button>
        </CreateFormModal>
    </div>
);

export default async function DashboardPage() {
    await dbConnect();

    // Fetch real forms
    const formsDocs = await Form.find({}).sort({ updatedAt: -1 }).lean();

    // Fetch counts for each form
    const formsWithCounts = await Promise.all(formsDocs.map(async (f) => {
        const count = await Submission.countDocuments({ formId: f._id });
        return {
            ...JSON.parse(JSON.stringify(f)),
            responses: count
        };
    }));

    const totalForms = formsWithCounts.length;
    const totalResponses = formsWithCounts.reduce((acc, f) => acc + f.responses, 0);
    const activeForms = formsWithCounts.filter(f => f.settings?.isActive).length;

    const stats = [
        { label: 'Total Forms', value: totalForms.toString(), icon: FileText, color: 'text-blue-400' },
        { label: 'Total Responses', value: totalResponses.toLocaleString(), icon: BarChart3, color: 'text-purple-400' },
        { label: 'Active Forms', value: activeForms.toString(), icon: Activity, color: 'text-green-400' },
    ];

    const hasForms = totalForms > 0;

    return (
        <div className="max-w-7xl mx-auto space-y-12">
            {/* Welcome Section */}
            <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold tracking-tight">
                        Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">User 👋</span>
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Manage your forms and track their performance in real-time.
                    </p>
                </div>
                {hasForms && <CreateFormModal />}
            </section>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="glass-card p-6 flex items-center gap-6">
                        <div className={`p-4 rounded-2xl bg-white/5 ${stat.color}`}>
                            <stat.icon className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                            <h3 className="text-3xl font-bold">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Forms Grid */}
            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <LayoutGrid className="w-5 h-5 text-purple-400" />
                        <h2 className="text-2xl font-semibold">Your Forms</h2>
                    </div>
                    <Button variant="ghost" className="text-muted-foreground hover:text-white">
                        View All
                    </Button>
                </div>

                {hasForms ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {formsWithCounts.map((form) => (
                            <div key={form._id} className="glass-card p-6 flex flex-col justify-between min-h-[200px] group">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-xl font-bold group-hover:text-purple-400 transition-colors truncate pr-4">{form.title}</h3>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                                            <MoreVertical className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Badge className={(form.settings?.isActive ?? true) ? 'bg-green-500/20 text-green-400 border-green-500/20' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20'}>
                                            {(form.settings?.isActive ?? true) ? 'Live' : 'Closed'}
                                        </Badge>
                                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {form.updatedAt && !isNaN(new Date(form.updatedAt).getTime())
                                                ? formatDistanceToNow(new Date(form.updatedAt), { addSuffix: true })
                                                : "Recently updated"}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                                    <div>
                                        <p className="text-2xl font-bold">{form.responses}</p>
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Responses</p>
                                    </div>
                                    <Link href={`/dashboard/responses/${form._id}`}>
                                        <Button className="glass bg-white/10 hover:bg-white/20 text-white text-xs px-4 py-2 rounded-xl transition-all">
                                            View Results
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <EmptyState />
                )}
            </section>
        </div>
    );
}
