import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Check, X, UserPlus, Loader2, Bell } from 'lucide-react';

interface FriendRequest {
    id: number;
    sender: {
        id: number;
        username: string;
        avatar: string | null;
    };
    createdAt: string;
}

const NotificationsPanel: React.FC = () => {
    const [requests, setRequests] = useState<FriendRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState<number | null>(null);

    // Fetch requests
    const fetchRequests = async () => {
        try {
            const userId = localStorage.getItem('userId');
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/friends/pending`, {
                headers: { 'x-user-id': userId }
            });
            setRequests(res.data);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
        // Optional: Set up a polling interval or socket listener here later
    }, []);

    const handleRespond = async (requestId: number, status: 'ACCEPTED' | 'REJECTED') => {
        setProcessingId(requestId);
        try {
            const userId = localStorage.getItem('userId');
            await axios.post(`${import.meta.env.VITE_API_URL}/api/friends/respond`, {
                requestId,
                status
            }, {
                headers: { 'x-user-id': userId }
            });

            // Remove the handled request from the list
            setRequests(prev => prev.filter(req => req.id !== requestId));
        } catch (error) {
            console.error("Failed to respond", error);
        } finally {
            setProcessingId(null);
        }
    };

    if (isLoading) {
        return (
            <div className="p-8 flex justify-center text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin" />
            </div>
        );
    }

    if (requests.length === 0) {
        return (
            <div className="p-8 text-center space-y-3">
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400">
                    <Bell className="w-6 h-6" />
                </div>
                <p className="text-sm text-slate-500 font-medium">No new notifications</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-sm max-h-96 overflow-y-auto">
            <div className="p-4 space-y-3">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
                    Friend Requests
                </h4>

                {requests.map((req) => (
                    <div
                        key={req.id}
                        className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800"
                    >
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 overflow-hidden">
                                {req.sender.avatar ? (
                                    <img src={req.sender.avatar} alt={req.sender.username} className="w-full h-full object-cover" />
                                ) : (
                                    <UserPlus className="w-5 h-5" />
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">
                                    {req.sender.username}
                                </p>
                                <p className="text-[10px] text-slate-500">
                                    wants to connect
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-1">
                            <button
                                onClick={() => handleRespond(req.id, 'ACCEPTED')}
                                disabled={processingId === req.id}
                                className="p-2 bg-[#b5f2a1] hover:bg-[#9de085] text-slate-900 rounded-xl transition-colors disabled:opacity-50"
                                title="Accept"
                            >
                                {processingId === req.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Check className="w-4 h-4" />
                                )}
                            </button>

                            <button
                                onClick={() => handleRespond(req.id, 'REJECTED')}
                                disabled={processingId === req.id}
                                className="p-2 bg-slate-200 dark:bg-slate-700 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 text-slate-500 rounded-xl transition-colors disabled:opacity-50"
                                title="Decline"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NotificationsPanel;