"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Plus,
    Trash2,
    ArrowUp,
    ArrowDown,
    Settings,
    Eye,
    Save,
    ChevronLeft,
    Type,
    Mail,
    Hash,
    ChevronDown,
    CircleDot,
    CheckSquare,
    Calendar,
    Upload,
    GripVertical,
    Loader2,
    CheckCircle2,
    ExternalLink,
    Copy,
    Check,
    Zap,
    Shield,
    MessageSquare,

    Globe,
    MapPin,
    Navigation,
} from 'lucide-react';
import { nanoid } from 'nanoid';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { FieldRenderer } from '@/components/FieldRenderer';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

// Types
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
    requireRange?: boolean;
}

const componentList = [
    { type: 'text', label: 'Text Input', icon: Type },
    { type: 'email', label: 'Email', icon: Mail },
    { type: 'number', label: 'Number', icon: Hash },
    { type: 'select', label: 'Dropdown', icon: ChevronDown },
    { type: 'radio', label: 'Radio Group', icon: CircleDot },
    { type: 'checkbox', label: 'Checkbox', icon: CheckSquare },
    { type: 'date', label: 'Date Picker', icon: Calendar },
    { type: 'file', label: 'File Upload', icon: Upload },
    { type: 'location', label: 'Location Sensor', icon: MapPin },
];

