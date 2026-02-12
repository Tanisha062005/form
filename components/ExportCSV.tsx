"use client";

import React from 'react';
import { Parser } from '@json2csv/plainjs';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Field {
    id: string;
    label: string;
    type: string;
}

interface Form {
    title: string;
    fields: Field[];
}

interface Submission {
    submittedAt: Date;
    metadata?: {
        device?: string;
        location?: {
            city?: string;
            country?: string;
        }
    };
    answers: Record<string, unknown>;
}

interface ExportCSVProps {
    form: Form;
    submissions: Submission[];
}

export default function ExportCSV({ form, submissions }: ExportCSVProps) {
    const handleExport = () => {
        try {
            if (submissions.length === 0) {
                toast.error('No data to export');
                return;
            }

            // Transform submissions into flat CSV format
            const csvData = submissions.map((submission) => {
                const row: Record<string, string | number | null> = {
                    'Submission Time': format(new Date(submission.submittedAt), 'yyyy-MM-dd HH:mm:ss'),
                    'Device': submission.metadata?.device || 'Unknown',
                    'Location (City)': submission.metadata?.location?.city || 'N/A',
                    'Location (Country)': submission.metadata?.location?.country || 'N/A',
                };

                // Add all form field answers
                form.fields.forEach((field) => {
                    let value = submission.answers[field.id];

                    // Handle special field types
                    if (field.type === 'location' && value && typeof value === 'object') {
                        value = (value as { address?: string }).address || 'N/A';
                    } else if (field.type === 'file' && value) {
                        value = value as string; // Keep URL as is
                    } else if (Array.isArray(value)) {
                        value = value.join(', ');
                    } else if (value === null || value === undefined || value === '') {
                        value = 'N/A';
                    }

                    row[field.label] = value as string | number | null;
                });

                return row;
            });

            // Generate CSV using json2csv
            const parser = new Parser();
            const csv = parser.parse(csvData);

            // Create blob and download
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);

            link.setAttribute('href', url);
            link.setAttribute('download', `${form.title.replace(/[^a-z0-9]/gi, '_')}_responses_${format(new Date(), 'yyyy-MM-dd')}.csv`);
            link.style.visibility = 'hidden';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success('CSV exported successfully!');
        } catch (error) {
            console.error('Export error:', error);
            toast.error('Failed to export CSV');
        }
    };

    return (
        <Button
            onClick={handleExport}
            className="glass bg-gradient-to-r from-green-500/20 to-emerald-500/20 hover:from-green-500/30 hover:to-emerald-500/30 border border-green-500/30 text-white px-6 py-3 rounded-xl transition-all hover:scale-105 active:scale-95 gap-2"
        >
            <Download className="w-5 h-5" />
            Export to CSV
        </Button>
    );
}
