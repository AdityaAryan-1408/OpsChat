import { motion } from 'framer-motion';
import { Zap, Database, Server, Cloud, Cpu } from 'lucide-react';
import { popUpSpring } from '../../utils/animations.ts';

export const OrbitFeatures = () => {
    return (
        <section className="py-56 relative overflow-hidden bg-white dark:bg-slate-900 transition-colors">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-[#b5f2a1]/5 rounded-full blur-[150px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-10 flex flex-col items-center text-center">
                <div className="relative w-80 h-80 md:w-[500px] md:h-[500px] mb-32">
                    
                    <div className="absolute inset-0 border-2 border-slate-200 dark:border-slate-600 rounded-full" />
                    <div className="absolute inset-16 border-2 border-slate-200 dark:border-slate-600 rounded-full" />
                    <div className="absolute inset-32 border-2 border-slate-200 dark:border-slate-600 rounded-full" />

                    <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div whileHover={{ scale: 1.1, rotate: 5 }} className="w-32 h-32 bg-[#b5f2a1] rounded-[32px] flex items-center justify-center shadow-[0_30px_80px_rgba(181,242,161,0.6)] z-10 cursor-pointer group">
                            <Zap className="w-14 h-14 text-black group-hover:scale-110 transition-transform fill-black" />
                        </motion.div>
                    </div>

                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} className="absolute inset-0">
                        {[
                            { icon: Database, color: 'text-blue-600', pos: 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2', label: 'Postgres' },
                            { icon: Server, color: 'text-red-500', pos: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2', label: 'Redis' },
                            { icon: Cloud, color: 'text-orange-500', pos: 'left-0 top-1/2 -translate-x-1/2 -translate-y-1/2', label: 'S3 Storage' },
                            { icon: Cpu, color: 'text-purple-600', pos: 'right-0 top-1/2 translate-x-1/2 -translate-y-1/2', label: 'AI Worker' }
                        ].map((item, idx) => (
                            <div key={idx} className={`absolute ${item.pos} w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl flex items-center justify-center ${item.color} border border-slate-50 dark:border-slate-700 hover:scale-125 transition-transform cursor-pointer group`}>
                                <item.icon className="w-8 h-8" />
                                <span className="absolute -bottom-8 opacity-0 group-hover:opacity-100 text-[8px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest transition-opacity">{item.label}</span>
                            </div>
                        ))}
                    </motion.div>
                </div>

                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={popUpSpring}>
                    <h2 className="text-7xl font-black text-slate-900 dark:text-white mb-10 tracking-tighter">Unified Infrastructure.</h2>
                    <p className="text-slate-400 dark:text-slate-500 max-w-2xl text-2xl mb-16 font-medium leading-relaxed">
                        Provisioned via Terraform. Deployed via GitOps. <br />OpsChat is the blueprint for modern enterprise collaboration.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-6 justify-center">
                        <button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-12 py-6 rounded-[24px] font-black text-xl hover:bg-black dark:hover:bg-slate-100 transition-all shadow-2xl">Start LocalStack Sim</button>
                        <button className="bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white px-12 py-6 rounded-[24px] font-black text-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">Terraform Specs</button>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};