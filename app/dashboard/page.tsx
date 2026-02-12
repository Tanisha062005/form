import {
    Plus,
    BarChart3,
    FileText,
    Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import dbConnect from '@/lib/mongodb';
import Form from '@/models/Form';
import Submission from '@/models/Submission';
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

import DashboardClient from '@/components/DashboardClient';

interface DashboardForm {
    _id: string;
    title: string;
    description?: string;
    updatedAt: string;
    settings?: {
        isActive?: boolean;
    };
}

export default async function DashboardPage() {
    await dbConnect();

    // Fetch real forms
    const formsDocs = (await Form.find({}).sort({ updatedAt: -1 }).lean()) as unknown as DashboardForm[];

    // Fetch counts for each form
    const formsWithCounts = await Promise.all(formsDocs.map(async (f: DashboardForm) => {
        const count = await Submission.countDocuments({ formId: f._id });
        return {
            ...JSON.parse(JSON.stringify(f)),
            responses: count
        };
    }));

    const totalForms = formsWithCounts.length;
    const totalResponses = formsWithCounts.reduce((acc: number, f: { responses: number }) => acc + f.responses, 0);
    const activeForms = formsWithCounts.filter((f: DashboardForm) => f.settings?.isActive).length;

    const stats = [
        { label: 'Total Forms', value: totalForms.toString(), icon: FileText, color: 'text-blue-400' },
        { label: 'Total Responses', value: totalResponses.toLocaleString(), icon: BarChart3, color: 'text-purple-400' },
        { label: 'Active Forms', value: activeForms.toString(), icon: Activity, color: 'text-green-400' },
    ];

    const hasForms = totalForms > 0;

    return (
        <div className="max-w-[1600px] mx-auto space-y-12">
            {/* Welcome Section */}
            <section className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
                <div className="space-y-3">
                    <h1 className="text-5xl font-black tracking-tighter">
                        Dashboard <span className="text-white/20 ml-2">v2</span>
                    </h1>
                    <p className="text-white/40 text-xl font-medium">
                        Welcome back, <span className="text-white font-bold">User 👋</span>
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <CreateFormModal>
                        <Button className="h-16 px-8 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black rounded-2xl gap-3 text-lg border-0 shadow-[0_0_30px_rgba(147,51,234,0.3)] transition-all hover:scale-[1.05]">
                            <Plus className="w-6 h-6" />
                            Create Form
                        </Button>
                    </CreateFormModal>
                </div>
            </section>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
                {stats.map((stat, index) => (
                    <div key={index} className="glass-card p-8 flex items-center justify-between group overflow-hidden relative">
                        {/* Background Pulse */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-purple-500/10 transition-colors" />

                        <div className="space-y-2 relative z-10">
                            <p className="text-xs font-black uppercase tracking-[0.2em] text-white/30">{stat.label}</p>
                            <h3 className="text-5xl font-black text-white">{stat.value}</h3>
                        </div>
                        <div className={`p-4 rounded-[2rem] bg-white/5 border border-white/5 group-hover:border-white/10 transition-all ${stat.color} relative z-10`}>
                            <stat.icon className="w-8 h-8" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Area with Sidebar */}
            <section className="px-4">
                {hasForms ? (
                    <DashboardClient initialForms={formsWithCounts} />
                ) : (
                    <EmptyState />
                )}
            </section>
        </div>
    );
}
