import React from 'react';
import type { LucideProps } from 'lucide-react';

interface BenefitCardProps {
    title: string;
    subtitle: string;
    description: string;
    icon: React.ElementType<LucideProps>;
    className?: string;
}

export const BenefitCard: React.FC<BenefitCardProps> = ({ title, subtitle, description, icon: Icon, className = "" }) => (
    <div
        className={`bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-[#b5f2a1] dark:hover:border-[#b5f2a1]/50 p-12 rounded-[56px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_60px_rgba(181,242,161,0.3)] hover:-translate-y-2 transition-all duration-300 group relative overflow-hidden flex flex-col justify-between min-h-[340px] cursor-pointer ${className}`}
    >
        <div className="absolute -right-12 -top-12 w-40 h-40 bg-[#b5f2a1]/5 rounded-full blur-3xl group-hover:bg-[#b5f2a1]/20 transition-all duration-700" />
        <div>
            <div className="flex items-center gap-4 mb-10">
                <div className="w-14 h-14 bg-slate-50 dark:bg-slate-700 rounded-2xl flex items-center justify-center group-hover:bg-[#b5f2a1] transition-all duration-500 shadow-sm group-hover:rotate-6">
                    {Icon && <Icon className="w-6 h-6 text-slate-400 dark:text-slate-300 group-hover:text-black transition-colors" />}
                </div>
                <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-700 rounded-full border border-slate-100 dark:border-slate-600">
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-300 uppercase tracking-widest">{subtitle}</p>
                </div>
            </div>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white leading-[1.05] mb-6 tracking-tighter">{title}</h3>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-base leading-relaxed max-w-[300px]">{description}</p>
    </div>
);