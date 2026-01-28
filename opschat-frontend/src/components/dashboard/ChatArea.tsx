import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, MessageSquare, UserPlus, Hash, User, Activity, Bell, Info,
    MoreVertical, Sparkles, Mic, Send, Paperclip, Check, ChevronRight,
    Terminal, Globe, X, Square, Command, Clock, Languages
} from 'lucide-react';
import { InputField } from '../ui/InputField';
import type { ViewState } from '../../types';
import { socket } from '../../socket';

interface ChatAreaProps {
    activeView: ViewState;
    showAddPerson: boolean;
    setShowAddPerson: (show: boolean) => void;
    socketConnected: boolean;
}

interface Message {
    id: string;
    channelId?: number;
    room?: string;
    author: string;
    message: string;
    time: string;
    type?: 'text' | 'image' | 'file' | 'audio';
}


const EXPIRY_OPTIONS = [
    { label: 'Off', value: 0, color: 'text-slate-400' },
    { label: '10s', value: 10, color: 'text-red-500' },
    { label: '1m', value: 60, color: 'text-orange-500' },
    { label: '1h', value: 3600, color: 'text-yellow-500' },
];

export const ChatArea: React.FC<ChatAreaProps> = ({
    activeView,
    showAddPerson,
    setShowAddPerson,
    socketConnected
}) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [messageInput, setMessageInput] = useState("");


    const [username] = useState(() => localStorage.getItem("opschat_username") || "Guest");

    const messagesEndRef = useRef<HTMLDivElement>(null);


    const [isSummarizing, setIsSummarizing] = useState(false);
    const [summaryText, setSummaryText] = useState('');
    const [summaryLoading, setSummaryLoading] = useState(false);
    const [translatedMessages, setTranslatedMessages] = useState<Record<number, string>>({});
    const [translatingId, setTranslatingId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [requestStatus, setRequestStatus] = useState<'sending' | 'success' | null>(null);
    const [selectedLang, setSelectedLang] = useState('EN');
    const [isUploading, setIsUploading] = useState(false);


    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);


    const [expiryIndex, setExpiryIndex] = useState(0);
    const activeExpiry = EXPIRY_OPTIONS[expiryIndex];


    useEffect(() => {
        if (!activeView.id) return;

        console.log(`Joining channel: ${activeView.id}`);
        setMessages([]);

        if (!socket.connected) socket.connect();

        socket.emit("join_channel", {
            channelName: activeView.id,
            workspaceId: 1
        });

        const handleReceiveMessage = (data: Message) => {
            setMessages((prev) => [...prev, data]);
        };

        const handleLoadHistory = (history: Message[]) => {
            console.log("History loaded:", history.length);
            setMessages(history);
        };

        const handleError = (err: string) => {
            console.error("Socket Error:", err);

        };

        socket.on("receive_message", handleReceiveMessage);
        socket.on("load_history", handleLoadHistory);
        socket.on("error", handleError);

        return () => {
            socket.off("receive_message", handleReceiveMessage);
            socket.off("load_history", handleLoadHistory);
            socket.off("error", handleError);
        }
    }, [activeView.id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);


    const handleSendMessage = (content: string, type: 'text' | 'image' | 'file' | 'audio' = 'text') => {
        if (!content.trim()) return;

        const payload = {
            message: content,
            author: username,
            channelName: activeView.id,
            type: type,
            expiresIn: activeExpiry.value > 0 ? activeExpiry.value : null
        };

        socket.emit("send_message", payload);
        if (type === 'text') setMessageInput("");
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

            const res = await fetch(`${API_URL}/api/upload-url`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename: file.name, fileType: file.type })
            });

            if (!res.ok) throw new Error("Failed to get upload URL");
            const { uploadUrl, fileUrl } = await res.json();

            await fetch(uploadUrl, {
                method: 'PUT',
                body: file,
                headers: { 'Content-Type': file.type }
            });

            const type = file.type.startsWith('image/') ? 'image' : 'file';
            handleSendMessage(fileUrl, type);

        } catch (error) {
            console.error("Upload error:", error);
            alert("Failed to upload file");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };


    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            chunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorderRef.current.onstop = async () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                setAudioBlob(blob);
                stream.getTracks().forEach(track => track.stop());
                await handleAudioUpload(blob);
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Microphone access denied:", err);
            alert("Could not access microphone.");
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
            chunksRef.current = [];
            setIsRecording(false);
            setAudioBlob(null);
        }
    };

    const handleAudioUpload = async (blob: Blob) => {
        setIsUploading(true);
        try {
            const filename = `voice-note-${Date.now()}.webm`;
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

            const res = await fetch(`${API_URL}/api/upload-url`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename, fileType: 'audio/webm' })
            });

            if (!res.ok) throw new Error("Failed to get upload URL");
            const { uploadUrl, fileUrl } = await res.json();

            await fetch(uploadUrl, {
                method: 'PUT',
                body: blob,
                headers: { 'Content-Type': 'audio/webm' }
            });

            handleSendMessage(fileUrl, 'audio');

        } catch (error) {
            console.error("Audio upload failed:", error);
            alert("Failed to send voice note");
        } finally {
            setIsUploading(false);
        }
    };

    const toggleExpiry = () => {
        setExpiryIndex((prev) => (prev + 1) % EXPIRY_OPTIONS.length);
    };

    const handleSummarize = async () => {
        if (messages.length === 0) {
            setSummaryText('No messages to summarize.');
            setIsSummarizing(true);
            return;
        }

        setIsSummarizing(true);
        setSummaryLoading(true);
        setSummaryText('');

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const messageTexts = messages.map(m => `${m.author}: ${m.message}`);

            const res = await fetch(`${API_URL}/api/ai/summarize`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: messageTexts })
            });

            if (!res.ok) throw new Error('Summarization failed');
            const data = await res.json();
            setSummaryText(data.summary);
        } catch (error) {
            console.error('Summarization error:', error);
            setSummaryText('Failed to generate summary. Please try again.');
        } finally {
            setSummaryLoading(false);
        }
    };

    const handleTranslate = async (messageIndex: number, text: string) => {
        if (translatingId !== null) return; 

        const langMap: Record<string, string> = {
            'EN': 'English',
            'ES': 'Spanish',
            'FR': 'French',
            'DE': 'German',
            'HI': 'Hindi',
            'JA': 'Japanese',
            'ZH': 'Chinese'
        };

        setTranslatingId(messageIndex);

        try {
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const res = await fetch(`${API_URL}/api/ai/translate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, lang: langMap[selectedLang] || selectedLang })
            });

            if (!res.ok) throw new Error('Translation failed');
            const data = await res.json();

            setTranslatedMessages(prev => ({
                ...prev,
                [messageIndex]: data.translation
            }));
        } catch (error) {
            console.error('Translation error:', error);
        } finally {
            setTranslatingId(null);
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
        <main className="flex-1 flex flex-col relative bg-white dark:bg-slate-900 transition-colors h-full overflow-hidden">
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
                        className="flex-1 flex flex-col h-full overflow-hidden"
                    >
                        <header className="h-20 flex-shrink-0 border-b border-slate-50 dark:border-slate-800 px-8 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-10">
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

                                <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-100 dark:border-slate-700">
                                    <Globe className="w-3.5 h-3.5 text-slate-400" />
                                    <select
                                        value={selectedLang}
                                        onChange={(e) => setSelectedLang(e.target.value)}
                                        className="bg-transparent text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest outline-none cursor-pointer pr-2"
                                    >
                                        <option value="EN">EN - English</option>
                                        <option value="ES">ES - Spanish</option>
                                        <option value="FR">FR - French</option>
                                        <option value="DE">DE - German</option>
                                        <option value="HI">HI - Hindi</option>
                                        <option value="JA">JA - Japanese</option>
                                        <option value="ZH">ZH - Chinese</option>
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

                            {messages.map((msg, index) => {
                                const isMe = msg.author === username;
                                return (
                                    <div key={index} className={`flex gap-4 ${isMe ? 'flex-row-reverse' : ''}`}>
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${isMe
                                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                                            : 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300'
                                            }`}>
                                            {isMe ? 'ME' : msg.author.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div className={`flex-1 space-y-2 ${isMe ? 'flex flex-col items-end' : ''}`}>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-black text-slate-900 dark:text-white">{msg.author}</span>
                                                <span className="text-[9px] font-bold text-slate-300 dark:text-slate-600">{msg.time}</span>
                                            </div>
                                            <div className={`${isMe
                                                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-tr-none'
                                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-tl-none border border-slate-100 dark:border-slate-700'
                                                } p-4 rounded-2xl inline-block max-w-xl shadow-sm overflow-hidden`}>
                                                {msg.type === 'image' ? (
                                                    <img
                                                        src={msg.message}
                                                        alt="Uploaded attachment"
                                                        className="max-w-full rounded-lg max-h-80 object-contain cursor-pointer hover:opacity-90 transition-opacity"
                                                        onClick={() => window.open(msg.message, '_blank')}
                                                    />
                                                ) : msg.type === 'audio' ? (

                                                    <div className="flex items-center gap-2 min-w-[200px] text-slate-900 dark:text-slate-900">
                                                        <audio controls src={msg.message} className="w-full h-8" />
                                                    </div>
                                                ) : msg.type === 'file' ? (
                                                    <a
                                                        href={msg.message}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-2 underline break-all"
                                                    >
                                                        <Paperclip className="w-4 h-4" />
                                                        {msg.message.split('/').pop()}
                                                    </a>
                                                ) : (
                                                    <div className="group/msg">
                                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                                            {msg.message}
                                                        </p>
                                                        {translatedMessages[index] && (
                                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 pt-2 border-t border-slate-200 dark:border-slate-600 italic">
                                                                🌐 {translatedMessages[index]}
                                                            </p>
                                                        )}
                                                        <button
                                                            onClick={() => handleTranslate(index, msg.message)}
                                                            disabled={translatingId === index}
                                                            className={`mt-2 flex items-center gap-1 text-[10px] font-bold text-slate-400 hover:text-[#b5f2a1] transition-colors ${translatingId === index ? 'opacity-50' : ''}`}
                                                        >
                                                            {translatingId === index ? (
                                                                <>
                                                                    <div className="w-3 h-3 border border-[#b5f2a1] border-t-transparent rounded-full animate-spin" />
                                                                    Translating...
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Languages className="w-3 h-3" />
                                                                    Translate to {selectedLang}
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />

                            {isSummarizing && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#b5f2a1]/10 border border-[#b5f2a1]/20 rounded-3xl p-6 relative overflow-hidden mx-auto max-w-2xl">
                                    <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <Command className="w-3.5 h-3.5" /> AI Summary
                                    </h4>
                                    {summaryLoading ? (
                                        <div className="flex items-center gap-2 text-slate-500">
                                            <div className="w-4 h-4 border-2 border-[#b5f2a1] border-t-transparent rounded-full animate-spin" />
                                            <span className="text-sm">Analyzing conversation...</span>
                                        </div>
                                    ) : summaryText ? (
                                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                            {summaryText}
                                        </p>
                                    ) : (
                                        <p className="text-sm text-slate-500 italic">
                                            Click the sparkles button to summarize the chat.
                                        </p>
                                    )}
                                    <button
                                        onClick={() => { setIsSummarizing(false); setSummaryText(''); }}
                                        className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 dark:hover:text-white"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </motion.div>
                            )}
                        </div>


                        <div className="flex-shrink-0 p-8 bg-white dark:bg-slate-900 border-t border-slate-50 dark:border-slate-800">
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
                                            <Paperclip
                                                onClick={() => fileInputRef.current?.click()}
                                                className="w-5 h-5 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors"
                                            />
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleFileSelect}
                                                className="hidden"
                                                accept="image/*,.pdf,.doc,.docx,.txt"
                                            />
                                        </div>

                                        <input
                                            type="text"
                                            value={messageInput}
                                            onChange={(e) => setMessageInput(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(messageInput)}
                                            placeholder={`Message ${activeView.type === 'channel' ? '#' + activeView.id : activeView.id}...`}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl py-5 pl-24 pr-48 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#b5f2a1] transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
                                        />

                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">


                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={toggleExpiry}
                                                    className={`p-2 rounded-xl transition-all flex items-center gap-1 ${activeExpiry.color} bg-slate-100 dark:bg-slate-700 hover:brightness-95`}
                                                    title={`Self-destruct: ${activeExpiry.label}`}
                                                >
                                                    <Clock className="w-4 h-4" />
                                                    {activeExpiry.value > 0 && <span className="text-[10px] font-black">{activeExpiry.label}</span>}
                                                </button>
                                            </div>

                                            <button
                                                onClick={handleSummarize}
                                                disabled={summaryLoading}
                                                className={`p-2 rounded-xl transition-all ${isSummarizing ? 'bg-slate-900 dark:bg-white text-[#b5f2a1] dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white'} ${summaryLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                title="AI Summarize"
                                            >
                                                <Sparkles className="w-5 h-5" />
                                            </button>

                                            <button onClick={startRecording}>
                                                <Mic className="w-5 h-5 text-slate-300 dark:text-slate-600 cursor-pointer hover:text-red-500 dark:hover:text-red-400 transition-colors" />
                                            </button>

                                            <button
                                                onClick={() => handleSendMessage(messageInput)}
                                                className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-3 rounded-xl shadow-xl shadow-slate-200 dark:shadow-none hover:scale-105 active:scale-95 transition-all">
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