export default function BuilderPage() {
    const { id } = useParams();
    const router = useRouter();
    const { toast } = useToast();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formTitle, setFormTitle] = useState('');
    const [fields, setFields] = useState<FormField[]>([]);
    const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
    const [previewDates, setPreviewDates] = useState<Record<string, Date | undefined>>({});
    const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [publishing, setPublishing] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [activeTab, setActiveTab] = useState<'content' | 'logic' | 'validation'>('content');
    const [formSettings, setFormSettings] = useState({
        maxResponses: 0,
        expiryDate: null as Date | null,
        singleSubmission: false,
        closedMessage: "This form is no longer accepting responses.",
    });

    // Fetch initial data
    useEffect(() => {
        const fetchForm = async () => {
            try {
                const res = await fetch(`/api/forms/${id}`);
                if (!res.ok) throw new Error('Form not found');
                const data = await res.json();
                setFormTitle(data.title);
                setFields(data.fields || []);
                if (data.settings) {
                    setFormSettings({
                        maxResponses: data.settings.maxResponses || 0,
                        expiryDate: data.settings.expiryDate ? new Date(data.settings.expiryDate) : null,
                        singleSubmission: !!data.settings.singleSubmission,
                        closedMessage: data.settings.closedMessage || "This form is no longer accepting responses.",
                    });
                }
            } catch {
                toast({
                    title: "Error",
                    description: "Could not load the form.",
                    variant: "destructive",
                });
                router.push('/dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchForm();
    }, [id, router, toast]);

    // Auto-save logic
    useEffect(() => {
        if (loading) return;

        const timeout = setTimeout(async () => {
            setSaving(true);
            try {
                await fetch(`/api/forms/${id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ fields, settings: formSettings }),
                });
            } catch (error) {
                console.error("Auto-save failed", error);
            } finally {
                setSaving(false);
            }
        }, 2000); // 2 second debounce

        return () => clearTimeout(timeout);
    }, [fields, formSettings, id, loading]);

    const onPublish = async () => {
        setPublishing(true);
        try {
            const res = await fetch(`/api/forms/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ settings: { isActive: true } }),
            });

            if (!res.ok) throw new Error('Failed to publish form');

            setIsPublishModalOpen(true);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to publish form. Please try again.",
                variant: "destructive",
            });
        } finally {
            setPublishing(false);
        }
    };

    const copyToClipboard = () => {
        const url = window.location.origin + '/f/' + id;
        navigator.clipboard.writeText(url);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
        toast({
            title: "Copied!",
            description: "Form link copied to clipboard.",
        });
    };

    // Field Management Functions
    const addField = (type: string) => {
        const newField: FormField = {
            id: nanoid(),
            type,
            label: type === 'location' ? 'Current Location' : `New ${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
            placeholder: '',
            helpText: '',
            required: false,
            options: ['Option 1', 'Option 2'],
        };
        setFields([...fields, newField]);
        setSelectedFieldId(newField.id);
    };

    const updateField = (fieldId: string, updatedData: Partial<FormField>) => {
        setFields(prev => prev.map(field =>
            field.id === fieldId ? { ...field, ...updatedData } : field
        ));
    };

    const deleteField = (fieldId: string) => {
        setFields(prev => prev.filter(f => f.id !== fieldId));
        if (selectedFieldId === fieldId) setSelectedFieldId(null);
    };

    const moveField = (index: number, direction: 'up' | 'down') => {
        const newFields = [...fields];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newFields.length) return;

        [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
        setFields(newFields);
    };

    const selectedField = fields.find(f => f.id === selectedFieldId);

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-purple-500" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)]">
            {/* Top Bar */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => router.push('/dashboard')} className="glass border-white/5 h-10 w-10 p-0 rounded-full">
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">{formTitle}</h1>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">Form ID: {id}</span>
                            {saving && <Badge variant="secondary" className="text-[10px] h-4 bg-purple-500/20 text-purple-400">Saving...</Badge>}
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        className="glass border-white/5 gap-2"
                        onClick={() => window.open(`/f/${id}?preview=true`, '_blank')}
                    >
                        <Eye className="w-4 h-4" />
                        Preview
                    </Button>
                    <Button
                        variant="ghost"
                        className="glass border-white/5 gap-2"
                        onClick={() => setIsSettingsModalOpen(true)}
                    >
                        <Globe className="w-4 h-4" />
                        Settings
                    </Button>
                    <Button
                        onClick={onPublish}
                        disabled={publishing}
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 border-0 gap-2"
                    >
                        {publishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Publish
                    </Button>
                </div>
            </div>

            <div className="flex flex-1 gap-6 overflow-hidden">
                {/* Left Sidebar: Components */}
                <div className="w-72 glass rounded-3xl p-6 flex flex-col gap-6 overflow-y-auto border-white/5">
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Components</h3>
                        <div className="grid grid-cols-1 gap-3">
                            {componentList.map((comp) => (
                                <button
                                    key={comp.type}
                                    onClick={() => addField(comp.type)}
                                    className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-purple-500/50 hover:bg-white/10 transition-all text-left group"
                                >
                                    <div className="p-2 rounded-xl bg-white/5 group-hover:bg-purple-500/20 transition-colors">
                                        <comp.icon className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <span className="font-medium">{comp.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Center Canvas: Preview */}
                <div className="flex-1 flex flex-col min-h-0">
                    <ScrollArea className="flex-1 glass rounded-3xl border-white/5">
                        <div className="p-8 max-w-3xl mx-auto space-y-6">
                            {fields.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-32 text-center text-muted-foreground border-2 border-dashed border-white/10 rounded-3xl">
                                    <Plus className="w-12 h-12 mb-4 opacity-20" />
                                    <p className="text-lg">Drag or click components to start building</p>
                                </div>
                            ) : (
                                fields.map((field, index) => (
                                    <div
                                        key={field.id}
                                        onClick={() => setSelectedFieldId(field.id)}
                                        className={`relative p-8 glass rounded-2xl border-white/10 cursor-pointer transition-all ${selectedFieldId === field.id ? 'ring-2 ring-purple-500 bg-white/10' : 'hover:border-white/20'}`}
                                    >
                                        <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-purple-500 to-indigo-600 rounded-l-2xl opacity-0 group-hover:opacity-100 transition-opacity" />

                                        <div className="flex justify-between items-start mb-4">
                                            <div className="space-y-1">
                                                <Label className="text-lg font-bold">
                                                    {field.label} {field.required && <span className="text-red-500">*</span>}
                                                </Label>
                                                {field.helpText && <p className="text-sm text-muted-foreground italic">{field.helpText}</p>}
                                            </div>

                                            {selectedFieldId === field.id && (
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={(e) => { e.stopPropagation(); moveField(index, 'up'); }}
                                                        disabled={index === 0}
                                                        className="h-8 w-8 text-muted-foreground hover:text-white"
                                                    >
                                                        <ArrowUp className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={(e) => { e.stopPropagation(); moveField(index, 'down'); }}
                                                        disabled={index === fields.length - 1}
                                                        className="h-8 w-8 text-muted-foreground hover:text-white"
                                                    >
                                                        <ArrowDown className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={(e) => { e.stopPropagation(); deleteField(field.id); }}
                                                        className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Field Content Visualization */}
                                        <div className="relative">
                                            <FieldRenderer
                                                field={field}
                                                selectedDate={previewDates[field.id]}
                                                onDateChange={(date) => setPreviewDates(prev => ({ ...prev, [field.id]: date }))}
                                            />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </div>

                {/* Right Sidebar: Properties */}
                <div className="w-80 glass rounded-3xl flex flex-col border-white/5 overflow-hidden">
                    <div className="p-6 border-b border-white/5">
                        <div className="flex items-center gap-2 mb-1">
                            <Settings className="w-4 h-4 text-purple-400" />
                            <h3 className="font-bold">Properties</h3>
                        </div>
                        <p className="text-xs text-muted-foreground">Customize the selected field</p>
                    </div>

                    <div className="flex border-b border-white/5 p-2 gap-1 bg-white/5">
                        <button
                            onClick={() => setActiveTab('content')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${activeTab === 'content' ? 'bg-purple-500/20 text-purple-400 font-bold' : 'text-muted-foreground hover:bg-white/5'}`}
                        >
                            <Settings className="w-4 h-3" />
                            <span className="text-[10px] uppercase tracking-wider font-bold">Content</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('logic')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${activeTab === 'logic' ? 'bg-indigo-500/20 text-indigo-400 font-bold' : 'text-muted-foreground hover:bg-white/5'}`}
                        >
                            <Zap className="w-4 h-3" />
                            <span className="text-[10px] uppercase tracking-wider font-bold">Logic</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('validation')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all ${activeTab === 'validation' ? 'bg-blue-500/20 text-blue-400 font-bold' : 'text-muted-foreground hover:bg-white/5'}`}
                        >
                            <Shield className="w-4 h-3" />
                            <span className="text-[10px] uppercase tracking-wider font-bold">Valid</span>
                        </button>
                    </div>

                    <ScrollArea className="flex-1">
                        {selectedField ? (
                            <>
                                {activeTab === 'content' && (
                                    <div className="p-6 space-y-6">
                                        <div className="space-y-2">
                                            <Label className="text-xs uppercase tracking-wider font-semibold">Label</Label>
                                            <Input
                                                value={selectedField.label}
                                                onChange={(e) => updateField(selectedField.id, { label: e.target.value })}
                                                className="bg-white/5 border-white/10"
                                            />
                                        </div>

                                        {(['text', 'email', 'number', 'select', 'date'].includes(selectedField.type)) && (
                                            <div className="space-y-2">
                                                <Label className="text-xs uppercase tracking-wider font-semibold">Placeholder</Label>
                                                <Input
                                                    value={selectedField.placeholder}
                                                    onChange={(e) => updateField(selectedField.id, { placeholder: e.target.value })}
                                                    className="bg-white/5 border-white/10"
                                                />
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <Label className="text-xs uppercase tracking-wider font-semibold">Help Text</Label>
                                            <Textarea
                                                value={selectedField.helpText}
                                                onChange={(e) => updateField(selectedField.id, { helpText: e.target.value })}
                                                className="bg-white/5 border-white/10 min-h-[60px] text-sm"
                                            />
                                        </div>

                                        {selectedField.type === 'location' && (
                                            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                                                <div className="space-y-0.5">
                                                    <Label className="font-semibold">Capture City Name</Label>
                                                    <p className="text-[10px] text-muted-foreground italic">Use Reverse Geocoding</p>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedField.validation?.captureCity || false}
                                                    onChange={(e) => updateField(selectedField.id, {
                                                        validation: {
                                                            ...selectedField.validation,
                                                            captureCity: e.target.checked
                                                        }
                                                    })}
                                                    className="h-5 w-5 rounded border-white/10 bg-white/5 text-purple-500 focus:ring-purple-500"
                                                />
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                                            <Label className="font-semibold">Required Field</Label>
                                            <input
                                                type="checkbox"
                                                checked={selectedField.required}
                                                onChange={(e) => updateField(selectedField.id, { required: e.target.checked })}
                                                className="h-5 w-5 rounded border-white/10 bg-white/5 text-purple-500 focus:ring-purple-500"
                                            />
                                        </div>

                                        {selectedField.type === 'date' && (
                                            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                                                <div className="space-y-0.5">
                                                    <Label className="font-semibold">Require Specific Range</Label>
                                                    <p className="text-[10px] text-muted-foreground italic">Optional: Placeholder for range logic</p>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedField.requireRange || false}
                                                    onChange={(e) => updateField(selectedField.id, { requireRange: e.target.checked })}
                                                    className="h-5 w-5 rounded border-white/10 bg-white/5 text-purple-500 focus:ring-purple-500"
                                                />
                                            </div>
                                        )}

                                        {(['select', 'radio', 'checkbox'].includes(selectedField.type)) && (
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <Label className="text-xs uppercase tracking-wider font-semibold">Options</Label>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 text-[10px] uppercase font-bold text-purple-400"
                                                        onClick={() => {
                                                            const newOptions = [...(selectedField.options || []), `Option ${(selectedField.options?.length || 0) + 1}`];
                                                            updateField(selectedField.id, { options: newOptions });
                                                        }}
                                                    >
                                                        Add Option
                                                    </Button>
                                                </div>
                                                <div className="space-y-2">
                                                    {selectedField.options?.map((opt, i) => (
                                                        <div key={i} className="flex gap-2">
                                                            <Input
                                                                value={opt}
                                                                onChange={(e) => {
                                                                    const newOptions = [...(selectedField.options || [])];
                                                                    newOptions[i] = e.target.value;
                                                                    updateField(selectedField.id, { options: newOptions });
                                                                }}
                                                                className="bg-white/5 border-white/10 h-9"
                                                            />
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => {
                                                                    const newOptions = selectedField.options?.filter((_, idx) => idx !== i);
                                                                    updateField(selectedField.id, { options: newOptions });
                                                                }}
                                                                className="h-9 w-9 text-red-400 shrink-0"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'logic' && (
                                    <div className="p-6 space-y-6">
                                        <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 mb-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Zap className="w-4 h-4 text-indigo-400" />
                                                <span className="text-xs font-bold uppercase text-indigo-400 tracking-wider">Conditional Logic</span>
                                            </div>
                                            <p className="text-[10px] text-muted-foreground leading-relaxed">
                                                Show this field only if another field meets a specific condition.
                                            </p>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label className="text-xs uppercase tracking-wider font-semibold">Trigger Field</Label>
                                                <select
                                                    value={selectedField.logic?.triggerFieldId || ""}
                                                    onChange={(e) => updateField(selectedField.id, {
                                                        logic: {
                                                            triggerFieldId: e.target.value,
                                                            condition: selectedField.logic?.condition || 'equals',
                                                            value: selectedField.logic?.value || ''
                                                        }
                                                    })}
                                                    className="w-full glass-input h-11 rounded-xl px-4 appearance-none outline-none focus:border-purple-500 transition-all text-sm"
                                                >
                                                    <option value="" className="bg-[#030014]">None</option>
                                                    {fields.filter(f => f.id !== selectedField.id).map(f => (
                                                        <option key={f.id} value={f.id} className="bg-[#030014]">{f.label}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            {selectedField.logic?.triggerFieldId && (
                                                <>
                                                    <div className="space-y-2">
                                                        <Label className="text-xs uppercase tracking-wider font-semibold">Condition</Label>
                                                        <select
                                                            value={selectedField.logic?.condition || "equals"}
                                                            onChange={(e) => updateField(selectedField.id, {
                                                                logic: {
                                                                    ...selectedField.logic!,
                                                                    condition: e.target.value as 'equals' | 'not_equals'
                                                                }
                                                            })}
                                                            className="w-full glass-input h-11 rounded-xl px-4 appearance-none outline-none focus:border-purple-500 transition-all text-sm"
                                                        >
                                                            <option value="equals" className="bg-[#030014]">Equals</option>
                                                            <option value="not_equals" className="bg-[#030014]">Not Equals</option>
                                                        </select>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label className="text-xs uppercase tracking-wider font-semibold">Value</Label>
                                                        <Input
                                                            value={selectedField.logic?.value || ""}
                                                            onChange={(e) => updateField(selectedField.id, {
                                                                logic: {
                                                                    ...selectedField.logic!,
                                                                    value: e.target.value
                                                                }
                                                            })}
                                                            placeholder="Enter value to match..."
                                                            className="bg-white/5 border-white/10"
                                                        />
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'validation' && (
                                    <div className="p-6 space-y-6">
                                        <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 mb-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Shield className="w-4 h-4 text-blue-400" />
                                                <span className="text-xs font-bold uppercase text-blue-400 tracking-wider">Custom Validation</span>
                                            </div>
                                            <p className="text-[10px] text-muted-foreground leading-relaxed">
                                                Set limits and requirements for this specific field.
                                            </p>
                                        </div>

                                        <div className="space-y-4">
                                            {(['text', 'email', 'textarea'].includes(selectedField.type)) && (
                                                <>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label className="text-xs uppercase tracking-wider font-semibold">Min Chars</Label>
                                                            <Input
                                                                type="number"
                                                                value={selectedField.validation?.minChars || ""}
                                                                onChange={(e) => updateField(selectedField.id, {
                                                                    validation: {
                                                                        ...selectedField.validation,
                                                                        minChars: parseInt(e.target.value) || undefined
                                                                    }
                                                                })}
                                                                className="bg-white/5 border-white/10"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label className="text-xs uppercase tracking-wider font-semibold">Max Chars</Label>
                                                            <Input
                                                                type="number"
                                                                value={selectedField.validation?.maxChars || ""}
                                                                onChange={(e) => updateField(selectedField.id, {
                                                                    validation: {
                                                                        ...selectedField.validation,
                                                                        maxChars: parseInt(e.target.value) || undefined
                                                                    }
                                                                })}
                                                                className="bg-white/5 border-white/10"
                                                            />
                                                        </div>
                                                    </div>
                                                </>
                                            )}

                                            {selectedField.type === 'number' && (
                                                <div className="space-y-2">
                                                    <Label className="text-xs uppercase tracking-wider font-semibold">Exact Digit Count</Label>
                                                    <Input
                                                        type="number"
                                                        value={selectedField.validation?.exactDigits || ""}
                                                        onChange={(e) => updateField(selectedField.id, {
                                                            validation: {
                                                                ...selectedField.validation,
                                                                exactDigits: parseInt(e.target.value) || undefined
                                                            }
                                                        })}
                                                        placeholder="e.g. 10 for Phone"
                                                        className="bg-white/5 border-white/10"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground h-full opacity-50">
                                <GripVertical className="w-12 h-12 mb-4" />
                                <p>Select a field in the canvas to edit its properties</p>
                            </div>
                        )}
                    </ScrollArea>
                </div>
            </div>
            {/* Form Settings Modal */}
            <Dialog open={isSettingsModalOpen} onOpenChange={setIsSettingsModalOpen}>
                <DialogContent className="glass border-white/10 text-white max-w-md rounded-3xl p-0 overflow-hidden">
                    <div className="bg-gradient-to-br from-purple-600/20 to-indigo-600/20 p-8 border-b border-white/5">
                        <DialogHeader>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-500/30">
                                    <Globe className="w-6 h-6 text-purple-400" />
                                </div>
                                <DialogTitle className="text-2xl font-bold">Form Settings</DialogTitle>
                            </div>
                            <DialogDescription className="text-white/60">
                                Configure global behavior and access controls for your form.
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <div className="p-8 space-y-8">
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                            <div className="space-y-1">
                                <Label className="text-sm font-semibold">Max Responses</Label>
                                <p className="text-xs text-muted-foreground italic">Stop after X submissions (0 for unlimited)</p>
                            </div>
                            <Input
                                type="number"
                                className="w-24 bg-black/20 border-white/10 h-10 text-center rounded-xl"
                                value={formSettings.maxResponses}
                                onChange={(e) => setFormSettings({ ...formSettings, maxResponses: parseInt(e.target.value) || 0 })}
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                            <div className="space-y-1">
                                <Label className="text-sm font-semibold">Expiry Date</Label>
                                <p className="text-xs text-muted-foreground italic">Scheduled form closure</p>
                            </div>
                            <Input
                                type="date"
                                className="w-40 bg-black/20 border-white/10 h-10 text-sm rounded-xl"
                                value={formSettings.expiryDate ? formSettings.expiryDate.toISOString().split('T')[0] : ""}
                                onChange={(e) => setFormSettings({ ...formSettings, expiryDate: e.target.value ? new Date(e.target.value) : null })}
                            />
                        </div>

                        <div className="space-y-2 p-4 rounded-2xl bg-white/5 border border-white/5">
                            <div className="space-y-1 mb-2">
                                <Label className="text-sm font-semibold">Closed Message</Label>
                                <p className="text-xs text-muted-foreground italic">Message shown when form is inactive</p>
                            </div>
                            <Textarea
                                value={formSettings.closedMessage}
                                onChange={(e) => setFormSettings({ ...formSettings, closedMessage: e.target.value })}
                                className="bg-black/20 border-white/10 min-h-[80px] rounded-xl resize-none"
                                placeholder="This form is no longer accepting responses."
                            />
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                            <div className="space-y-1">
                                <Label className="text-sm font-semibold">Single Submission</Label>
                                <p className="text-xs text-muted-foreground italic">Prevent multiple entries from same user</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={formSettings.singleSubmission}
                                onChange={(e) => setFormSettings({ ...formSettings, singleSubmission: e.target.checked })}
                                className="h-5 w-5 rounded border-white/10 bg-black/20 text-purple-500 focus:ring-purple-500"
                            />
                        </div>

                        <Button
                            onClick={() => setIsSettingsModalOpen(false)}
                            className="w-full bg-white/10 hover:bg-white/20 border border-white/10 py-6 rounded-2xl text-lg font-bold transition-all"
                        >
                            Done
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Publish Success Modal */}
            <Dialog open={isPublishModalOpen} onOpenChange={setIsPublishModalOpen}>
                <DialogContent className="glass border-white/10 max-w-md p-8 rounded-[2rem]">
                    <DialogHeader className="space-y-4">
                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-10 h-10 text-green-400" />
                        </div>
                        <DialogTitle className="text-3xl font-black text-center bg-clip-text text-transparent bg-gradient-to-r from-white to-white/40">
                            Form is now Live! 🚀
                        </DialogTitle>
                        <DialogDescription className="text-center text-lg text-muted-foreground">
                            Your form is ready to accept responses. Share the link below with your audience.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 mt-8">
                        <div className="space-y-2">
                            <Label className="text-xs uppercase tracking-widest font-bold text-purple-400">Public Form Link</Label>
                            <div className="flex gap-2">
                                <Input
                                    readOnly
                                    value={window.location.origin + '/f/' + id}
                                    className="glass-input h-14 rounded-2xl font-medium text-purple-200"
                                />
                                <Button
                                    onClick={copyToClipboard}
                                    className="h-14 w-14 glass border-white/10 rounded-2xl flex-shrink-0"
                                >
                                    {isCopied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            <Button
                                onClick={() => window.open(`/f/${id}`, '_blank')}
                                className="h-14 rounded-2xl bg-purple-600 hover:bg-purple-500 font-bold gap-2 text-lg"
                            >
                                <ExternalLink className="w-5 h-5" />
                                View Live Form
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => setIsPublishModalOpen(false)}
                                className="h-14 rounded-2xl glass border-white/5 font-bold"
                            >
                                Continue Editing
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
