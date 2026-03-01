"use client";

import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";

interface UseFormAutoSaveProps {
    formId: string;
    values: Record<string, unknown>;
    reset: (values: Record<string, unknown>) => void;
}

export function useFormAutoSave({ formId, values, reset }: UseFormAutoSaveProps) {
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const isMounted = useRef(false);
    const initialLoadDone = useRef(false);

    const storageKey = `formflow_draft_${formId}`;

    // 1. Initial Load: Check for existing draft and merge it with default form values
    useEffect(() => {
        isMounted.current = true;

        try {
            const savedDraft = localStorage.getItem(storageKey);
            if (savedDraft) {
                const parsedDraft = JSON.parse(savedDraft);

                // Set the form values, ensuring we don't accidentally overwrite with empty defaults immediately
                reset(parsedDraft);

                toast.success("Welcome back! Your progress has been restored.", {
                    className: "glass bg-white/5 border-white/10 text-white backdrop-blur-xl",
                    duration: 4000
                });
            }
        } catch (error) {
            console.error("Failed to restore form draft:", error);
        } finally {
            // Give a slight delay before enabling auto-save so we don't immediately re-save the loaded draft
            setTimeout(() => {
                initialLoadDone.current = true;
            }, 500);
        }

        return () => {
            isMounted.current = false;
        };
        // We purposefully only want this to run on mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formId, storageKey]);

    // 2. Debounced Save Logic
    useEffect(() => {
        if (!initialLoadDone.current) return;

        // Ensure we actually have data to save, and it isn't completely empty
        const hasValues = Object.values(values).some(
            val => val !== undefined && val !== null && val !== "" && (!Array.isArray(val) || val.length > 0)
        );

        if (!hasValues) return;

        const timer = setTimeout(() => {
            try {
                localStorage.setItem(storageKey, JSON.stringify(values));
                setLastSaved(new Date());
            } catch (error) {
                console.error("Failed to save form draft:", error);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [values, storageKey]);

    // 3. Cleanup Method
    const clearDraft = () => {
        try {
            localStorage.removeItem(storageKey);
            setLastSaved(null);
        } catch (error) {
            console.error("Failed to clear form draft:", error);
        }
    };

    return { lastSaved, clearDraft };
}
