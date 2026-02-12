import React from 'react';
import dbConnect from '@/lib/mongodb';
import Form from '@/models/Form';
import Submission from '@/models/Submission';
import FormActivity from '@/models/FormActivity';
import { notFound } from 'next/navigation';
import {
    BarChart3,
    Table as TableIcon
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import ResponseHeader from '@/components/ResponseHeader';
import SubmissionsTable from '@/components/SubmissionsTable';
import AnalyticsCharts from '@/components/AnalyticsCharts';
import ExportCSV from '@/components/ExportCSV';
import FormActivitySidebar from '@/components/FormActivitySidebar';

export default async function ResponsesPage({ params }: { params: { id: string } }) {
    await dbConnect();

    // Fetch form and submissions
    const formDoc = await Form.findById(params.id).lean();
    if (!formDoc) return notFound();

    const submissionsDocs = await Submission.find({ formId: params.id }).sort({ submittedAt: -1 }).lean();

    // Fetch activity logs
    const activitiesDocs = await FormActivity.find({ formId: params.id }).sort({ timestamp: -1 }).limit(50).lean();

    // Serialize data for client components
    const form = JSON.parse(JSON.stringify(formDoc));
    const submissions = JSON.parse(JSON.stringify(submissionsDocs));
    const activities = JSON.parse(JSON.stringify(activitiesDocs));

    const lastSubmission = submissions.length > 0 ? new Date(submissions[0].submittedAt) : null;

    return (
        <div className="max-w-[1800px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="grid grid-cols-1 xl:grid-cols-[1fr_350px] gap-8">
                {/* Main Content */}
                <div className="space-y-12">
                    {/* Header with Actions & QR */}
                    <ResponseHeader form={form} submissions={submissions} />

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="glass p-8 rounded-[2rem] border-white/5 relative overflow-hidden group">
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all duration-500" />
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total Responses</p>
                            <h3 className="text-5xl font-black mt-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/40">
                                {submissions.length}
                            </h3>
                        </div>

                        <div className="glass p-8 rounded-[2rem] border-white/5 relative overflow-hidden group">
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all duration-500" />
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Last Submission</p>
                            <h3 className="text-2xl font-bold mt-4">
                                {lastSubmission ? formatDistanceToNow(lastSubmission, { addSuffix: true }) : 'No responses yet'}
                            </h3>
                        </div>

                        <div className="glass p-8 rounded-[2rem] border-white/5 relative overflow-hidden group">
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition-all duration-500" />
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Form Status</p>
                            <div className="flex items-center gap-3 mt-4">
                                <div className={`w-3 h-3 rounded-full ${form.settings?.isActive ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)] animate-pulse' : 'bg-red-500'}`} />
                                <h3 className="text-xl font-bold">{form.settings?.isActive ? 'Accepting Responses' : 'Closed'}</h3>
                            </div>
                        </div>
                    </div>

                    {/* Analytics Section */}
                    <section className="space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 flex items-center justify-center border border-purple-500/20">
                                <BarChart3 className="w-6 h-6 text-purple-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black">Visual Analytics</h2>
                                <p className="text-sm text-muted-foreground">Automated insights from your collected data</p>
                            </div>
                        </div>
                        <AnalyticsCharts form={form} submissions={submissions} />
                    </section>

                    {/* Submissions Table Section */}
                    <section className="space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center border border-blue-500/20">
                                    <TableIcon className="w-6 h-6 text-blue-400" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black">Response Log</h2>
                                    <p className="text-sm text-muted-foreground">Browse and manage individual responses</p>
                                </div>
                            </div>
                            <ExportCSV form={form} submissions={submissions} />
                        </div>
                        <SubmissionsTable form={form} submissions={submissions} />
                    </section>
                </div>

                {/* Activity Sidebar */}
                <div className="xl:block hidden">
                    <FormActivitySidebar activities={activities} />
                </div>
            </div>

            {/* Mobile Activity Section */}
            <div className="xl:hidden mt-12">
                <FormActivitySidebar activities={activities} />
            </div>
        </div>
    );
}
