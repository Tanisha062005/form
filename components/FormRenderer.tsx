"use client";

import React, { useState, useMemo, useCallback } from 'react';
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
    Lock,
} from 'lucide-react';
import useDeviceType from '@/hooks/use-device-type';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/DatePicker';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

import LockScreen from './LockScreen';

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
            status?: 'Draft' | 'Live' | 'Closed';
            visibility?: 'Public' | 'Private' | 'Password Protected';
            password?: string;
            closedMessage?: string;
        };
    };
    isPreview?: boolean;
}


export function FormRenderer({ form, isPreview = false }: FormRendererProps) {
    const router = useRouter();
    const [submitting, setSubmitting] = useState(false);
    const [isVerified, setIsVerified] = useState(form.settings?.visibility !== 'Password Protected');
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


    const [countdown, setCountdown] = useState<number | null>(null);
    const [countdownActive, setCountdownActive] = useState(false);
    const [pendingData, setPendingData] = useState<Record<string, unknown> | null>(null);

    const logActivity = async (eventType: string, description: string) => {
        try {
            await fetch(`/api/f/${form._id}/activity`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ eventType, description })
            });
        } catch (error) {
            console.error("Failed to log activity:", error);
        }
    };

    const startCountdown = async (data: Record<string, unknown>) => {
        setPendingData(data);
        setCountdown(10);
        setCountdownActive(true);
        await logActivity('submission_initiated', 'User initiated a submission');
    };

    const handleUndo = async () => {
        setCountdown(null);
        setCountdownActive(false);
        setPendingData(null);
        await logActivity('submission_undone', 'User undone the submission');
        toast.info("Submission cancelled");
    };

    const executeSubmit = useCallback(async (data: Record<string, unknown>) => {
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

            const result = await res.json();

            // Handle Single Submission Cookie
            if (form.settings?.singleSubmission) {
                document.cookie = `form_submitted_${form._id}=true; max-age=${60 * 60 * 24 * 365}; path=/`;
            }

            toast.success('Form submitted successfully!');
            router.push(`/f/${form._id}/success?sid=${result.submissionId}&ts=${result.submittedAt}`);
        } catch (error) {
            toast.error('Something went wrong. Please try again.');
            console.error(error);
        } finally {
            setSubmitting(false);
            setCountdownActive(false);
            setCountdown(null);
            setPendingData(null);
        }
    }, [form._id, form.settings?.singleSubmission, locationStates, router]);

    React.useEffect(() => {
        let timer: NodeJS.Timeout;
        if (countdownActive && countdown !== null && countdown > 0) {
            timer = setTimeout(() => {
                setCountdown(countdown - 1);
            }, 1000);
        } else if (countdownActive && countdown === 0) {
            if (pendingData) {
                executeSubmit(pendingData);
            }
        }
        return () => clearTimeout(timer);
    }, [countdown, countdownActive, pendingData, executeSubmit]);

    const onSubmit = (data: Record<string, unknown>) => {
        if (isPreview) {
            toast.error("Submissions are disabled in preview mode");
            return;
        }

        // Check for Closed status
        if (form.settings?.status === 'Closed') {
            toast.error("This form is no longer accepting responses");
            return;
        }

        startCountdown(data);
    };

    if (!isVerified && !isPreview) {
        return <LockScreen
            onVerified={() => setIsVerified(true)}
            correctPasswordHash={form.settings?.password || ""}
        />;
    }

    const isClosed = form.settings?.status === 'Closed';

    return (
        <div className="min-h-screen bg-[#030014] text-white selection:bg-purple-500/30">
            {/* Background Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <div className="max-w-4xl mx-auto px-6 py-12 md:py-24 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="space-y-12"
                >
                    {/* Form Header */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <span className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-white/20" />
                            <div className="px-4 py-1.2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">
                                    {isClosed ? "Responses Closed" : "Active Form"}
                                </span>
                            </div>
                            <span className="h-px flex-1 bg-gradient-to-l from-transparent via-white/10 to-white/20" />
                        </div>

                        <div className="text-center space-y-4">
                            <h1 className="text-5xl md:text-7xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/50 uppercase tracking-tighter">
                                {form.title}
                            </h1>
                            {form.description && (
                                <p className="text-lg md:text-xl text-white/40 font-medium max-w-2xl mx-auto leading-relaxed">
                                    {form.description}
                                </p>
                            )}
                        </div>
                    </div>

                    {isClosed ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="glass p-12 rounded-[2.5rem] border-red-500/20 bg-red-500/5 text-center space-y-6"
                        >
                            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto border border-red-500/30">
                                <Lock className="w-8 h-8 text-red-400" />
                            </div>
                            <h2 className="text-3xl font-black uppercase tracking-tighter text-white">Responses Paused</h2>
                            <p className="text-white/60 text-lg font-medium max-w-md mx-auto">
                                {form.settings?.closedMessage || "This form is no longer accepting responses."}
                            </p>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className={`${glassStyles.spaceY} relative transition-all duration-500`}>

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
                            {/* Countdown Overlay */}
                            <AnimatePresence>
                                {countdownActive && countdown !== null && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md"
                                    >
                                        <motion.div
                                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                            animate={{ scale: 1, opacity: 1, y: 0 }}
                                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                            className="max-w-md w-full glass p-10 rounded-[2.5rem] border border-white/20 text-center space-y-8 shadow-[0_0_50px_rgba(168,85,247,0.2)]"
                                        >
                                            <div className="relative w-24 h-24 mx-auto">
                                                <svg className="w-full h-full rotate-[-90deg]">
                                                    <circle
                                                        cx="48"
                                                        cy="48"
                                                        r="40"
                                                        stroke="currentColor"
                                                        strokeWidth="8"
                                                        fill="transparent"
                                                        className="text-white/5"
                                                    />
                                                    <motion.circle
                                                        cx="48"
                                                        cy="48"
                                                        r="40"
                                                        stroke="currentColor"
                                                        strokeWidth="8"
                                                        fill="transparent"
                                                        strokeDasharray="251.2"
                                                        initial={{ strokeDashoffset: 0 }}
                                                        animate={{ strokeDashoffset: 251.2 - (251.2 * countdown) / 10 }}
                                                        className="text-purple-500"
                                                    />
                                                </svg>
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="text-4xl font-black text-white">{countdown}</span>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <h2 className="text-3xl font-black text-white">Sending Response...</h2>
                                                <p className="text-muted-foreground text-lg">
                                                    Taking a moment to double-check. You can undo this now.
                                                </p>
                                            </div>

                                            <Button
                                                type="button"
                                                onClick={handleUndo}
                                                className="w-full h-16 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xl border border-white/10 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                            >
                                                Undo Submission
                                            </Button>
                                        </motion.div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

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
                        </form>
                    )}
                </motion.div>
            </div>
        </div>
    );
}

function XCircle({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
    )
}
