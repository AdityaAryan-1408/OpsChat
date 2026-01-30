import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { InputField } from '../ui/InputField';
import { User, FileText, Loader2, Save, Briefcase } from 'lucide-react';
import axios from 'axios';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentUser: {
        name: string;
        status: string;
        bio: string;
    };
    onSuccess: (updatedUser: any) => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, currentUser, onSuccess }) => {
    const [name, setName] = useState(currentUser.name || '');
    const [status, setStatus] = useState(currentUser.status || '');
    const [bio, setBio] = useState(currentUser.bio || '');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const userId = localStorage.getItem('userId');
            const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/users/profile`, {
                name,
                status,
                bio
            }, {
                headers: { 'x-user-id': userId }
            });

            onSuccess(res.data);
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Profile">
            <form onSubmit={handleSubmit} className="space-y-6">

                <InputField
                    icon={User}
                    label="FULL NAME"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <InputField
                    icon={Briefcase}
                    label="STATUS"
                    placeholder="e.g. DevOps Engineer, AI Lead"
                    value={status}
                    onChange={(e) => setStatus(e.target.value.slice(0, 60))}
                />
                <p className="text-[10px] text-slate-400 dark:text-slate-500 -mt-4 ml-1">
                    A short title displayed below your name ({status.length}/60)
                </p>

                <div className="space-y-2 group">
                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                        BIO
                    </label>
                    <div className="relative">
                        <div className="absolute left-4 top-4 text-slate-400 dark:text-slate-500 group-focus-within:text-[#b5f2a1] transition-colors">
                            <FileText className="w-4 h-4" />
                        </div>
                        <textarea
                            rows={4}
                            value={bio}
                            onChange={(e) => setBio(e.target.value.slice(0, 500))}
                            placeholder="Tell us more about yourself..."
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#b5f2a1] focus:ring-4 focus:ring-[#b5f2a1]/10 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600 resize-none"
                        />
                    </div>
                    <div className="text-right text-xs text-slate-400">
                        {bio.length}/500
                    </div>
                </div>

                {error && (
                    <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#b5f2a1] hover:bg-[#9de085] disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 font-bold py-4 rounded-2xl transition-all flex items-center justify-center space-x-2"
                >
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <>
                            <span>Save Changes</span>
                            <Save className="w-5 h-5" />
                        </>
                    )}
                </button>
            </form>
        </Modal>
    );
};

export default EditProfileModal;
