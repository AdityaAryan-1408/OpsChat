import React from 'react';
import { motion } from 'framer-motion';
import { X, Send, Languages } from 'lucide-react';

interface ChatCardProps {
    name: string;
    status: string;
    message: string;
    delay?: number;
    className?: string;
}

export const ChatCard: React.FC<ChatCardProps> = ({ name, status, message, delay = 0, className = "" }) => (
    <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ delay, type: "spring", stiffness: 80, damping: 12 }}
        className={`relative rounded-[32px] bg-white dark:bg-slate-800 p-6 shadow-2xl border border-slate-100 dark:border-slate-700 group ${className}`}
    >
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-400 dark:text-slate-300">
                    {name[0]}
                </div>
                <div>
                    <p className="text-xs font-black text-slate-900 dark:text-white">{name}</p>
                    <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{status}</span>
                    </div>
                </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center">
                <X className="w-3.5 h-3.5 text-slate-300 dark:text-slate-500" />
            </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-4 mb-4 border border-slate-100 dark:border-slate-600">
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed italic">"{message}"</p>
        </div>

        <div className="flex gap-2">
            <div className="flex-1 bg-[#b5f2a1]/10 border border-[#b5f2a1]/20 rounded-xl px-3 py-2 flex items-center gap-2">
                <Languages className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">Translated to ES</span>
            </div>
            <button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-2.5 rounded-xl shadow-lg hover:scale-105 transition-transform">
                <Send className="w-4 h-4" />
            </button>
        </div>
    </motion.div>
);