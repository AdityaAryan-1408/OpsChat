import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Zap, Settings, ChevronRight, Plus, Hash, UserPlus, LogOut,
    Terminal
} from 'lucide-react';
import { ThemeToggle } from '../ui/ThemeToggle';
import type { User, Workspace, ViewState } from '../../types';

interface SidebarProps {
    userProfile: any;
    activeView: ViewState;
    setActiveView: (view: ViewState) => void;
    workspaces: Workspace[];
    currentWorkspace: Workspace;
    directMessages: User[];
    onAddPerson: () => void;
    onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
    userProfile,
    activeView,
    setActiveView,
    workspaces, 
    currentWorkspace,
    directMessages,
    onAddPerson,
    onLogout
}) => {
    const navigate = useNavigate();

    return (
        <aside className="w-72 bg-white dark:bg-slate-800 border-r border-slate-100 dark:border-slate-700 flex flex-col transition-colors">
            {/* Header / Logo */}
            <div className="p-6 border-b border-slate-50 dark:border-slate-700">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="w-8 h-8 bg-[#b5f2a1] rounded-lg flex items-center justify-center shadow-md">
                            <Zap className="w-5 h-5 text-black fill-black" />
                        </div>
                        <span className="text-xl font-black tracking-tighter text-slate-900 dark:text-white">OpsChat</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <button className="text-slate-300 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                            <Settings className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Workspace Selector */}
                <div className="bg-slate-50 dark:bg-slate-700 rounded-2xl p-3 flex items-center gap-3 border border-slate-100 dark:border-slate-600 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-[#b5f2a1] flex items-center justify-center text-white dark:text-black font-bold">
                        {currentWorkspace.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Workspace</p>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{currentWorkspace.name}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-500" />
                </div>
            </div>


            <div className="flex-1 overflow-y-auto p-4 space-y-8">
                
                <div>
                    <div className="flex items-center justify-between px-2 mb-3">
                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Channels</p>
                        <Plus className="w-3 h-3 text-slate-400 dark:text-slate-500 cursor-pointer hover:text-slate-900 dark:hover:text-white" />
                    </div>
                    <div className="space-y-1">
                        {currentWorkspace.channels.map(channel => (
                            <button
                                key={channel.id}
                                onClick={() => setActiveView({ type: 'channel', id: channel.id })}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-bold transition-all ${activeView.type === 'channel' && activeView.id === channel.id
                                        ? 'bg-[#b5f2a1]/20 text-slate-900 dark:text-white'
                                        : 'text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300'
                                    }`}
                            >
                                <Hash className={`w-4 h-4 ${activeView.type === 'channel' && activeView.id === channel.id
                                        ? 'text-slate-900 dark:text-white'
                                        : 'text-slate-300 dark:text-slate-600'
                                    }`} />
                                {channel.name}
                            </button>
                        ))}
                    </div>
                </div>


                <div>
                    <div className="flex items-center justify-between px-2 mb-3">
                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Direct Messages</p>
                        <button
                            onClick={onAddPerson}
                            className="w-5 h-5 bg-slate-50 dark:bg-slate-700 rounded-md flex items-center justify-center text-slate-400 dark:text-slate-500 hover:bg-[#b5f2a1] hover:text-black transition-all"
                        >
                            <UserPlus className="w-3 h-3" />
                        </button>
                    </div>
                    <div className="space-y-3">
                        {directMessages.map(user => (
                            <div
                                key={user.username}
                                onClick={() => setActiveView({ type: 'dm', id: user.username })}
                                className={`flex items-center gap-3 px-2 py-2 rounded-xl cursor-pointer group transition-all ${activeView.type === 'dm' && activeView.id === user.username
                                        ? 'bg-slate-50 dark:bg-slate-700'
                                        : 'hover:bg-slate-50/50 dark:hover:bg-slate-700/50'
                                    }`}
                            >
                                <div className="relative">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-600 flex items-center justify-center text-[10px] font-bold text-slate-400 dark:text-slate-300 group-hover:bg-[#b5f2a1] group-hover:text-black transition-colors">
                                        {user.username.charAt(0).toUpperCase()}
                                    </div>
                                    <div className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border-2 border-white dark:border-slate-800 ${user.status === 'online' ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-500'
                                        }`} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-900 dark:text-white">{user.username}</p>
                                    <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{user.role}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

       
            <div className="p-6 border-t border-slate-50 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-[#b5f2a1] flex items-center justify-center font-black text-slate-900 shadow-sm">
                        {userProfile.username[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1">
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{userProfile.username}</p>
                        <p className="text-[9px] font-bold text-green-500 uppercase tracking-widest">Available</p>
                    </div>
                    <button onClick={onLogout} className="text-slate-300 dark:text-slate-500 hover:text-red-500 transition-colors">
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </aside>
    );
};