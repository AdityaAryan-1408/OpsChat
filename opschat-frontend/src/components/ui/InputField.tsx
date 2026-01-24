import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface InputFieldProps {
    icon: LucideIcon;
    label: string;
    type?: string;
    placeholder: string;
    value?: string | number;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const InputField: React.FC<InputFieldProps> = ({ icon: Icon, label, type = "text", placeholder, value, onChange }) => (
    <div className="space-y-2 group">
        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
            {label}
        </label>
        <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-[#b5f2a1] transition-colors">
                <Icon className="w-4 h-4" />
            </div>
            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#b5f2a1] focus:ring-4 focus:ring-[#b5f2a1]/10 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
            />
        </div>
    </div>
);