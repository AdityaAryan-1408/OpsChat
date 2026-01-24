import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';

import { Sidebar } from './Sidebar';
import { ChatArea } from './ChatArea';
import type { Workspace, User, ViewState } from '../../types';


const MOCK_WORKSPACE: Workspace = {
    id: 'ws_1',
    name: 'Nebula_Main',
    channels: [
        { id: 'general', name: 'general', type: 'public' },
        { id: 'infrastructure', name: 'infrastructure', type: 'public' },
        { id: 'ai-workers', name: 'ai-workers', type: 'public' },
        { id: 'deployment', name: 'deployment', type: 'public' }
    ]
};

const MOCK_DMS: User[] = [
    { id: 'u1', username: 'alex_devops', status: 'online', role: 'DevOps' },
    { id: 'u2', username: 'sarah_ai', status: 'busy', role: 'AI Lead' }
];

export const Dashboard = () => {
    const navigate = useNavigate();


    const [userProfile, setUserProfile] = useState<any>({ username: 'Guest' });
    const [activeView, setActiveView] = useState<ViewState>({ type: null, id: null });
    const [showAddPerson, setShowAddPerson] = useState(false);


    const [socket, setSocket] = useState<Socket | null>(null);
    const [socketConnected, setSocketConnected] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('userProfile');
        if (saved) {
            setUserProfile(JSON.parse(saved));
        } else {
            // navigate('/auth'); 
        }
    }, []);


    useEffect(() => {

        const newSocket = io('http://localhost:3000', {
            autoConnect: true,
        });

        newSocket.on('connect', () => {
            console.log('Socket connected:', newSocket.id);
            setSocketConnected(true);
        });

        newSocket.on('disconnect', () => {
            console.log('Socket disconnected');
            setSocketConnected(false);
        });

        setSocket(newSocket);


        return () => {
            newSocket.disconnect();
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('userProfile');
        navigate('/');
    };

    return (
        <div className="h-screen bg-[#f8f9fb] dark:bg-slate-900 font-sans selection:bg-[#b5f2a1] flex overflow-hidden transition-colors">
            <Sidebar
                userProfile={userProfile}
                activeView={activeView}
                setActiveView={setActiveView}
                workspaces={[MOCK_WORKSPACE]}
                currentWorkspace={MOCK_WORKSPACE}
                directMessages={MOCK_DMS}
                onAddPerson={() => setShowAddPerson(true)}
                onLogout={handleLogout}
            />

            <ChatArea
                activeView={activeView}
                showAddPerson={showAddPerson}
                setShowAddPerson={setShowAddPerson}
                socketConnected={socketConnected}
            />
        </div>
    );
};