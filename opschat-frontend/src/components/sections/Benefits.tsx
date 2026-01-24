import { motion } from 'framer-motion';
import { ArrowUpRight, Server, RotateCcw, Lock, Activity } from 'lucide-react';
import { BenefitCard } from '../ui/BenefitCard';
import { popUpSpring } from '../../utils/animations.ts';

export const Benefits = () => {
    return (
        <>
            <section className="py-56 bg-white dark:bg-slate-900 transition-colors">
                <div className="max-w-6xl mx-auto px-10 text-center">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={popUpSpring}>
                        <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white leading-[1.05] tracking-tighter">
                            <span className="text-slate-300 dark:text-slate-600">Stateless. Scalable. Persistent.</span>
                            <br className="hidden md:block" />
                            Built for <span className="relative inline-block px-4 py-1 mx-2">
                                <span className="relative z-10">high-availability</span>
                                <motion.span initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} transition={{ duration: 0.8, delay: 0.5 }} className="absolute inset-0 bg-[#b5f2a1] -rotate-1 origin-left rounded-xl" />
                            </span>
                            deployment in any Kubernetes cluster.
                        </h2>
                    </motion.div>
                </div>
            </section>

            <section className="py-48 bg-[#f1f3f6] dark:bg-slate-800 transition-colors" id="benefits">
                <div className="max-w-7xl mx-auto px-10">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-28 gap-6">
                        <div className="max-w-lg">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-3 h-3 bg-[#b5f2a1] rounded-full animate-pulse" />
                                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em]">ops excellence</span>
                            </div>
                            <h2 className="text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.8] mb-8">System <br /> <span className="text-slate-400 dark:text-slate-500">Resilience.</span></h2>
                        </div>
                        <button className="flex items-center gap-3 font-black text-slate-900 dark:text-white hover:text-green-600 dark:hover:text-[#b5f2a1] transition-all hover:translate-x-2 pb-2 border-b-2 border-slate-900 dark:border-white">
                            Technical Docs <ArrowUpRight className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-start">
                        <BenefitCard
                            subtitle="scaling"
                            title="Horizontal Scaling"
                            icon={Server}
                            description="Deploy across multiple pods using Redis Pub/Sub. Handle thundering herd events with zero message loss."
                        />
                        <BenefitCard
                            subtitle="deployment"
                            title="GitOps CD"
                            icon={RotateCcw}
                            className="mt-16 md:mt-24"
                            description="Continuous delivery via ArgoCD ensures new versions are deployed automatically from your ECR image store."
                        />
                        <BenefitCard
                            subtitle="security"
                            title="Zero-Trust Auth"
                            icon={Lock}
                            description="OAuth login, self-destructing messages, and private workspace segregation via Socket.io rooms."
                        />
                        <BenefitCard
                            subtitle="monitoring"
                            title="Real-Time Health"
                            icon={Activity}
                            className="mt-16 md:mt-24"
                            description="Dedicated /health and /ready endpoints integrated with Prometheus and Grafana for full observability."
                        />
                    </div>
                </div>
            </section>
        </>
    );
};