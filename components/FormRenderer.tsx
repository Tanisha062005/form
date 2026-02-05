"use client";

import React, { useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Upload,
    Loader2,
    CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/DatePicker';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface FormField {
    id: string;
    type: string;
    label: string;
    placeholder?: string;
    helpText?: string;
    required: boolean;
    options?: string[];
}

interface FormRendererProps {
    form: {
        _id: string;
        title: string;
        description?: string;
        fields: FormField[];
    };
    isPreview?: boolean;
}

export function FormRenderer({ form, isPreview = false }: FormRendererProps) {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);

    // Dynamic Zod Schema Generation
    const schema = useMemo(() => {
        const shape: any = {};
        form.fields.forEach(field => {
            let fieldSchema: any;

            if (field.type === 'email') {
                fieldSchema = z.string().email("Invalid email format");
            } else if (field.type === 'number') {
                fieldSchema = z.string().refine((val) => !isNaN(Number(val)), "Must be a number");
            } else if (['text', 'textarea', 'select', 'radio'].includes(field.type)) {
                fieldSchema = z.string();
            } else if (field.type === 'checkbox') {
                fieldSchema = z.array(z.string());
            } else if (field.type === 'date') {
                fieldSchema = z.date().nullable();
            } else {
                fieldSchema = z.any();
            }

            if (field.required) {
                if (field.type === 'checkbox') {
                    fieldSchema = fieldSchema.min(1, "Please select at least one option");
                } else if (field.type === 'date') {
                    fieldSchema = z.date({ error: "This field is required" });
                } else {
                    fieldSchema = fieldSchema.min(1, "This field is required");
                }
            } else {
                if (field.type === 'date') {
                    fieldSchema = fieldSchema.optional();
                } else {
                    fieldSchema = fieldSchema.optional().or(z.literal("")).or(z.null());
                }
            }

            shape[field.id] = fieldSchema;
        });
        return z.object(shape);
    }, [form.fields]);

    const {
        register,
        handleSubmit,
        control,
        watch,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(schema),
        defaultValues: form.fields.reduce((acc: any, field) => {
            acc[field.id] = field.type === 'checkbox' ? [] : field.type === 'date' ? null : "";
            return acc;
        }, {}),
    });

    const values = watch();

    // Progress calculation
    const progress = useMemo(() => {
        const requiredFields = form.fields.filter(f => f.required);
        if (requiredFields.length === 0) return 100;

        const completedRequired = requiredFields.filter(field => {
            const val = values[field.id];
            if (Array.isArray(val)) return val.length > 0;
            if (val instanceof Date) return true;
            return !!val;
        }).length;

        return Math.round((completedRequired / requiredFields.length) * 100);
    }, [form.fields, values]);

    const onSubmit = async (data: any) => {
        if (isPreview) {
            toast.error("Submissions are disabled in preview mode");
            return;
        }
        setSubmitting(true);
        try {
            const res = await fetch(`/api/f/${form._id}/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answers: data }),
            });

            if (!res.ok) throw new Error('Failed to submit form');

            toast.success('Form submitted successfully!');
            router.push(`/f/${form._id}/success`);
        } catch (error) {
            toast.error('Something went wrong. Please try again.');
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-12 relative">
            {/* Sticky Progress Bar */}
            <div className="sticky top-24 z-50 w-full mb-12">
                <div className="glass backdrop-blur-xl border border-white/10 p-4 rounded-2xl flex items-center gap-4 transition-all duration-500">
                    <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ type: "spring", stiffness: 50 }}
                        />
                    </div>
                    <span className="text-sm font-bold text-purple-300 min-w-[3rem]">{progress}%</span>
                </div>
            </div>

            {/* Form Header */}
            <div className="space-y-4">
                <h1 className="text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/40">
                    {form.title}
                </h1>
                {form.description && (
                    <p className="text-xl text-muted-foreground leading-relaxed">
                        {form.description}
                    </p>
                )}
            </div>

            {/* Form Fields */}
            <div className="space-y-8">
                {form.fields.map((field) => (
                    <div key={field.id} className="glass p-8 rounded-3xl border border-white/5 space-y-4 transition-all hover:border-white/10 group">
                        <div className="space-y-1">
                            <Label className="text-lg font-bold flex items-center gap-2">
                                {field.label}
                                {field.required && <span className="text-red-500">*</span>}
                            </Label>
                            {field.helpText && <p className="text-sm text-muted-foreground italic font-medium opacity-70">{field.helpText}</p>}
                        </div>

                        <div className="pt-2">
                            {field.type === 'text' || field.type === 'email' || field.type === 'number' ? (
                                <Input
                                    {...register(field.id)}
                                    placeholder={field.placeholder}
                                    className="glass-input h-14 text-lg rounded-2xl"
                                />
                            ) : field.type === 'textarea' ? (
                                <Textarea
                                    {...register(field.id)}
                                    placeholder={field.placeholder}
                                    className="glass-input min-h-[160px] text-lg rounded-2xl p-6"
                                />
                            ) : field.type === 'select' ? (
                                <select
                                    {...register(field.id)}
                                    className="w-full glass border border-white/10 bg-white/5 h-14 rounded-2xl px-4 appearance-none outline-none focus:border-purple-500 transition-all text-lg"
                                >
                                    <option value="" className="bg-[#030014]">{field.placeholder || 'Select an option'}</option>
                                    {field.options?.map(opt => (
                                        <option key={opt} value={opt} className="bg-[#030014]">{opt}</option>
                                    ))}
                                </select>
                            ) : field.type === 'radio' ? (
                                <div className="space-y-3">
                                    {field.options?.map(opt => (
                                        <label key={opt} className="flex items-center gap-4 p-4 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all cursor-pointer group/opt">
                                            <input
                                                {...register(field.id)}
                                                type="radio"
                                                value={opt}
                                                className="w-5 h-5 accent-purple-500"
                                            />
                                            <span className="text-lg font-medium group-hover/opt:text-purple-300 transition-colors">{opt}</span>
                                        </label>
                                    ))}
                                </div>
                            ) : field.type === 'checkbox' ? (
                                <div className="space-y-3">
                                    {field.options?.map(opt => (
                                        <label key={opt} className="flex items-center gap-4 p-4 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all cursor-pointer group/opt">
                                            <input
                                                {...register(field.id)}
                                                type="checkbox"
                                                value={opt}
                                                className="w-5 h-5 accent-purple-500 rounded"
                                            />
                                            <span className="text-lg font-medium group-hover/opt:text-purple-300 transition-colors">{opt}</span>
                                        </label>
                                    ))}
                                </div>
                            ) : field.type === 'date' ? (
                                <Controller
                                    name={field.id}
                                    control={control}
                                    render={({ field: { value, onChange } }) => (
                                        <DatePicker
                                            date={value}
                                            onChange={onChange}
                                            placeholder={field.placeholder}
                                        />
                                    )}
                                />
                            ) : field.type === 'file' ? (
                                <div className="w-full p-12 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center gap-4 text-muted-foreground hover:border-purple-500/50 hover:bg-purple-500/5 transition-all cursor-pointer">
                                    <Upload className="w-12 h-12 opacity-30" />
                                    <span className="text-lg font-semibold">Click to upload file</span>
                                </div>
                            ) : null}

                            <AnimatePresence>
                                {errors[field.id] && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="text-pink-500 text-sm font-semibold mt-3 ml-2 flex items-center gap-2"
                                    >
                                        <XCircle className="w-4 h-4" />
                                        {errors[field.id]?.message as string}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                ))}
            </div>

            {/* Submit Button */}
            <div className="pt-12">
                <Button
                    type="submit"
                    disabled={submitting || isPreview}
                    className="w-full h-20 text-2xl font-black rounded-3xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-[0_0_40px_rgba(147,51,234,0.3)] transition-all hover:scale-[1.02] active:scale-[0.98] border-0 gap-4"
                >
                    {submitting ? (
                        <>
                            <Loader2 className="w-8 h-8 animate-spin" />
                            Submitting...
                        </>
                    ) : (
                        <>
                            <CheckCircle2 className="w-8 h-8" />
                            {isPreview ? "Submit Response (Disabled)" : "Submit Response"}
                        </>
                    )}
                </Button>
            </div>
        </form>
    );
}

function XCircle({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
    )
}
