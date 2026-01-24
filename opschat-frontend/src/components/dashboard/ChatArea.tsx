import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, MessageSquare, UserPlus, Hash, User, Activity, Bell, Info,
    MoreVertical, Sparkles, Mic, Send, Paperclip, Check, ChevronRight,
    Terminal, Globe, X, Square
} from 'lucide-react';
import { InputField } from '../ui/InputField';
import type { ViewState } from '../../types';

interface ChatAreaProps {
    activeView: ViewState;
    showAddPerson: boolean;
    setShowAddPerson: (show: boolean) => void;
    socketConnected: boolean; 
}

export const ChatArea: React.FC<ChatAreaProps> = ({
    activeView,
    showAddPerson,
    setShowAddPerson,
    socketConnected
}) => {
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [requestStatus, setRequestStatus] = useState<'sending' | 'success' | null>(null);
    const [selectedLang, setSelectedLang] = useState('EN'); // Language State
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            chunksRef.current = []; 

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                console.log("Audio Blob Created:", blob); 
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Microphone access denied:", err);
            alert("Could not access microphone. Please check permissions.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const cancelRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setAudioBlob(null);
        }
    };

    const handleSendRequest = () => {
        if (!searchQuery) return;
        setRequestStatus('sending');
        setTimeout(() => {
            setRequestStatus('success');
            setTimeout(() => {
                setShowAddPerson(false);
                setRequestStatus(null);
                setSearchQuery('');
            }, 1000);
        }, 1500);
    };

    return (
        <main className="flex-1 flex flex-col relative bg-white dark:bg-slate-900 transition-colors">
            <AnimatePresence mode="wait">
                {!activeView.type ? (
                    <motion.div
                        key="empty"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        className="flex-1 flex flex-col items-center justify-center p-12 text-center"
                    >
                        <div className="w-32 h-32 bg-[#b5f2a1]/10 rounded-full flex items-center justify-center mb-8 relative">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 border-2 border-dashed border-[#b5f2a1]/30 rounded-full"
                            />
                            <MessageSquare className="w-12 h-12 text-[#b5f2a1]" />
                            <motion.div
                                animate={{ y: [-5, 5, -5] }}
                                transition={{ duration: 4, repeat: Infinity }}
                                className="absolute -top-2 -right-2 w-10 h-10 bg-white dark:bg-slate-800 shadow-xl rounded-xl flex items-center justify-center border border-slate-100 dark:border-slate-700"
                            >
                                <Plus className="w-5 h-5 text-slate-900 dark:text-white" />
                            </motion.div>
                        </div>

                        <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-4">No Active Stream</h2>
                        <p className="text-slate-400 dark:text-slate-500 max-w-sm text-lg font-medium leading-relaxed mb-10">
                            Establish a new connection to start collaborating. Click the <span className="text-slate-900 dark:text-white font-black">+ symbol</span> in the sidebar.
                        </p>

                        <button
                            onClick={() => setShowAddPerson(true)}
                            className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-4 rounded-2xl font-black text-sm hover:bg-black dark:hover:bg-slate-100 transition-all shadow-xl flex items-center gap-2 group"
                        >
                            <UserPlus className="w-4 h-4" /> Start Chatting
                        </button>
                    </motion.div>
                ) : (
                    <motion.div
                        key="chat"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex-1 flex flex-col"
                    >
                        <header className="h-20 border-b border-slate-50 dark:border-slate-800 px-8 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
                                    {activeView.type === 'channel' ? <Hash className="w-5 h-5" /> : <User className="w-5 h-5" />}
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                                        {activeView.type === 'channel' ? `#${activeView.id}` : activeView.id}
                                    </h2>
                                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                        {activeView.type === 'channel' ? 'Scalable Cluster Active' : 'Secure P2P Connection'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6">

                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${socketConnected ? 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700' : 'bg-red-50 border-red-100'}`}>
                                    <Activity className={`w-3.5 h-3.5 ${socketConnected ? 'text-green-500' : 'text-red-500'}`} />
                                    <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                        {socketConnected ? 'System Healthy' : 'Disconnected'}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-100 dark:border-slate-700 cursor-pointer">
                                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                                    <select
                                        value={selectedLang}
                                        onChange={(e) => setSelectedLang(e.target.value)}
                                        className="bg-transparent text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest outline-none cursor-pointer appearance-none"
                                    >
                                        <option value="EN">EN</option>
                                        <option value="ES">ES</option>
                                        <option value="FR">FR</option>
                                    </select>
                                </div>

                                <div className="h-6 w-px bg-slate-100 dark:bg-slate-700" />
                                <div className="flex items-center gap-4 text-slate-400 dark:text-slate-500">
                                    <Bell className="w-5 h-5 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors" />
                                    <Info className="w-5 h-5 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors" />
                                    <MoreVertical className="w-5 h-5 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors" />
                                </div>
                            </div>
                        </header>

                        <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#fcfdfe] dark:bg-slate-900/50">
                            <div className="flex justify-center">
                                <div className="bg-slate-900 dark:bg-slate-700 text-white px-4 py-2 rounded-full flex items-center gap-3 text-[10px] font-bold tracking-tight shadow-xl">
                                    <Sparkles className="w-3.5 h-3.5 text-[#b5f2a1]" />
                                    Connection established in #{activeView.id}.
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold">AR</div>
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-black text-slate-900 dark:text-white">Alex Rivera</span>
                                        <span className="text-[9px] font-bold text-slate-300 dark:text-slate-600">10:42 AM</span>
                                    </div>
                                    <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-4 rounded-2xl rounded-tl-none inline-block max-w-xl shadow-sm">
                                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                            I've initialized the horizontal scaling logic for the {activeView.id} stream. All pods reporting healthy status.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {isSummarizing && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#b5f2a1]/10 border border-[#b5f2a1]/20 rounded-3xl p-6 relative overflow-hidden mx-auto max-w-2xl">
                                    <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <Command className="w-3.5 h-3.5" /> Context Summary
                                    </h4>
                                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">
                                        Systems are fully operational. No anomalies detected in current communication flow.
                                    </p>
                                </motion.div>
                            )}
                        </div>

                        <div className="p-8 bg-white dark:bg-slate-900 border-t border-slate-50 dark:border-slate-800">
                            <div className="max-w-4xl mx-auto relative">

                                {isRecording ? (
                                    <div className="w-full bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-3xl py-4 px-6 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                                            <span className="text-sm font-bold text-red-600 dark:text-red-400">Recording Audio...</span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={cancelRecording}
                                                className="p-2 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-full text-slate-500 dark:text-slate-400 transition-colors"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={stopRecording}
                                                className="bg-red-500 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-red-600 transition-colors flex items-center gap-2"
                                            >
                                                <Square className="w-3 h-3 fill-current" /> Stop & Save
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-3 text-slate-300 dark:text-slate-600">
                                            <Plus className="w-5 h-5 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors" />
                                            <div className="h-5 w-px bg-slate-100 dark:bg-slate-700" />
                                            <Paperclip className="w-5 h-5 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors" />
                                        </div>

                                        <input
                                            type="text"
                                            placeholder={`Message ${activeView.type === 'channel' ? '#' + activeView.id : activeView.id}...`}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl py-5 pl-24 pr-32 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#b5f2a1] transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
                                        />

                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
                                            <button
                                                onClick={() => setIsSummarizing(!isSummarizing)}
                                                className={`p-2 rounded-xl transition-all ${isSummarizing ? 'bg-slate-900 dark:bg-white text-[#b5f2a1] dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                                            >
                                                <Sparkles className="w-5 h-5" />
                                            </button>

                                            <button onClick={startRecording}>
                                                <Mic className="w-5 h-5 text-slate-300 dark:text-slate-600 cursor-pointer hover:text-red-500 dark:hover:text-red-400 transition-colors" />
                                            </button>

                                            <button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-3 rounded-xl shadow-xl shadow-slate-200 dark:shadow-none hover:scale-105 active:scale-95 transition-all">
                                                <Send className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showAddPerson && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowAddPerson(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative bg-white dark:bg-slate-800 rounded-[40px] p-10 w-full max-w-sm shadow-2xl border border-slate-100 dark:border-slate-700"
                        >
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter">Request Contact</h3>
                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-8">Establish a secure P2P connection</p>

                            <div className="space-y-6">
                                <InputField
                                    icon={Terminal}
                                    label="Username"
                                    placeholder="alex_devops"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />

                                <button
                                    disabled={requestStatus === 'sending' || requestStatus === 'success'}
                                    onClick={handleSendRequest}
                                    className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-2xl font-black text-sm hover:bg-black dark:hover:bg-slate-100 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                                >
                                    {requestStatus === 'sending' ? 'Connecting...' : requestStatus === 'success' ? 'Request Sent!' : 'Send Request'}
                                    {requestStatus === null && <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                                    {requestStatus === 'success' && <Check className="w-4 h-4 text-[#b5f2a1]" />}
                                </button>

                                <button onClick={() => setShowAddPerson(false)} className="w-full text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest hover:text-slate-900 dark:hover:text-white transition-colors">Cancel</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </main>
    );
};

import { Command } from 'lucide-react';