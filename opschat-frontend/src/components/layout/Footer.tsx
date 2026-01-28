import { Zap, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Footer = () => {
    const navigate = useNavigate();

    const handleGetStarted = () => {
        const isLoggedIn = localStorage.getItem('opschat_email');
        navigate(isLoggedIn ? '/dashboard' : '/auth');
    };

    return (
        <footer className="py-32 bg-white dark:bg-slate-900 px-10 border-t border-slate-100 dark:border-slate-800 transition-colors">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start gap-20 mb-32">
                    <div className="max-w-xl">
                        <div className="flex items-center gap-3 mb-10">
                            <div className="w-10 h-10 bg-[#b5f2a1] rounded-xl flex items-center justify-center">
                                <Zap className="w-6 h-6 text-black fill-black" />
                            </div>
                            <span className="font-black text-3xl text-slate-900 dark:text-white tracking-tighter">OpsChat</span>
                        </div>
                        <h2 className="text-5xl font-black text-slate-900 dark:text-white leading-[1] mb-12 tracking-tight">
                            The high-scale blueprint for your next mission-critical app.
                        </h2>
                        <button
                            onClick={handleGetStarted}
                            className="bg-[#b5f2a1] text-black px-12 py-6 rounded-[24px] font-black text-xl flex items-center gap-3 hover:bg-[#a2e08e] transition-all shadow-xl shadow-[#b5f2a1]/20"
                        >
                            Get Started <ArrowUpRight className="w-6 h-6" />
                        </button>
                    </div>


                </div>

                <div className="pt-16 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-10">
                    <p className="text-slate-400 dark:text-slate-500 text-sm font-bold uppercase tracking-widest">© 2025 OPS_CHAT_SYSTEM • BUILT FOR SCALE</p>
                    <div className="flex gap-12">
                        {['GitHub', 'DockerHub', 'AWS', 'LinkedIn'].map(social => (
                            <a key={social} href="#" className="text-slate-400 dark:text-slate-500 hover:text-black dark:hover:text-white text-sm font-black uppercase tracking-[0.2em] transition-colors">{social}</a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
};