import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { User, Briefcase, FileText, Loader2, UserPlus, MessageSquare } from 'lucide-react';
import axios from 'axios';

interface ViewProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string | number | null;
    onStartDM?: (userId: string | number) => void;
}

interface UserProfile {
    id: number;
    username: string;
    name: string;
    status: string;
    bio: string;
    avatar?: string;
}

const ViewProfileModal: React.FC<ViewProfileModalProps> = ({ isOpen, onClose, userId, onStartDM }) => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            if (!userId || !isOpen) return;

            setIsLoading(true);
            setError('');

            try {
                const currentUserId = localStorage.getItem('userId');
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/${userId}`, {
                    headers: { 'x-user-id': currentUserId }
                });
                setProfile(res.data);
            } catch (err: any) {
                setError(err.response?.data?.error || 'Failed to load profile');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfile();
    }, [userId, isOpen]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="User Profile">
            <div className="space-y-6">
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                    </div>
                ) : error ? (
                    <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium text-center">
                        {error}
                    </div>
                ) : profile ? (
                    <>
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-[#b5f2a1] flex items-center justify-center font-black text-2xl text-slate-900 shadow-lg">
                                {profile.username?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                                    {profile.name || profile.username}
                                </h3>
                                <p className="text-sm text-slate-400 dark:text-slate-500">@{profile.username}</p>
                            </div>
                        </div>

                        {profile.status && (
                            <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                                <Briefcase className="w-5 h-5 text-green-500" />
                                <span className="text-sm font-bold text-green-500">{profile.status}</span>
                            </div>
                        )}

                        {profile.bio && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                                    <FileText className="w-4 h-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">About</span>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                    {profile.bio}
                                </p>
                            </div>
                        )}

                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={() => {
                                    if (onStartDM && profile.id) {
                                        onStartDM(profile.id);
                                        onClose();
                                    }
                                }}
                                className="flex-1 flex items-center justify-center gap-2 bg-[#b5f2a1] hover:bg-[#9de085] text-slate-900 font-bold py-3 rounded-xl transition-all"
                            >
                                <MessageSquare className="w-4 h-4" />
                                <span>Message</span>
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-12 text-slate-400">
                        No profile to display
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default ViewProfileModal;
