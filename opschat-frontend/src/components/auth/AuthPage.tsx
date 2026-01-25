import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Zap, CheckCircle2, Database, Server, Mail, Lock, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import { InputField } from '../ui/InputField';
import { fadeInUp, staggerContainer } from '../../utils/animations';
import { ThemeToggle } from '../ui/ThemeToggle';

export const AuthPage = () => {
    const [mode, setMode] = useState<'login' | 'signup'>('login');

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleAuth = async () => {
        
        if (!email || !password) {
            setError("Please fill in all fields");
            return;
        }

        if (mode === 'signup' && password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setIsLoading(true);
        setError(null);

        const endpoint = mode === 'login' ? '/api/login' : '/api/signup';
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                if (mode === 'signup') {
                    
                    localStorage.setItem('opschat_email', email);
                    navigate('/setup');
                } else {
                    
                    localStorage.setItem('opschat_email', data.user.email);

                    if (data.isProfileSetup) {
                        localStorage.setItem('opschat_username', data.user.username);
                        localStorage.setItem('userProfile', JSON.stringify({ name: data.user.username, username: data.user.username }));
                        navigate('/dashboard');
                    } else {
                        navigate('/setup');
                    }
                }
            } else {
                setError(data.error || "Authentication failed");
            }
        } catch (err) {
            console.error(err);
            setError("Connection failed. Is backend running?");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8f9fb] dark:bg-slate-900 font-sans selection:bg-[#b5f2a1] overflow-hidden flex flex-col relative transition-colors">
            
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
                <motion.div
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                    transition={{ duration: 20, repeat: Infinity }}
                    className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-[#b5f2a1]/5 rounded-full blur-[120px]"
                />
            </div>

            <nav className="p-10 flex items-center justify-between">
                <div className="flex items-center gap-2 group cursor-pointer w-fit" onClick={() => navigate('/')}>
                    <div className="w-10 h-10 bg-[#b5f2a1] rounded-xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-300">
                        <Zap className="w-6 h-6 text-black fill-black" />
                    </div>
                    <span className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white">OpsChat</span>
                </div>
                <ThemeToggle />
            </nav>

            <main className="flex-1 flex items-center justify-center px-6 pb-20">
                <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    
                    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="hidden lg:block space-y-12">
                        <div>
                            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-3 py-1 bg-[#b5f2a1]/10 border border-[#b5f2a1]/20 rounded-full mb-6">
                                <CheckCircle2 className="w-3 h-3 text-slate-900 dark:text-white" />
                                <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">System Ready: Node-01 Active</span>
                            </motion.div>
                            <motion.h1 variants={fadeInUp} className="text-6xl font-black text-slate-900 dark:text-white leading-[0.9] tracking-tighter mb-6">
                                Access the <br /> <span className="text-slate-400 dark:text-slate-500">Control Plane.</span>
                            </motion.h1>
                        </div>
                        <motion.div variants={fadeInUp} className="bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl border border-white dark:border-slate-700 p-6 rounded-[32px] shadow-sm max-w-sm">
                            <div className="space-y-4">
                                {[{ label: 'PostgreSQL', val: 'Healthy', icon: Database }, { icon: Server, label: 'Redis Pub/Sub', val: 'Syncing' }].map((stat, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-white/50 dark:bg-slate-700/50 rounded-2xl border border-white/60 dark:border-slate-600">
                                        <div className="flex items-center gap-3">
                                            <stat.icon className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                                            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{stat.label}</span>
                                        </div>
                                        <span className="text-[10px] font-black text-green-600 dark:text-green-400 uppercase">{stat.val}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>

                   
                    <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} className="w-full max-w-md mx-auto">
                        <div className="bg-white dark:bg-slate-800 rounded-[40px] p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-slate-700">

                            
                            <div className="flex gap-8 mb-10 border-b border-slate-50 dark:border-slate-700">
                                <button onClick={() => { setMode('login'); setError(null); }} className={`pb-4 text-sm font-black uppercase tracking-widest relative ${mode === 'login' ? 'text-slate-900 dark:text-white' : 'text-slate-300 dark:text-slate-600'}`}>
                                    Login {mode === 'login' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-[#b5f2a1] rounded-full" />}
                                </button>
                                <button onClick={() => { setMode('signup'); setError(null); }} className={`pb-4 text-sm font-black uppercase tracking-widest relative ${mode === 'signup' ? 'text-slate-900 dark:text-white' : 'text-slate-300 dark:text-slate-600'}`}>
                                    Sign Up {mode === 'signup' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-[#b5f2a1] rounded-full" />}
                                </button>
                            </div>

                            
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <InputField
                                        icon={Mail}
                                        label="Email Address"
                                        type="email"
                                        placeholder="admin@opschat.io"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                    <InputField
                                        icon={Lock}
                                        label="Password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />

                                    
                                    <AnimatePresence>
                                        {mode === 'signup' && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <InputField
                                                    icon={Lock}
                                                    label="Confirm Password"
                                                    type="password"
                                                    placeholder="••••••••"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {error && (
                                    <div className="flex items-center gap-2 text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-100 dark:border-red-900/30">
                                        <AlertCircle className="w-4 h-4" /> {error}
                                    </div>
                                )}

                                <button
                                    onClick={handleAuth}
                                    disabled={isLoading}
                                    className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-5 rounded-2xl font-black text-lg hover:bg-black dark:hover:bg-slate-100 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                                >
                                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : (mode === 'login' ? 'Enter Console' : 'Create Account')}
                                    {!isLoading && <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                                </button>
                            </div>

                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
};