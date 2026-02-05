"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
    date?: Date;
    onChange?: (date: Date | undefined) => void;
    placeholder?: string;
}

export function DatePicker({ date, onChange, placeholder = "Pick a date" }: DatePickerProps) {
    const [open, setOpen] = React.useState(false);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                        "w-full justify-start text-left font-normal glass border-white/10 hover:bg-white/5 h-10",
                        !date && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4 text-purple-400" />
                    {date ? format(date, "PPP") : <span>{placeholder}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 border-white/20 glass backdrop-blur-lg bg-white/10 dark:bg-black/20" align="start">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(newDate) => {
                        onChange?.(newDate);
                        setOpen(false);
                    }}
                    initialFocus
                    className="p-3"
                    classNames={{
                        day_selected: "bg-purple-600 text-white hover:bg-purple-600 focus:bg-purple-600",
                        day_today: "bg-white/10 text-purple-400",
                        nav_button_previous: "text-white/70 hover:text-white transition-colors",
                        nav_button_next: "text-white/70 hover:text-white transition-colors",
                        head_cell: "text-white/50 font-medium",
                        day: "text-white/90 hover:bg-white/10 rounded-md transition-colors",
                    }}
                />
            </PopoverContent>
        </Popover>
    );
}
