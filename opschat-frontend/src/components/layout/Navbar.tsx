import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, ArrowUpRight, Bell, User as UserIcon } from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle';
import { useNavigate, useLocation } from 'react-router-dom';
import NotificationsPanel from '../dashboard/NotificationsPanel';
import EditProfileModal from '../profile/EditProfileModal';

// Define props to allow passing user data when in Dashboard mode
interface NavbarProps {
    userProfile?: {
        name: string;
        username: string;
        status: string;
        bio: string;
        avatar?: string;
    };
    onProfileUpdate?: (user: any) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ userProfile, onProfileUpdate }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const isDashboard = location.pathname.includes('/dashboard');

    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);

    const handleGetStarted = () => {
        const isLoggedIn = localStorage.getItem('userId');
        navigate(isLoggedIn ? '/dashboard' : '/auth');
    };

    const currentUser = userProfile || { name: '', username: '', status: '', bio: '', avatar: null };

    return (
        <>
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

                    {!isDashboard && (
                        <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-full border border-white/40 dark:border-slate-700/40 shadow-sm pointer-events-auto">
                            {['Platform', 'Infra', 'Intelligence', 'DevOps'].map((item) => (
                                <a key={item} href={`#${item.toLowerCase()}`} className="px-3 py-1 text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-black dark:hover:text-white transition-colors">
                                    {item}
                                </a>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-4 pointer-events-auto">
                    <ThemeToggle />

                    {isDashboard ? (
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <button
                                    onClick={() => setShowNotifications(!showNotifications)}
                                    className={`p-3 rounded-full transition-all ${showNotifications
                                        ? 'bg-[#b5f2a1] text-black shadow-md shadow-[#b5f2a1]/20'
                                        : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white shadow-sm'
                                        }`}
                                >
                                    <Bell className="w-5 h-5" />
                                </button>

                                <AnimatePresence>
                                    {showNotifications && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden z-50"
                                        >
                                            <NotificationsPanel />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <button
                                onClick={() => setShowProfileModal(true)}
                                className="w-11 h-11 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700 hover:border-[#b5f2a1] transition-all overflow-hidden"
                            >
                                {currentUser.avatar ? (
                                    <img src={currentUser.avatar} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400">
                                        <UserIcon className="w-5 h-5" />
                                    </div>
                                )}
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={handleGetStarted}
                            className="bg-[#b5f2a1] text-black px-7 py-3 rounded-full font-black text-sm flex items-center gap-2 hover:bg-[#a2e08e] transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                        >
                            Get Started <ArrowUpRight className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </motion.nav>

            {isDashboard && (
                <EditProfileModal
                    isOpen={showProfileModal}
                    onClose={() => setShowProfileModal(false)}
                    currentUser={currentUser}
                    onSuccess={(updatedUser) => {
                        if (onProfileUpdate) onProfileUpdate(updatedUser);
                    }}
                />
            )}
        </>
    );
};