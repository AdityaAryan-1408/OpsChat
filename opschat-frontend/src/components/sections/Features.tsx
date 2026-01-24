import { motion } from 'framer-motion';
import { Server, Database, Cloud, Sparkles, Languages } from 'lucide-react';
import { popUpSpring } from '../../utils/animations.ts';

export const Features = () => {
    return (
        <section className="py-40 px-10" id="features">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row items-end justify-between mb-28 gap-8">
                    <h2 className="text-8xl lg:text-[10rem] font-black text-slate-900 dark:text-white tracking-tighter leading-[0.75]">
                        Core <br /> Engine
                    </h2>
                    <div className="max-w-xs mb-6 text-right">
                        <div className="flex items-center gap-2 mb-4 justify-end">
                            <Server className="w-5 h-5 text-[#b5f2a1]" />
                            <span className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Back-end Specs</span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-xl font-medium leading-relaxed">
                            Horizontal scaling via Redis Pub/Sub adapter allows thousands of parallel connections across pods.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6 max-w-4xl mx-auto">
                    {/* Left Column */}
                    <div className="flex flex-col gap-6 flex-1">
                        <motion.div variants={popUpSpring} initial="hidden" whileInView="visible" viewport={{ once: true }} className="bg-white dark:bg-slate-800 p-10 rounded-[48px] border border-slate-100 dark:border-slate-700 hover:border-[#b5f2a1] dark:hover:border-[#b5f2a1]/50 flex flex-col justify-between min-h-[280px] shadow-sm hover:shadow-[0_20px_60px_rgba(181,242,161,0.25)] hover:-translate-y-2 transition-all duration-300 relative overflow-hidden group cursor-pointer">
                            <div className="flex items-center gap-2">
                                <Database className="w-6 h-6 text-[#b5f2a1]" />
                                <span className="font-black text-slate-900 dark:text-white text-xs tracking-tighter">PostgreSQL History</span>
                            </div>
                            <div>
                                <p className="text-5xl font-black text-slate-900 dark:text-white mb-3 tracking-tighter">5k/s</p>
                                <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Message Throughput</p>
                            </div>
                        </motion.div>

                        <motion.div variants={popUpSpring} initial="hidden" whileInView="visible" viewport={{ once: true }} className="bg-white dark:bg-slate-800 p-8 rounded-[40px] border border-slate-100 dark:border-slate-700 hover:border-[#b5f2a1] dark:hover:border-[#b5f2a1]/50 shadow-sm hover:shadow-[0_20px_60px_rgba(181,242,161,0.25)] hover:-translate-y-2 transition-all duration-300 group cursor-pointer">
                            <div className="w-10 h-10 bg-[#b5f2a1]/10 rounded-[14px] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Sparkles className="w-5 h-5 text-black dark:text-[#b5f2a1]" />
                            </div>
                            <h4 className="text-xl font-black text-slate-900 dark:text-white mb-3 tracking-tighter">AI Summarization</h4>
                            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-medium">Async workers automatically summarize channel history on command.</p>
                        </motion.div>
                    </div>

                    {/* Right Column (Offset) */}
                    <div className="flex flex-col gap-6 flex-1 md:mt-12">
                        <motion.div variants={popUpSpring} initial="hidden" whileInView="visible" viewport={{ once: true }} className="relative rounded-[48px] overflow-hidden bg-slate-800 dark:bg-slate-700 border border-slate-700 dark:border-[#b5f2a1]/30 hover:border-[#b5f2a1] min-h-[280px] group shadow-lg hover:shadow-[0_20px_60px_rgba(181,242,161,0.3)] hover:-translate-y-2 transition-all duration-300 flex items-center justify-center p-8 text-center cursor-pointer">
                            <div className="relative z-10">
                                <Cloud className="w-14 h-14 text-[#b5f2a1] mx-auto mb-6" />
                                <h3 className="text-2xl font-black text-white mb-3 tracking-tighter">S3 Media Sync</h3>
                                <p className="text-slate-400 font-bold text-xs">Voice notes and file uploads handled via encrypted presigned URLs.</p>
                            </div>
                        </motion.div>

                        <motion.div variants={popUpSpring} initial="hidden" whileInView="visible" viewport={{ once: true }} className="bg-slate-800 dark:bg-slate-700 border border-slate-700 dark:border-[#b5f2a1]/30 hover:border-[#b5f2a1] p-8 rounded-[40px] text-white shadow-lg hover:shadow-[0_20px_60px_rgba(181,242,161,0.3)] hover:-translate-y-2 transition-all duration-300 relative overflow-hidden group cursor-pointer">
                            <div className="flex items-center gap-2 mb-6">
                                <Languages className="w-6 h-6 text-[#b5f2a1]" />
                                <span className="font-black text-xs tracking-widest uppercase">Global Multi-Tenancy</span>
                            </div>
                            <h4 className="text-xl font-black mb-3 tracking-tighter">Real-time Translation</h4>
                            <p className="text-slate-400 text-sm leading-relaxed font-medium">Middleware-driven translation for global workspace collaboration.</p>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};