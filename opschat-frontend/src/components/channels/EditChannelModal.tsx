import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import { InputField } from '../ui/InputField';
import { Hash, Loader2, Trash2 } from 'lucide-react';
import axios from 'axios';

interface EditChannelModalProps {
    isOpen: boolean;
    onClose: () => void;
    channel: { id: string | number; name: string } | null;
    onSuccess: () => void;
}

const EditChannelModal: React.FC<EditChannelModalProps> = ({ isOpen, onClose, channel, onSuccess }) => {
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState('');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        if (channel) {
            setName(channel.name);
        }
    }, [channel]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!channel) return;

        setIsLoading(true);
        setError('');

        try {
            const userId = localStorage.getItem('userId');
            await axios.put(`${import.meta.env.VITE_API_URL}/api/channels/${channel.id}`, {
                name
            }, {
                headers: { 'x-user-id': userId }
            });

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to update channel');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!channel) return;

        setIsDeleting(true);
        setError('');

        try {
            const userId = localStorage.getItem('userId');
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/channels/${channel.id}`, {
                headers: { 'x-user-id': userId }
            });

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to delete channel');
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    if (!channel) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Channel">
            <form onSubmit={handleUpdate} className="space-y-6">
                <div className="space-y-2">
                    <InputField
                        icon={Hash}
                        label="CHANNEL NAME"
                        placeholder="e.g. project-alpha"
                        value={name}
                        onChange={(e) => setName(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                    />
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
                        <span>Save Changes</span>
                    )}
                </button>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                    {!showDeleteConfirm ? (
                        <button
                            type="button"
                            onClick={() => setShowDeleteConfirm(true)}
                            className="w-full flex items-center justify-center gap-2 text-red-500 hover:text-red-600 text-sm font-bold py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                            Delete Channel
                        </button>
                    ) : (
                        <div className="space-y-3">
                            <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                                Are you sure? This will delete all messages.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isDeleting ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>
                                            <Trash2 className="w-4 h-4" />
                                            Delete
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </form>
        </Modal>
    );
};

export default EditChannelModal;
