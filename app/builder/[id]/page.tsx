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
    Loader2
} from 'lucide-react';
import { nanoid } from 'nanoid';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

// Types
interface FormField {
    id: string;
    type: string;
    label: string;
    placeholder?: string;
    helpText?: string;
    required: boolean;
    options?: string[];
    logic?: unknown;
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

    // Fetch initial data
    useEffect(() => {
        const fetchForm = async () => {
            try {
                const res = await fetch(`/api/forms/${id}`);
                if (!res.ok) throw new Error('Form not found');
                const data = await res.json();
                setFormTitle(data.title);
                setFields(data.fields || []);
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
                    body: JSON.stringify({ fields }),
                });
            } catch (error) {
                console.error("Auto-save failed", error);
            } finally {
                setSaving(false);
            }
        }, 2000); // 2 second debounce

        return () => clearTimeout(timeout);
    }, [fields, id, loading]);

    // Field Management Functions
    const addField = (type: string) => {
        const newField: FormField = {
            id: nanoid(),
            type,
            label: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Field`,
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
                    <Button variant="ghost" className="glass border-white/5 gap-2">
                        <Eye className="w-4 h-4" />
                        Preview
                    </Button>
                    <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 border-0 gap-2">
                        <Save className="w-4 h-4" />
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
                                        <div className="pointer-events-none">
                                            {(field.type === 'text' || field.type === 'email' || field.type === 'number') && (
                                                <Input placeholder={field.placeholder} disabled className="bg-white/5 border-white/10" />
                                            )}
                                            {field.type === 'textarea' && (
                                                <Textarea placeholder={field.placeholder} disabled className="bg-white/5 border-white/10" />
                                            )}
                                            {field.type === 'select' && (
                                                <div className="w-full p-2 rounded-md bg-white/5 border border-white/10 text-muted-foreground flex justify-between items-center text-sm">
                                                    <span>{field.placeholder || "Select an option..."}</span>
                                                    <ChevronDown className="w-4 h-4" />
                                                </div>
                                            )}
                                            {(field.type === 'radio' || field.type === 'checkbox') && (
                                                <div className="grid grid-cols-2 gap-4">
                                                    {field.options?.map((opt, i) => (
                                                        <div key={i} className="flex items-center gap-2">
                                                            {field.type === 'radio' ? <CircleDot className="w-4 h-4 opacity-50" /> : <CheckSquare className="w-4 h-4 opacity-50" />}
                                                            <span className="text-sm">{opt}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {field.type === 'date' && (
                                                <div className="w-full p-2 rounded-md bg-white/5 border border-white/10 text-muted-foreground flex items-center gap-2 text-sm">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>Pick a date...</span>
                                                </div>
                                            )}
                                            {field.type === 'file' && (
                                                <div className="w-full p-8 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center gap-2 text-muted-foreground">
                                                    <Upload className="w-8 h-8 opacity-20" />
                                                    <span className="text-sm">Click to upload file</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </div>

                {/* Right Sidebar: Properties */}
                <div className="w-80 glass rounded-3xl flex flex-col border-white/5">
                    <div className="p-6 border-b border-white/5">
                        <div className="flex items-center gap-2 mb-1">
                            <Settings className="w-4 h-4 text-purple-400" />
                            <h3 className="font-bold">Properties</h3>
                        </div>
                        <p className="text-xs text-muted-foreground">Customize the selected field</p>
                    </div>

                    <ScrollArea className="flex-1">
                        {selectedField ? (
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

                                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                                    <Label className="font-semibold">Required Field</Label>
                                    <input
                                        type="checkbox"
                                        checked={selectedField.required}
                                        onChange={(e) => updateField(selectedField.id, { required: e.target.checked })}
                                        className="h-5 w-5 rounded border-white/10 bg-white/5 text-purple-500 focus:ring-purple-500"
                                    />
                                </div>

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
                        ) : (
                            <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground h-full opacity-50">
                                <GripVertical className="w-12 h-12 mb-4" />
                                <p>Select a field in the canvas to edit its properties</p>
                            </div>
                        )}
                    </ScrollArea>
                </div>
            </div>
        </div>
    );
}
