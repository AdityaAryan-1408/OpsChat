import { motion } from 'framer-motion';
import { Database, Server, Container, Ship, HardDrive, Brain, Layers, GitBranch } from 'lucide-react';

const techStack = [
    { name: 'POSTGRESQL', icon: Database },
    { name: 'REDIS', icon: Server },
    { name: 'DOCKER', icon: Container },
    { name: 'KUBERNETES', icon: Ship },
    { name: 'MINIO', icon: HardDrive },
    { name: 'GROQ_AI', icon: Brain },
    { name: 'PRISMA', icon: Layers },
    { name: 'GITHUB_ACTIONS', icon: GitBranch },
];

export const LogoMarquee = () => {
    return (
        <div className="py-20 overflow-hidden bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm border-y border-slate-100 dark:border-slate-800 transition-colors">
            <div className="max-w-7xl mx-auto px-10 mb-10">
                <p className="text-center text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">Built for the modern Infrastructure Engineer</p>
            </div>
            <div className="flex whitespace-nowrap">
                {[0, 1].map((key) => (
                    <motion.div
                        key={key}
                        animate={{ x: [0, -1000] }}
                        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                        className="flex items-center gap-20 pr-20"
                    >
                        {techStack.map((tech) => (
                            <div key={tech.name} className="flex items-center gap-4 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-normal group">
                                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-xl flex items-center justify-center group-hover:bg-[#b5f2a1] transition-colors">
                                    <tech.icon className="w-6 h-6 text-slate-500 dark:text-slate-400 group-hover:text-slate-900 transition-colors" />
                                </div>
                                <span className="text-2xl font-black text-slate-400 dark:text-slate-500 tracking-tighter group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{tech.name}</span>
                            </div>
                        ))}
                    </motion.div>
                ))}
            </div>
        </div>
    );
};