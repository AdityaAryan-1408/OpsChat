import { motion } from 'framer-motion';
import { ArrowUpRight, Database, Cpu, RotateCcw, Mic, Languages } from 'lucide-react';
import { ChatCard } from '../ui/ChatCard';
import { useNavigate } from 'react-router-dom';

export const Hero = () => {
    const navigate = useNavigate();

    const handleGetStarted = () => {
        const isLoggedIn = localStorage.getItem('opschat_username');
        navigate(isLoggedIn ? '/dashboard' : '/auth');
    };

    return (
        <section className="pt-44 pb-32 px-10 relative">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
                <motion.div
                    animate={{ x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 15, repeat: Infinity }}
                    className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#b5f2a1]/10 rounded-full blur-[100px]"
                />
                <motion.div
                    animate={{ x: [0, -40, 0], y: [0, 30, 0], scale: [1, 1.2, 1] }}
                    transition={{ duration: 20, repeat: Infinity, delay: 2 }}
                    className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-400/5 rounded-full blur-[120px]"
                />
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                <div>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm mb-10"
                    >
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Scalable Real-Time Engine</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ type: "spring", stiffness: 50, mass: 1 }}
                        className="text-7xl lg:text-9xl font-black text-slate-900 dark:text-white leading-[0.85] tracking-tighter mb-12"
                    >
                        OpsChat. <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-slate-300 dark:to-white">Scale Effortlessly.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-slate-500 dark:text-slate-400 text-xl max-w-sm leading-relaxed mb-14 font-medium"
                    >
                        High-performance communication powered by Redis-backed horizontal scaling and PostgreSQL persistence.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="flex flex-wrap items-center gap-8"
                    >
                        <button
                            onClick={handleGetStarted}
                            className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-12 py-6 rounded-[24px] font-black text-xl hover:bg-black dark:hover:bg-slate-100 transition-all shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:-translate-y-1.5 active:translate-y-0"
                        >
                            Go to Dashboard
                        </button>
                        <a href="https://github.com/AdityaAryan-1408/OpsChat" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-slate-900 dark:text-white font-black text-xl group relative">
                            GitHub Repo
                            <div className="w-10 h-10 rounded-full border-2 border-slate-900 dark:border-white flex items-center justify-center group-hover:bg-slate-900 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-slate-900 transition-all">
                                <ArrowUpRight className="w-4 h-4" />
                            </div>
                        </a>
                    </motion.div>

                    <div className="mt-24 flex items-center gap-10">
                        <div className="flex gap-3">
                            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                                <Database className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                                <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase">Persistence Ready</span>
                            </div>
                            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                                <Cpu className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                                <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase">AI Workers</span>
                            </div>
                        </div>
                    </div>
                </div>


                <div className="grid grid-cols-2 gap-8 relative lg:ml-16 xl:ml-24">
                    <ChatCard
                        name="Dev_Ops_Bot"
                        status="Analyzing Logs"
                        message="I've summarized the last 50 messages in #production-alerts. High latency detected on node-04."
                        delay={0.2}
                    />
                    <ChatCard
                        name="AI_Translator"
                        status="Translating"
                        message="User connected from Madrid. Switching all workspace streams to Spanish automatically."
                        delay={0.4}
                        className="mt-20"
                    />

                    <div className="absolute -left-20 top-1/2 -translate-y-1/2 flex flex-col gap-8 z-20">
                        {[RotateCcw, Mic, Languages].map((Icon, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1, y: [0, -10, 0] }}
                                transition={{ delay: 0.7 + (i * 0.1), type: "spring", y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 } }}
                                className="w-16 h-16 bg-white dark:bg-slate-800 shadow-2xl rounded-[20px] flex items-center justify-center border border-white dark:border-slate-700 text-slate-400 hover:text-black dark:hover:text-white hover:bg-[#b5f2a1] transition-all cursor-normal hover:scale-110 group"
                            >
                                <Icon className="w-7 h-7" />
                                <div className="absolute inset-0 bg-[#b5f2a1] rounded-[20px] blur-xl opacity-0 group-hover:opacity-40 transition-opacity" />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};