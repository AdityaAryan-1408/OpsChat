import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Zap, User, Terminal, Activity, ArrowRight, Camera, Upload, Check, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { InputField } from '../ui/InputField';
import { ThemeToggle } from '../ui/ThemeToggle';

export const ProfileSetup = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        age: '',
        gender: 'Prefer not to say'
    });

    const [isChecking, setIsChecking] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const [usernameError, setUsernameError] = useState<string | null>(null);
    const [usernameSuccess, setUsernameSuccess] = useState(false);

    const [selectedAvatar, setSelectedAvatar] = useState<number | null>(1);

    const avatars = [
        { id: 1, color: 'bg-blue-400' },
        { id: 2, color: 'bg-purple-400' },
        { id: 3, color: 'bg-pink-400' },
        { id: 4, color: 'bg-orange-400' },
        { id: 5, color: 'bg-indigo-400' },
        { id: 6, color: 'bg-[#b5f2a1]' },
    ];

    const API_URL = import.meta.env.VITE_API_URL || "";

    const handleContinue = async () => {
        setUsernameError(null);
        setIsChecking(true);

        try {

            const response = await fetch(`${API_URL}/api/check-username`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: formData.username })
            });

            const data = await response.json();

            if (response.ok && data.available) {

                setUsernameSuccess(true);
                setTimeout(() => {
                    setStep(2);
                    setIsChecking(false);
                    setUsernameSuccess(false); 
                }, 800);
            } else {

                setUsernameError(data.error || "Username is not available");
                setIsChecking(false);
            }
        } catch (error) {
            console.error("Network error:", error);
            setUsernameError("Connection failed. Is backend running?");
            setIsChecking(false);
        }
    };


    const handleComplete = async () => {
        setIsRegistering(true);
        const email = localStorage.getItem('opschat_email'); 

        if (!email) {
            alert("Session lost. Please sign up again.");
            navigate('/auth');
            return;
        }

        try {

            const response = await fetch(`${API_URL}/api/update-profile`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: email, 
                    ...formData,
                    avatarId: selectedAvatar
                })
            });

            const data = await response.json();

            if (response.ok) {

                localStorage.setItem('userProfile', JSON.stringify(formData));
                localStorage.setItem('userAvatar', selectedAvatar?.toString() || '1');
                localStorage.setItem('opschat_username', formData.username); 
                navigate('/dashboard');
            } else {
                alert(data.error || "Profile update failed.");
            }
        } catch (error) {
            console.error("Profile network error:", error);
            alert("Failed to update profile. Please check connection.");
        } finally {
            setIsRegistering(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8f9fb] dark:bg-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden transition-colors">
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#b5f2a1]/10 rounded-full blur-[100px] -z-10" />

            <div className="absolute top-6 right-6">
                <ThemeToggle />
            </div>

            <div className="absolute top-6 left-6 flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                <div className="w-10 h-10 bg-[#b5f2a1] rounded-xl flex items-center justify-center shadow-lg">
                    <Zap className="w-6 h-6 text-black fill-black" />
                </div>
                <span className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white">OpsChat</span>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full bg-white dark:bg-slate-800 rounded-[40px] p-10 shadow-2xl border border-slate-100 dark:border-slate-700"
            >
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <p className="text-[10px] font-black text-[#b5f2a1] uppercase tracking-[0.3em] mb-2">Step {step} of 2</p>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                            {step === 1 ? 'Personalize Info' : 'Choose Identity'}
                        </h2>
                    </div>
                    <Zap className="w-6 h-6 text-[#b5f2a1]" />
                </div>

                <AnimatePresence mode="wait">
                    {step === 1 ? (
                        <motion.div
                            key="info"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="space-y-6"
                        >
                            <InputField
                                icon={User}
                                label="Full Name"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />

                            <div>
                                <InputField
                                    icon={Terminal}
                                    label="Unique Username"
                                    placeholder="johndoe_ops"
                                    value={formData.username}
                                    onChange={(e) => {
                                        setFormData({ ...formData, username: e.target.value });
                                        setUsernameError(null);
                                        setUsernameSuccess(false);
                                    }}
                                />
                                <div className="h-6 mt-2 ml-1 flex items-center">
                                    {isChecking && (
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                            <Loader2 className="w-3 h-3 animate-spin" /> Checking availability...
                                        </div>
                                    )}
                                    {usernameError && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-xs font-bold text-red-500">
                                            <AlertCircle className="w-3 h-3" /> {usernameError}
                                        </motion.div>
                                    )}
                                    {usernameSuccess && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-xs font-bold text-green-500">
                                            <CheckCircle2 className="w-3 h-3" /> Username available!
                                        </motion.div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <InputField
                                    icon={Activity}
                                    label="Age"
                                    type="number"
                                    placeholder="25"
                                    value={formData.age}
                                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                />
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Gender</label>
                                    <select
                                        value={formData.gender}
                                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600 rounded-2xl py-4 px-4 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#b5f2a1] transition-all"
                                    >
                                        <option>Male</option>
                                        <option>Female</option>
                                        <option>Non-binary</option>
                                        <option>Prefer not to say</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                disabled={!formData.name || !formData.username || isChecking}
                                onClick={handleContinue}
                                className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-5 rounded-2xl font-black text-lg hover:bg-black dark:hover:bg-slate-100 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isChecking ? 'Verifying...' : 'Continue'}
                                {!isChecking && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="avatar"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="space-y-8"
                        >
                            <div className="flex flex-col items-center">
                                <div className={`w-32 h-32 rounded-full mb-6 flex items-center justify-center text-4xl font-black border-4 border-white dark:border-slate-700 shadow-2xl transition-all ${selectedAvatar ? avatars.find(a => a.id === selectedAvatar)?.color : 'bg-slate-100 dark:bg-slate-700 text-slate-300 dark:text-slate-500'}`}>
                                    {selectedAvatar ? formData.username[0]?.toUpperCase() : <Camera className="w-8 h-8" />}
                                </div>
                                <button className="flex items-center gap-2 text-xs font-black text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors uppercase tracking-widest">
                                    <Upload className="w-3.5 h-3.5" /> Upload Custom Photo
                                </button>
                            </div>

                            <div>
                                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 text-center">Or select from library</p>
                                <div className="grid grid-cols-3 gap-4">
                                    {avatars.map((avatar) => (
                                        <button
                                            key={avatar.id}
                                            onClick={() => setSelectedAvatar(avatar.id)}
                                            className={`h-16 rounded-2xl transition-all relative ${avatar.color} ${selectedAvatar === avatar.id ? 'ring-4 ring-[#b5f2a1] ring-offset-4 dark:ring-offset-slate-800 scale-105' : 'hover:scale-105'}`}
                                        >
                                            {selectedAvatar === avatar.id && <Check className="w-4 h-4 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => {
                                        setStep(1);
                                        setUsernameSuccess(false); 
                                    }}
                                    className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 py-5 rounded-2xl font-black text-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleComplete}
                                    disabled={isRegistering}
                                    className="flex-[2] bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-5 rounded-2xl font-black text-lg hover:bg-black dark:hover:bg-slate-100 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isRegistering ? 'Creating Profile...' : 'Finalize Profile'}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};