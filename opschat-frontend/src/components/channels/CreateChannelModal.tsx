import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { InputField } from '../ui/InputField';
import { Hash, Loader2, Copy, Check } from 'lucide-react';
import axios from 'axios';

interface CreateChannelModalProps {
    isOpen: boolean;
    onClose: () => void;
    workspaceId: string;
    onSuccess: () => void;
}

const CreateChannelModal: React.FC<CreateChannelModalProps> = ({ isOpen, onClose, workspaceId, onSuccess }) => {
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [inviteCode, setInviteCode] = useState('');
    const [copied, setCopied] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const userId = localStorage.getItem('userId');
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/channels/create`, {
                name,
                workspaceId
            }, {
                headers: { 'x-user-id': userId }
            });

            // Show invite code to creator
            setInviteCode(res.data.inviteCode);
            onSuccess();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to create channel');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(inviteCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleClose = () => {
        setName('');
        setInviteCode('');
        setError('');
        onClose();
    };

    // If invite code is set, show success screen
    if (inviteCode) {
        return (
            <Modal isOpen={isOpen} onClose={handleClose} title="Channel Created! 🎉">
                <div className="space-y-6">
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                        Share this invite code with others so they can join your channel:
                    </p>

                    <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border-2 border-dashed border-[#b5f2a1]">
                        <code className="flex-1 font-mono text-lg font-bold text-slate-900 dark:text-white break-all">
                            {inviteCode}
                        </code>
                        <button
                            onClick={handleCopy}
                            className="p-2 rounded-xl bg-[#b5f2a1] hover:bg-[#9de085] text-slate-900 transition-all"
                        >
                            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                        </button>
                    </div>

                    <p className="text-xs text-slate-400 dark:text-slate-500">
                        💡 Only you (the creator) can see this invite code. Share it privately with people you want to join.
                    </p>

                    <button
                        onClick={handleClose}
                        className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-4 rounded-2xl transition-all hover:bg-black dark:hover:bg-slate-100"
                    >
                        Done
                    </button>
                </div>
            </Modal>
        );
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="New Channel">
            <form onSubmit={handleSubmit} className="space-y-6">

                <div className="space-y-2">
                    <InputField
                        icon={Hash}
                        label="CHANNEL NAME"
                        placeholder="e.g. project-alpha"
                        value={name}
                        onChange={(e) => setName(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                    />
                    <p className="text-xs text-slate-400 dark:text-slate-500 pl-4">
                        Only people with the invite code can join this channel.
                    </p>
                </div>

                {error && (
                    <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium">
                        {error}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isLoading || !name}
                    className="w-full bg-[#b5f2a1] hover:bg-[#9de085] disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 font-bold py-4 rounded-2xl transition-all flex items-center justify-center space-x-2"
                >
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <span>Create Channel</span>
                    )}
                </button>
            </form>
        </Modal>
    );
};

export default CreateChannelModal;