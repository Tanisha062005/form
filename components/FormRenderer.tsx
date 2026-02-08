"use client";

import React, { useState, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Upload,
    Loader2,
    CheckCircle2,
    Smartphone,
    Tablet,

    Laptop,
    MapPin,
    Navigation,
} from 'lucide-react';
import useDeviceType from '@/hooks/use-device-type';
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
    logic?: {
        triggerFieldId: string;
        condition: 'equals' | 'not_equals';
        value: string;
    };
    validation?: {
        minChars?: number;
        maxChars?: number;
        exactDigits?: number;
        captureCity?: boolean;
    };
}

interface FormRendererProps {
    form: {
        _id: string;
        title: string;
        description?: string;
        fields: FormField[];
        settings?: {
            singleSubmission?: boolean;
            responseLimit?: number;
            expiryDate?: Date;
        };
    };
    isPreview?: boolean;
}


export function FormRenderer({ form, isPreview = false }: FormRendererProps) {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [locationStates, setLocationStates] = useState<Record<string, { loading: boolean, error: boolean, data?: { lat: number, lng: number, city?: string } }>>({});
    const device = useDeviceType();

    // Dynamic Glass Styles based on Device
    const glassStyles = useMemo(() => {
        if (device === 'mobile') {
            return {
                padding: "p-4",
                blur: "backdrop-blur-md",
                fontSize: "text-sm",
                gap: "gap-4",
                spaceY: "space-y-6"
            };
        }
        return {
            padding: "p-10",
            blur: "backdrop-blur-xl",
            fontSize: "text-base",
            gap: "gap-8",
            spaceY: "space-y-12"
        };
    }, [device]);

    // Dynamic Zod Schema Generation
    const schema = useMemo(() => {
        const shape: any = {};
        form.fields.forEach(field => {
            let fieldSchema: any;

            if (field.type === 'email') {
                fieldSchema = z.string().email("Invalid email format");
            } else if (field.type === 'number') {
                fieldSchema = z.string().refine((val) => !isNaN(Number(val)), "Must be a number");
                if (field.validation?.exactDigits) {
                    fieldSchema = fieldSchema.refine((val: string) => val.length === field.validation?.exactDigits, `Must be exactly ${field.validation.exactDigits} digits`);
                }
            } else if (['text', 'textarea', 'select', 'radio'].includes(field.type)) {
                fieldSchema = z.string();
                if (field.validation?.minChars) {
                    fieldSchema = fieldSchema.min(field.validation.minChars, `Minimum ${field.validation.minChars} characters required`);
                }
                if (field.validation?.maxChars) {
                    fieldSchema = fieldSchema.max(field.validation.maxChars, `Maximum ${field.validation.maxChars} characters allowed`);
                }
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
                    fieldSchema = z.date({ error: "This field is required" }).nullable().refine(val => val !== null, "This field is required");
                } else {
                    fieldSchema = fieldSchema.min(1, "This field is required");
                }
            } else {
                if (field.type === 'date') {
                    fieldSchema = fieldSchema.optional().nullable();
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

    const getLocation = (fieldId: string, captureCity: boolean) => {
        setLocationStates(prev => ({ ...prev, [fieldId]: { loading: true, error: false } }));

        if (!navigator.geolocation) {
            setLocationStates(prev => ({ ...prev, [fieldId]: { loading: false, error: true } }));
            toast.error("Geolocation is not supported by your browser");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                let city = undefined;

                if (captureCity) {
                    try {
                        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                        const data = await res.json();
                        city = data.address?.city || data.address?.town || data.address?.village || "Unknown Location";
                    } catch (e) {
                        console.error("Failed to fetch city", e);
                    }
                }

                setLocationStates(prev => ({
                    ...prev,
                    [fieldId]: {
                        loading: false,
                        error: false,
                        data: { lat: latitude, lng: longitude, city }
                    }
                }));

                // Update form value for validation if needed, though location is handled somewhat separately
                // Ideally we sync this with react-hook-form if it's required
                // For now we just store state to submit alongside
            },
            (error) => {
                console.error("Error getting location", error);
                setLocationStates(prev => ({ ...prev, [fieldId]: { loading: false, error: true } }));
                toast.error("Location permission denied or unavailable");
            }
        );
    };

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
                body: JSON.stringify({
                    answers: data,
                    locationData: Object.keys(locationStates).reduce((acc: any, key) => {
                        if (locationStates[key]?.data) {
                            acc = {
                                latitude: locationStates[key].data?.lat,
                                longitude: locationStates[key].data?.lng,
                                city: locationStates[key].data?.city,
                                timestamp: new Date()
                            };
                        }
                        return acc;
                    }, undefined)
                }),
            });

            if (!res.ok) throw new Error('Failed to submit form');

            // Handle Single Submission Cookie
            if (form.settings?.singleSubmission) {
                document.cookie = `form_submitted_${form._id}=true; max-age=${60 * 60 * 24 * 365}; path=/`;
            }

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
        <form onSubmit={handleSubmit(onSubmit)} className={`${glassStyles.spaceY} relative transition-all duration-500`}>
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
                <AnimatePresence mode="popLayout">
                    {form.fields.map((field) => {
                        // Conditional Logic Check
                        if (field.logic?.triggerFieldId) {
                            const triggerValue = values[field.logic.triggerFieldId];
                            const condition = field.logic.condition;
                            const targetValue = field.logic.value;

                            const isVisible = condition === 'equals'
                                ? triggerValue === targetValue
                                : triggerValue !== targetValue;

                            if (!isVisible) return null;
                        }

                        return (
                            <motion.div
                                key={field.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                className={`glass ${glassStyles.padding} rounded-3xl border border-white/5 space-y-4 transition-all hover:border-white/10 group ${glassStyles.blur}`}
                            >
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
                                            className="glass-input h-14 text-lg rounded-2xl transition-all focus:ring-2 focus:ring-purple-500/20"
                                        />
                                    ) : field.type === 'textarea' ? (
                                        <Textarea
                                            {...register(field.id)}
                                            placeholder={field.placeholder}
                                            className="glass-input min-h-[160px] text-lg rounded-2xl p-6 transition-all focus:ring-2 focus:ring-purple-500/20"
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
                                    ) : field.type === 'location' ? (
                                        <div className="space-y-4">
                                            {locationStates[field.id]?.error ? (
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2 text-red-400 mb-2">
                                                        <XCircle className="w-4 h-4" />
                                                        <span className="text-sm font-medium">Location access denied. Please enter manually.</span>
                                                    </div>
                                                    <Input
                                                        {...register(field.id)}
                                                        placeholder="Enter your location manually..."
                                                        className="glass-input h-14 text-lg rounded-2xl transition-all focus:ring-2 focus:ring-purple-500/20"
                                                    />
                                                </div>
                                            ) : locationStates[field.id]?.data ? (
                                                <div className="flex items-center gap-3 p-4 rounded-2xl glass bg-white/10 border border-white/20">
                                                    <div className="p-3 rounded-full bg-green-500/20">
                                                        <MapPin className="w-6 h-6 text-green-400" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="font-bold text-lg text-white">
                                                            {locationStates[field.id].data?.city || "Location Pinned"}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground font-mono">
                                                            {locationStates[field.id].data?.lat.toFixed(4)}, {locationStates[field.id].data?.lng.toFixed(4)}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        onClick={() => setLocationStates(prev => ({ ...prev, [field.id]: { loading: false, error: false, data: undefined } }))} // Reset
                                                        className="text-white/50 hover:text-white"
                                                    >
                                                        Retry
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button
                                                    type="button"
                                                    disabled={locationStates[field.id]?.loading}
                                                    onClick={() => getLocation(field.id, field.validation?.captureCity || false)}
                                                    className={`w-full h-16 rounded-2xl border border-white/20 hover:bg-white/10 transition-all font-bold text-lg gap-3 ${locationStates[field.id]?.loading ? 'bg-white/5' : 'glass bg-white/5 backdrop-blur-md'}`}
                                                >
                                                    {locationStates[field.id]?.loading ? (
                                                        <>
                                                            <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
                                                            <span className="animate-pulse text-purple-300">Sensing coordinates...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Navigation className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
                                                            Share Current Location
                                                        </>
                                                    )}
                                                </Button>
                                            )}
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
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
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
            {/* Smart Optimization Badge */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="fixed bottom-6 right-6 z-50 pointer-events-none"
            >
                <div className="glass bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
                    <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="text-purple-400"
                    >
                        {device === 'mobile' && <Smartphone className="w-4 h-4" />}
                        {device === 'tablet' && <Tablet className="w-4 h-4" />}
                        {device === 'desktop' && <Laptop className="w-4 h-4" />}
                    </motion.div>
                    <span className="text-xs font-semibold text-white/50">
                        Smart Mode: {device.charAt(0).toUpperCase() + device.slice(1)} Optimized
                    </span>
                </div>
            </motion.div>
        </form >
    );
}

function XCircle({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
    )
}
