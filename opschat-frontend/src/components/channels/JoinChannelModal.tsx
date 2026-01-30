import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { InputField } from '../ui/InputField';
import { Key, Loader2, ArrowRight } from 'lucide-react';
import axios from 'axios';

interface JoinChannelModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const JoinChannelModal: React.FC<JoinChannelModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [inviteCode, setInviteCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const userId = localStorage.getItem('userId');
            await axios.post(`${import.meta.env.VITE_API_URL}/api/channels/join`, {
                inviteCode
            }, {
                headers: { 'x-user-id': userId }
            });

            setInviteCode('');
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Invalid invite code');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Join Workspace">
            <form onSubmit={handleSubmit} className="space-y-6">

                <div className="space-y-2">
                    <InputField
                        icon={Key}
                        label="INVITE CODE"
                        placeholder="Paste invite code here..."
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value)}
                    />
                    <p className="text-xs text-slate-400 dark:text-slate-500 pl-4">
                        Enter the code shared by your team admin to join their workspace.
                    </p>
                </div>

                {error && (
                    <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isLoading || !inviteCode}
                    className="w-full bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold py-4 rounded-2xl transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <>
                            <span>Join Channel</span>
                            <ArrowRight className="w-5 h-5" />
                        </>
                    )}
                </button>
            </form>
        </Modal>
    );
};

export default JoinChannelModal;