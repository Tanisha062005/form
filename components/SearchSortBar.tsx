"use client";

import React from 'react';
import { Search, ArrowUpDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";

interface SearchSortBarProps {
    search: string;
    onSearchChange: (value: string) => void;
    sortBy: string;
    onSortChange: (value: string) => void;
}

export default function SearchSortBar({
    search,
    onSearchChange,
    sortBy,
    onSortChange
}: SearchSortBarProps) {
    return (
        <div className="flex flex-col md:flex-row items-center gap-6 w-full">
            {/* Glowing Search Bar */}
            <div className="relative flex-1 group w-full">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl opacity-20 group-hover:opacity-40 blur transition duration-500"></div>
                <div className="relative flex items-center glass rounded-2xl bg-[#030014]/50 border border-white/10 px-4 h-14">
                    <Search className="w-5 h-5 text-purple-400" />
                    <Input
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Search forms by title or description..."
                        className="border-0 bg-transparent focus-visible:ring-0 text-lg placeholder:text-white/20 h-full w-full shadow-none"
                    />
                </div>
            </div>

            {/* Sort & Filter */}
            <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="flex items-center gap-3 px-4 h-14 glass rounded-2xl border border-white/10 bg-white/5">
                    <ArrowUpDown className="w-4 h-4 text-purple-400" />
                    <Select value={sortBy} onValueChange={onSortChange}>
                        <SelectTrigger className="w-[180px] border-0 bg-transparent focus:ring-0 text-white font-semibold h-full shadow-none">
                            <SelectValue placeholder="Sort By" />
                        </SelectTrigger>
                        <SelectContent className="glass bg-[#030014]/90 border-white/10 text-white rounded-2xl">
                            <SelectItem value="newest" className="focus:bg-purple-500/20 rounded-xl">Newest First</SelectItem>
                            <SelectItem value="oldest" className="focus:bg-purple-500/20 rounded-xl">Oldest First</SelectItem>
                            <SelectItem value="responses" className="focus:bg-purple-500/20 rounded-xl">Most Responses</SelectItem>
                            <SelectItem value="status" className="focus:bg-purple-500/20 rounded-xl">By Status</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
}
