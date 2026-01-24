import { motion } from 'framer-motion';

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
                        {['POSTGRESQL', 'REDIS', 'DOCKER', 'KUBERNETES', 'AWS', 'OPENAI', 'PRISMA', 'ARGO_CD'].map((tech) => (
                            <div key={tech} className="flex items-center gap-4 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer">
                                <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                                <span className="text-2xl font-black text-slate-400 dark:text-slate-500 tracking-tighter">{tech}</span>
                            </div>
                        ))}
                    </motion.div>
                ))}
            </div>
        </div>
    );
};