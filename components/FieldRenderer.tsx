"use client";

import React from 'react';
import {
    ChevronDown,
    CircleDot,
    CheckSquare,
    Upload
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/DatePicker';

export interface FormField {
    id: string;
    type: string;
    label: string;
    placeholder?: string;
    helpText?: string;
    required: boolean;
    options?: string[];
    logic?: unknown;
}

interface FieldRendererProps {
    field: FormField;
    selectedDate?: Date;
    onDateChange?: (date: Date | undefined) => void;
}

export function FieldRenderer({ field, selectedDate, onDateChange }: FieldRendererProps) {
    switch (field.type) {
        case 'text':
        case 'email':
        case 'number':
            return <Input placeholder={field.placeholder} disabled className="bg-white/5 border-white/10" />;

        case 'textarea':
            return <Textarea placeholder={field.placeholder} disabled className="bg-white/5 border-white/10" />;

        case 'select':
            return (
                <div className="w-full p-2 rounded-md bg-white/5 border border-white/10 text-muted-foreground flex justify-between items-center text-sm">
                    <span>{field.placeholder || "Select an option..."}</span>
                    <ChevronDown className="w-4 h-4" />
                </div>
            );

        case 'radio':
        case 'checkbox':
            return (
                <div className="grid grid-cols-2 gap-4">
                    {field.options?.map((opt, i) => (
                        <div key={i} className="flex items-center gap-2">
                            {field.type === 'radio' ? <CircleDot className="w-4 h-4 opacity-50" /> : <CheckSquare className="w-4 h-4 opacity-50" />}
                            <span className="text-sm">{opt}</span>
                        </div>
                    ))}
                </div>
            );

        case 'date':
            return (
                <DatePicker
                    date={selectedDate}
                    onChange={onDateChange}
                    placeholder={field.placeholder || "Pick a date"}
                />
            );

        case 'file':
            return (
                <div className="w-full p-8 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center gap-2 text-muted-foreground">
                    <Upload className="w-8 h-8 opacity-20" />
                    <span className="text-sm">Click to upload file</span>
                </div>
            );

        default:
            return null;
    }
}
