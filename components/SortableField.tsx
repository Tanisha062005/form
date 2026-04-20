"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { FieldRenderer, FormField } from '@/components/FieldRenderer';
import { AnimatePresence, motion } from 'framer-motion';

function EditableLabel({ 
    label, 
    required, 
    onSave 
}: { 
    label: string, 
    required: boolean, 
    onSave: (val: string) => void 
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [text, setText] = useState(label);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleSave = () => {
        setIsEditing(false);
        if (text.trim() && text.trim() !== label) {
            onSave(text.trim());
        } else {
            setText(label); // restore if empty
        }
    };

    if (isEditing) {
        return (
            <input
                ref={inputRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onBlur={handleSave}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSave();
                    if (e.key === 'Escape') {
                        setText(label);
                        setIsEditing(false);
                    }
                }}
                className="text-lg font-bold bg-transparent outline-none border-b border-purple-500 w-full text-white"
            />
        );
    }

    return (
        <Label 
            className="text-lg font-bold cursor-text hover:text-purple-400 transition-colors"
            onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
            }}
            title="Click to edit"
        >
            {label} {required && <span className="text-red-500">*</span>}
        </Label>
    );
}

interface SortableFieldProps {
    field: FormField;
    isSelected: boolean;
    onClick: () => void;
    onDelete: (e: React.MouseEvent) => void;
    previewDate?: Date;
    onDateChange: (date: Date | undefined) => void;
    updateField: (id: string, data: Partial<FormField>) => void;
}

export function SortableField({
    field,
    isSelected,
    onClick,
    onDelete,
    previewDate,
    onDateChange,
    updateField
}: SortableFieldProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: field.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : 'auto',
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`relative group touch-none ${isDragging ? 'opacity-50' : ''}`}
        >
            <div
                onClick={onClick}
                className={`relative p-8 glass rounded-[1.25rem] border border-white/10 cursor-pointer transition-all ${
                    isSelected ? 'bg-white/10 neon-snake-border' : 'hover:border-white/20'
                    } ${isDragging ? 'shadow-2xl scale-105 bg-white/10 border-purple-500/50' : ''}`}
            >
                <div className={`absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-purple-500 to-indigo-600 rounded-l-[1.2rem] transition-opacity ${isSelected || isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} z-20`} />

                {/* Floating Properties Toolbar */}
                <AnimatePresence>
                    {isSelected && (
                        <motion.div 
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 15, transition: { duration: 0.15 } }}
                            className="absolute -top-16 left-0 right-0 mx-auto w-max backdrop-blur-xl bg-black/40 border border-white/10 rounded-2xl p-2 px-4 flex items-center gap-6 shadow-2xl z-50 pointer-events-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-3 border-r border-white/10 pr-4 mr-2">
                                <span className="text-[10px] uppercase font-bold text-white/50 tracking-wider">Required</span>
                                <input 
                                    type="checkbox"
                                    checked={field.required}
                                    onChange={(e) => updateField(field.id, { required: e.target.checked })}
                                    className="w-4 h-4 rounded border-white/20 bg-white/5 text-purple-500 focus:ring-purple-500 accent-purple-500 cursor-pointer"
                                    title="Toggle required status"
                                />
                            </div>

                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={onDelete}
                                className="h-8 px-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-wider">Delete</span>
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Drag Handle */}
                <div
                    {...attributes}
                    {...listeners}
                    className="absolute left-[-40px] top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-white/10 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-white opacity-0 group-hover:opacity-100 transition-opacity z-20"
                >
                    <GripVertical className="w-6 h-6" />
                </div>

                <div className="relative flex justify-between items-start mb-4 z-20">
                    <div className="space-y-1">
                        <EditableLabel 
                            label={field.label} 
                            required={field.required} 
                            onSave={(newLabel) => updateField(field.id, { label: newLabel })} 
                        />
                        {field.helpText && <p className="text-sm text-muted-foreground italic">{field.helpText}</p>}
                    </div>
                </div>

                {/* Field Content Visualization */}
                <div className="relative pointer-events-none z-20">
                    <FieldRenderer
                        field={field}
                        selectedDate={previewDate}
                        onDateChange={onDateChange}
                        updateField={updateField}
                    />
                </div>
            </div>
        </div>
    );
}
