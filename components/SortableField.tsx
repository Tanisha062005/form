"use client";

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { FieldRenderer } from '@/components/FieldRenderer';

interface SortableFieldProps {
    field: any;
    isSelected: boolean;
    onClick: () => void;
    onDelete: (e: React.MouseEvent) => void;
    previewDate?: Date;
    onDateChange: (date: Date | undefined) => void;
}

export function SortableField({
    field,
    isSelected,
    onClick,
    onDelete,
    previewDate,
    onDateChange
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
                className={`relative p-8 glass rounded-2xl border-white/10 cursor-pointer transition-all ${isSelected ? 'ring-2 ring-purple-500 bg-white/10' : 'hover:border-white/20'
                    } ${isDragging ? 'shadow-2xl scale-105 bg-white/10 border-purple-500/50' : ''}`}
            >
                <div className={`absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-purple-500 to-indigo-600 rounded-l-2xl transition-opacity ${isSelected || isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />

                {/* Drag Handle */}
                <div
                    {...attributes}
                    {...listeners}
                    className="absolute left-[-40px] top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-white/10 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <GripVertical className="w-6 h-6" />
                </div>

                <div className="flex justify-between items-start mb-4">
                    <div className="space-y-1">
                        <Label className="text-lg font-bold">
                            {field.label} {field.required && <span className="text-red-500">*</span>}
                        </Label>
                        {field.helpText && <p className="text-sm text-muted-foreground italic">{field.helpText}</p>}
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onDelete}
                            className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Field Content Visualization */}
                <div className="relative pointer-events-none">
                    <FieldRenderer
                        field={field}
                        selectedDate={previewDate}
                        onDateChange={onDateChange}
                    />
                </div>
            </div>
        </div>
    );
}
