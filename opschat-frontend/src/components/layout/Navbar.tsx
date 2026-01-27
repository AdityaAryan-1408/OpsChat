import { motion } from 'framer-motion';
import { Zap, ArrowUpRight } from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle';
import { useNavigate } from 'react-router-dom';

export const Navbar = () => {
    const navigate = useNavigate();

    const handleGetStarted = () => {
        const isLoggedIn = localStorage.getItem('opschat_username');
        navigate(isLoggedIn ? '/dashboard' : '/auth');
    };

    return (
        <motion.nav
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed top-0 left-0 right-0 z-50 py-6 px-10 flex items-center justify-between pointer-events-none md:pointer-events-auto"
        >
            <div className="flex items-center gap-8 pointer-events-auto">
                <div className="flex items-center gap-2 group cursor-pointer" onClick={() => navigate('/')}>
                    <div className="w-9 h-9 bg-[#b5f2a1] rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-300">
                        <Zap className="w-5 h-5 text-black fill-black" />
                    </div>
                    <span className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white">OpsChat</span>
                </div>
                <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-full border border-white/40 dark:border-slate-700/40 shadow-sm pointer-events-auto">
                    {['Platform', 'Infra', 'Intelligence', 'DevOps'].map((item) => (
                        <a key={item} href={`#${item.toLowerCase()}`} className="px-3 py-1 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-black dark:hover:text-white transition-colors">
                            {item}
                        </a>
                    ))}
                </div>
            </div>
            <div className="flex items-center gap-4 pointer-events-auto">
                <ThemeToggle />
                <button
                    onClick={handleGetStarted}
                    className="bg-[#b5f2a1] text-black px-7 py-3 rounded-full font-black text-sm flex items-center gap-2 hover:bg-[#a2e08e] transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                >
                    Get Started <ArrowUpRight className="w-4 h-4" />
                </button>
            </div>
        </motion.nav>
    );
};