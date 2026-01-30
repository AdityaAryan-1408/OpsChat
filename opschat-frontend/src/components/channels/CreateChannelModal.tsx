import React, { useState } from 'react';
import Modal from '../ui/Modal';
import { InputField } from '../ui/InputField'; 
import { Hash, Loader2 } from 'lucide-react';
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const userId = localStorage.getItem('userId');
            await axios.post(`${import.meta.env.VITE_API_URL}/api/channels/create`, {
                name,
                workspaceId
            }, {
                headers: { 'x-user-id': userId }
            });

            setName('');
            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to create channel');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="New Channel">
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
                        Channels are where your team communicates. They're best when organized around a topic.
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