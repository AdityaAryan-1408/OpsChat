import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, MessageSquare, UserPlus, Hash, User, Activity, Bell, Info,
    MoreVertical, Sparkles, Mic, Send, Paperclip, Check, ChevronRight,
    Terminal, Globe, X, Square, Command, Clock, Languages
} from 'lucide-react';
import { InputField } from '../ui/InputField';
import type { ViewState, Workspace } from '../../types';
import { Socket } from 'socket.io-client'; 
import axios from 'axios';

interface ChatAreaProps {
    activeView: ViewState;
    showAddPerson: boolean;
    setShowAddPerson: (show: boolean) => void;
    socketConnected: boolean;
    socket: Socket | null;
    currentWorkspace: Workspace | null;
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
    socketConnected,
    socket,
    currentWorkspace
}) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [messageInput, setMessageInput] = useState("");

    // User Info
    const [username] = useState(() => localStorage.getItem("opschat_username") || "Guest");
    const [userId] = useState(() => localStorage.getItem("opschat_userId") || null);

    // Helper to get channel name from ID
    const getChannelName = () => {
        if (activeView.type === 'channel' && currentWorkspace) {
            const channel = currentWorkspace.channels.find(c => c.id === activeView.id);
            return channel?.name || `Channel ${activeView.id}`;
        }
        return activeView.id?.toString() || 'Unknown';
    };

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // AI & Translation State
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [summaryText, setSummaryText] = useState('');
    const [summaryLoading, setSummaryLoading] = useState(false);
    const [translatedMessages, setTranslatedMessages] = useState<Record<number, string>>({});
    const [translatingId, setTranslatingId] = useState<number | null>(null);
    const [selectedLang, setSelectedLang] = useState('EN');

    // Friend Request State
    const [searchQuery, setSearchQuery] = useState('');
    const [requestStatus, setRequestStatus] = useState<'sending' | 'success' | 'error' | null>(null);
    const [requestMsg, setRequestMsg] = useState('');

    // Media State
    const [isUploading, setIsUploading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [expiryIndex, setExpiryIndex] = useState(0);
    const activeExpiry = EXPIRY_OPTIONS[expiryIndex];

    // 1. Join Channel / Room Logic
    useEffect(() => {
        if (!activeView.id || !socket) return;

        console.log(`Joining channel: ${activeView.id}`);
        setMessages([]); // Clear previous chat

        // Determine room name. For channels, it's usually the ID.
        // For DMs, it might be a composite string.
        const roomName = activeView.type === 'channel'
            ? `channel_${activeView.id}`
            : `dm_${activeView.id}`;

        socket.emit("join_channel", {
            room: roomName,
            channelId: activeView.type === 'channel' ? activeView.id : undefined
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
    }, [activeView.id, socket]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);


    // 2. Send Message Logic
    const handleSendMessage = (content: string, type: 'text' | 'image' | 'file' | 'audio' = 'text') => {
        if (!content.trim() || !socket) return;

        const payload = {
            message: content,
            author: username, 
            channelId: activeView.type === 'channel' ? Number(activeView.id) : null,
            receiverId: activeView.type === 'dm' ? activeView.id : null, // Assuming activeView.id is username for DM for now
            type: type,
            expiresIn: activeExpiry.value > 0 ? activeExpiry.value : null
        };

        socket.emit("send_message", payload);

        if (type === 'text') setMessageInput("");
    };

    // 3. File Upload Logic (Presigned URL)
    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const userId = localStorage.getItem('userId');
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/upload/url`, {
                filename: file.name,
                fileType: file.type
            }, {
                headers: { 'x-user-id': userId }
            });

            const { uploadUrl, fileUrl } = res.data;

            // PUT to S3 directly
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

    // 4. Voice Note Logic
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
            const userId = localStorage.getItem('userId');

            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/upload/url`, {
                filename,
                fileType: 'audio/webm'
            }, {
                headers: { 'x-user-id': userId }
            });

            const { uploadUrl, fileUrl } = res.data;

            await fetch(uploadUrl, {
                method: 'PUT',
                body: blob,
                headers: { 'Content-Type': 'audio/webm' }
            });

            handleSendMessage(fileUrl, 'audio');

        } catch (error) {
            console.error("Audio upload failed:", error);
        } finally {
            setIsUploading(false);
        }
    };

    const toggleExpiry = () => {
        setExpiryIndex((prev) => (prev + 1) % EXPIRY_OPTIONS.length);
    };

    // 5. AI Summarization Logic
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
            const userId = localStorage.getItem('userId');
            const messageTexts = messages.map(m => `${m.author}: ${m.message}`);

            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/ai/summarize`, {
                messages: messageTexts
            }, {
                headers: { 'x-user-id': userId }
            });

            setSummaryText(res.data.summary);
        } catch (error) {
            console.error('Summarization error:', error);
            setSummaryText('Failed to generate summary.');
        } finally {
            setSummaryLoading(false);
        }
    };

    // 6. Real Friend Request Logic
    const handleSendRequest = async () => {
        if (!searchQuery) return;
        setRequestStatus('sending');
        setRequestMsg('');

        try {
            const userId = localStorage.getItem('userId');
            // NOTE: Currently expecting ID. In future, we will add username lookup.
            // For now, assume the user might enter an ID or we need to handle this via Search.
            await axios.post(`${import.meta.env.VITE_API_URL}/api/friends/send`, {
                receiverId: searchQuery // Assuming ID for Phase 2 simplicity
            }, {
                headers: { 'x-user-id': userId }
            });

            setRequestStatus('success');
            setTimeout(() => {
                setShowAddPerson(false);
                setRequestStatus(null);
                setSearchQuery('');
            }, 1500);
        } catch (error: any) {
            setRequestStatus('error');
            setRequestMsg(error.response?.data?.error || 'Failed to send request');
        }
    };

    // 7. Translation Logic
    const handleTranslate = async (messageIndex: number, text: string) => {
        if (translatingId !== null) return;

        const langMap: Record<string, string> = {
            'EN': 'English', 'ES': 'Spanish', 'FR': 'French',
            'DE': 'German', 'HI': 'Hindi', 'JA': 'Japanese', 'ZH': 'Chinese'
        };

        setTranslatingId(messageIndex);

        try {
            const userId = localStorage.getItem('userId');
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/ai/translate`, {
                text,
                lang: langMap[selectedLang] || selectedLang
            }, {
                headers: { 'x-user-id': userId }
            });

            setTranslatedMessages(prev => ({
                ...prev,
                [messageIndex]: res.data.translation
            }));
        } catch (error) {
            console.error('Translation error:', error);
        } finally {
            setTranslatingId(null);
        }
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
                                        {activeView.type === 'channel' ? `#${getChannelName()}` : activeView.id}
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
                                        <option value="EN">EN</option>
                                        <option value="ES">ES</option>
                                        <option value="FR">FR</option>
                                        <option value="DE">DE</option>
                                        <option value="HI">HI</option>
                                        <option value="ZH">ZH</option>
                                    </select>
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
                                                        alt="Attachment"
                                                        className="max-w-full rounded-lg max-h-80 object-contain cursor-pointer"
                                                        onClick={() => window.open(msg.message, '_blank')}
                                                    />
                                                ) : msg.type === 'audio' ? (
                                                    <div className="flex items-center gap-2 min-w-[200px]">
                                                        <audio controls src={msg.message} className="w-full h-8" />
                                                    </div>
                                                ) : msg.type === 'file' ? (
                                                    <a href={msg.message} target="_blank" className="flex items-center gap-2 underline">
                                                        <Paperclip className="w-4 h-4" />
                                                        {msg.message.split('/').pop()}
                                                    </a>
                                                ) : (
                                                    <div>
                                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                                                        {translatedMessages[index] && (
                                                            <p className="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-200 dark:border-slate-600 italic">
                                                                🌐 {translatedMessages[index]}
                                                            </p>
                                                        )}
                                                        <button
                                                            onClick={() => handleTranslate(index, msg.message)}
                                                            className="mt-2 text-[10px] font-bold text-slate-400 hover:text-[#b5f2a1] transition-colors flex items-center gap-1"
                                                        >
                                                            <Languages className="w-3 h-3" /> Translate
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
                                        <span className="text-sm">Analyzing conversation...</span>
                                    ) : (
                                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{summaryText || "Failed to generate summary."}</p>
                                    )}
                                    <button onClick={() => setIsSummarizing(false)} className="absolute top-4 right-4">
                                        <X className="w-4 h-4" />
                                    </button>
                                </motion.div>
                            )}
                        </div>

                        <div className="flex-shrink-0 p-8 bg-white dark:bg-slate-900 border-t border-slate-50 dark:border-slate-800">
                            <div className="max-w-4xl mx-auto relative">
                                {isRecording ? (
                                    <div className="w-full bg-red-50 dark:bg-red-900/20 border border-red-100 rounded-3xl py-4 px-6 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                                            <span className="text-sm font-bold text-red-600">Recording...</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={cancelRecording}><X className="w-5 h-5" /></button>
                                            <button onClick={stopRecording}><Square className="w-3 h-3" /></button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-3 text-slate-300">
                                            <Plus className="w-5 h-5 cursor-pointer" />
                                            <Paperclip onClick={() => fileInputRef.current?.click()} className="w-5 h-5 cursor-pointer hover:text-slate-900 dark:hover:text-white" />
                                            <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
                                        </div>

                                        <input
                                            type="text"
                                            value={messageInput}
                                            onChange={(e) => setMessageInput(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(messageInput)}
                                            placeholder={`Message #${getChannelName()}...`}
                                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl py-5 pl-24 pr-48 text-sm font-medium focus:outline-none focus:border-[#b5f2a1]"
                                        />

                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
                                            <button onClick={toggleExpiry} className={`p-2 rounded-xl ${activeExpiry.color} bg-slate-100 dark:bg-slate-700`}>
                                                <Clock className="w-4 h-4" />
                                            </button>
                                            <button onClick={handleSummarize} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-xl">
                                                <Sparkles className="w-5 h-5" />
                                            </button>
                                            <button onClick={startRecording}>
                                                <Mic className="w-5 h-5 text-slate-300 hover:text-red-500" />
                                            </button>
                                            <button onClick={() => handleSendMessage(messageInput)} className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 p-3 rounded-xl shadow-xl">
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
                    <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="relative bg-white dark:bg-slate-800 rounded-[40px] p-10 w-full max-w-sm shadow-2xl border border-slate-100 dark:border-slate-700"
                        >
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter">Request Contact</h3>
                            <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-8">Establish a secure P2P connection</p>

                            <div className="space-y-6">
                                <InputField
                                    icon={Terminal}
                                    label="User ID"
                                    placeholder="Enter ID (e.g. 2)"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />

                                {requestStatus === 'error' && (
                                    <p className="text-xs text-red-500 font-bold">{requestMsg}</p>
                                )}

                                <button
                                    disabled={requestStatus === 'sending' || requestStatus === 'success'}
                                    onClick={handleSendRequest}
                                    className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-2xl font-black text-sm hover:bg-black dark:hover:bg-slate-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {requestStatus === 'sending' ? 'Connecting...' : requestStatus === 'success' ? 'Request Sent!' : 'Send Request'}
                                    {requestStatus === 'success' && <Check className="w-4 h-4 text-[#b5f2a1]" />}
                                </button>

                                <button onClick={() => setShowAddPerson(false)} className="w-full text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">Cancel</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </main>
    );
};