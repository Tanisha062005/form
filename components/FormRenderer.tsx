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
    const [locationStates, setLocationStates] = useState<Record<string, {
        loading: boolean,
        error: boolean,
        mode?: 'auto' | 'manual',
        data?: {
            address: string,
            lat?: number,
            lng?: number,
            method: 'auto' | 'manual',
            timestamp: Date
        }
    }>>({});
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
        const shape: Record<string, z.ZodTypeAny> = {};
        form.fields.forEach(field => {
            let fieldSchema: z.ZodTypeAny;

            if (field.type === 'email') {
                fieldSchema = z.string().email("Invalid email format");
            } else if (field.type === 'number') {
                let numSchema = z.string().refine((val) => !isNaN(Number(val)), "Must be a number");
                if (field.validation?.exactDigits) {
                    const digits = field.validation.exactDigits;
                    numSchema = numSchema.refine((val) => val.length === digits, `Must be exactly ${digits} digits`);
                }
                fieldSchema = numSchema;
            } else if (['text', 'textarea', 'select', 'radio'].includes(field.type)) {
                let strSchema = z.string();
                if (field.validation?.minChars) {
                    strSchema = strSchema.min(field.validation.minChars, `Minimum ${field.validation.minChars} characters required`);
                }
                if (field.validation?.maxChars) {
                    strSchema = strSchema.max(field.validation.maxChars, `Maximum ${field.validation.maxChars} characters allowed`);
                }
                fieldSchema = strSchema;
            } else if (field.type === 'checkbox') {
                fieldSchema = z.array(z.string());
            } else if (field.type === 'date') {
                fieldSchema = z.date().nullable();
            } else {
                fieldSchema = z.any();
            }

            if (field.required) {
                if (field.type === 'checkbox') {
                    fieldSchema = (fieldSchema as z.ZodArray<z.ZodString>).min(1, "Please select at least one option");
                } else if (field.type === 'date') {
                    fieldSchema = z.date({ error: "This field is required" }).nullable().refine(val => val !== null, "This field is required");
                } else {
                    fieldSchema = (fieldSchema as z.ZodString).min(1, "This field is required");
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
        defaultValues: form.fields.reduce((acc: Record<string, unknown>, field) => {
            acc[field.id] = field.type === 'checkbox' ? [] : field.type === 'date' ? null : "";
            return acc;
        }, {}),
    });

    const values = watch();

    const getLocation = (fieldId: string) => {
        setLocationStates(prev => ({ ...prev, [fieldId]: { loading: true, error: false, mode: 'auto' } }));

        if (!navigator.geolocation) {
            setLocationStates(prev => ({ ...prev, [fieldId]: { loading: false, error: true } }));
            toast.error("Geolocation is not supported by your browser");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                let address = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                    const data = await res.json();
                    address = data.display_name || address;
                } catch (e) {
                    console.error("Failed to fetch address", e);
                }

                setLocationStates(prev => ({
                    ...prev,
                    [fieldId]: {
                        loading: false,
                        error: false,
                        mode: 'auto',
                        data: {
                            address,
                            lat: latitude,
                            lng: longitude,
                            method: 'auto',
                            timestamp: new Date()
                        }
                    }
                }));
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

    const onSubmit = async (data: Record<string, unknown>) => {
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
                    answers: {
                        ...data,
                        ...Object.keys(locationStates).reduce((acc: Record<string, unknown>, key) => {
                            if (locationStates[key]?.data) {
                                acc[key] = {
                                    address: locationStates[key].data?.address,
                                    latitude: locationStates[key].data?.lat,
                                    longitude: locationStates[key].data?.lng,
                                    method: locationStates[key].data?.method,
                                    timestamp: locationStates[key].data?.timestamp
                                };
                            }
                            return acc;
                        }, {})
                    }
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
                                                    date={(value as Date) || undefined}
                                                    onChange={onChange}
                                                    placeholder={field.placeholder}
                                                />
                                            )}
                                        />
                                    ) : field.type === 'file' ? (
                                        <div className="w-full">
                                            <input
                                                type="file"
                                                id={`file-${field.id}`}
                                                className="hidden"
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (!file) return;

                                                    setLocationStates(prev => ({
                                                        ...prev,
                                                        [field.id]: { loading: true, error: false, mode: 'auto' }
                                                    }));

                                                    const formData = new FormData();
                                                    formData.append('file', file);

                                                    try {
                                                        const res = await fetch('/api/upload', {
                                                            method: 'POST',
                                                            body: formData
                                                        });

                                                        if (!res.ok) throw new Error('Upload failed');

                                                        const data = await res.json();

                                                        // Update form value with the URL
                                                        const event = {
                                                            target: {
                                                                name: field.id,
                                                                value: data.url
                                                            }
                                                        };
                                                        register(field.id).onChange(event);

                                                        setLocationStates(prev => ({
                                                            ...prev,
                                                            [field.id]: {
                                                                loading: false,
                                                                error: false,
                                                                mode: 'auto',
                                                                data: {
                                                                    address: file.name, // Reusing address field for filename
                                                                    method: 'auto',
                                                                    timestamp: new Date()
                                                                }
                                                            }
                                                        }));
                                                        toast.success("File uploaded successfully");
                                                    } catch (err) {
                                                        console.error(err);
                                                        setLocationStates(prev => ({ ...prev, [field.id]: { loading: false, error: true } }));
                                                        toast.error("File upload failed");
                                                    }
                                                }}
                                            />

                                            {/* Upload UI State Management using existing locationStates structure for simplicity */}
                                            {locationStates[field.id]?.loading ? (
                                                <div className="w-full p-8 border border-purple-500/30 bg-purple-500/5 rounded-3xl flex flex-col items-center justify-center gap-4">
                                                    <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
                                                    <div className="text-center">
                                                        <p className="text-purple-300 font-medium">Uploading your file...</p>
                                                        <p className="text-xs text-purple-400/60 mt-1">Please wait</p>
                                                    </div>
                                                </div>
                                            ) : locationStates[field.id]?.data?.address ? (
                                                <div className="w-full p-6 border border-green-500/30 bg-green-500/5 rounded-3xl flex items-center justify-between group/file">
                                                    <div className="flex items-center gap-4">
                                                        <div className="p-3 bg-green-500/20 rounded-xl">
                                                            <CheckCircle2 className="w-6 h-6 text-green-400" />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-white text-lg truncate max-w-[200px] sm:max-w-xs">{locationStates[field.id].data?.address}</p>
                                                            <p className="text-xs text-green-400/60 font-mono">Upload Complete</p>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            const fileInput = document.getElementById(`file-${field.id}`) as HTMLInputElement;
                                                            if (fileInput) fileInput.value = '';

                                                            setLocationStates(prev => {
                                                                const newState = { ...prev };
                                                                delete newState[field.id];
                                                                return newState;
                                                            });

                                                            // Clear form value
                                                            register(field.id).onChange({ target: { name: field.id, value: '' } });
                                                        }}
                                                        className="opacity-0 group-hover/file:opacity-100 transition-opacity text-white/40 hover:text-white"
                                                    >
                                                        Remove
                                                    </Button>
                                                </div>
                                            ) : (
                                                <label
                                                    htmlFor={`file-${field.id}`}
                                                    className="w-full p-12 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center gap-4 text-muted-foreground hover:border-purple-500/50 hover:bg-purple-500/5 hover:text-white transition-all cursor-pointer group/upload"
                                                >
                                                    <div className="p-4 bg-white/5 rounded-2xl group-hover/upload:scale-110 transition-transform duration-300 group-hover/upload:bg-purple-500/20">
                                                        <Upload className="w-8 h-8 opacity-50 group-hover/upload:opacity-100 group-hover/upload:text-purple-400 transition-all" />
                                                    </div>
                                                    <div className="text-center">
                                                        <span className="text-lg font-semibold block">Click to upload file</span>
                                                        <span className="text-sm opacity-50">Max size 10MB</span>
                                                    </div>
                                                </label>
                                            )}
                                        </div>
                                    ) : field.type === 'location' ? (
                                        <div className="space-y-4">
                                            {/* Success State - Show Chip */}
                                            {locationStates[field.id]?.data?.address ? (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="flex items-center gap-3 p-4 rounded-xl glass bg-purple-500/10 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                                                >
                                                    <div className="p-2 rounded-full bg-purple-500/20">
                                                        <MapPin className="w-5 h-5 text-purple-400" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-white text-base truncate">
                                                            {locationStates[field.id].data?.address}
                                                        </p>
                                                        <p className="text-xs text-purple-300/70 font-mono">
                                                            {locationStates[field.id].data?.method === 'auto' ? 'Auto-Detected via GPS' : 'Manually Entered'}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setLocationStates(prev => ({ ...prev, [field.id]: { loading: false, error: false, data: undefined, mode: undefined } }))}
                                                        className="text-white/40 hover:text-white hover:bg-white/10"
                                                    >
                                                        Edit
                                                    </Button>
                                                </motion.div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {/* Mode Selection or Input */}
                                                    {!locationStates[field.id]?.mode ? (
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                            <Button
                                                                type="button"
                                                                onClick={() => getLocation(field.id)}
                                                                className="h-14 glass bg-white/5 hover:bg-purple-500/20 border-white/10 hover:border-purple-500/50 rounded-xl gap-2 transition-all group"
                                                            >
                                                                <Navigation className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                                                                <span className="font-semibold">Auto-Detect</span>
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                onClick={() => setLocationStates(prev => ({ ...prev, [field.id]: { loading: false, error: false, mode: 'manual' } }))}
                                                                className="h-14 glass bg-white/5 hover:bg-white/10 border-white/10 rounded-xl gap-2 transition-all text-white/70 hover:text-white"
                                                            >
                                                                <MapPin className="w-4 h-4" />
                                                                <span className="font-semibold">Enter Manually</span>
                                                            </Button>
                                                        </div>
                                                    ) : locationStates[field.id]?.mode === 'manual' ? (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className="flex gap-2"
                                                        >
                                                            <Input
                                                                autoFocus
                                                                placeholder="Type your full address..."
                                                                className="glass-input h-14 text-lg rounded-xl flex-1 bg-white/5 border-white/20 focus:ring-purple-500/30"
                                                                onBlur={(e) => {
                                                                    if (e.target.value.trim()) {
                                                                        setLocationStates(prev => ({
                                                                            ...prev,
                                                                            [field.id]: {
                                                                                loading: false,
                                                                                error: false,
                                                                                mode: 'manual',
                                                                                data: {
                                                                                    address: e.target.value,
                                                                                    method: 'manual',
                                                                                    timestamp: new Date()
                                                                                }
                                                                            }
                                                                        }));
                                                                    }
                                                                }}
                                                                onKeyDown={(e) => {
                                                                    if (e.key === 'Enter') {
                                                                        e.preventDefault();
                                                                        e.currentTarget.blur();
                                                                    }
                                                                }}
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                onClick={() => setLocationStates(prev => ({ ...prev, [field.id]: { loading: false, error: false, mode: undefined } }))}
                                                                className="h-14 px-4 rounded-xl border border-white/10 hover:bg-white/10"
                                                            >
                                                                Cancel
                                                            </Button>
                                                        </motion.div>
                                                    ) : null}

                                                    {/* Loading State */}
                                                    {locationStates[field.id]?.loading && (
                                                        <motion.div
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            className="flex items-center justify-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10 text-purple-300"
                                                        >
                                                            <Loader2 className="w-5 h-5 animate-spin" />
                                                            <span className="animate-pulse font-medium">Connecting to satellites...</span>
                                                        </motion.div>
                                                    )}

                                                    {/* Error State */}
                                                    {locationStates[field.id]?.error && (
                                                        <div className="flex items-center justify-between p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                                                            <span className="text-red-300 text-sm font-medium">Location access denied or failed.</span>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => setLocationStates(prev => ({ ...prev, [field.id]: { loading: false, error: false, mode: 'manual' } }))}
                                                                className="h-8 text-white/50 hover:text-white"
                                                            >
                                                                Try Manual
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
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
