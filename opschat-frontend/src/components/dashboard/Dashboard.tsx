import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';

import { Sidebar } from './Sidebar';
import { ChatArea } from './ChatArea';
import { Navbar } from '../layout/Navbar'; 
import type { Workspace, User, ViewState } from '../../types';

export const Dashboard = () => {
    const navigate = useNavigate();

    // State
    const [userProfile, setUserProfile] = useState<any>(null);
    const [activeView, setActiveView] = useState<ViewState>({ type: null, id: null });
    const [showAddPerson, setShowAddPerson] = useState(false);

    // Data State
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
    const [refreshKey, setRefreshKey] = useState(0); // Used to trigger re-fetches

    // Socket State
    const [socket, setSocket] = useState<Socket | null>(null);
    const [socketConnected, setSocketConnected] = useState(false);

    // 1. Initial Auth Check & Profile Fetch
    useEffect(() => {
        const fetchProfile = async () => {
            const userId = localStorage.getItem('userId');
            if (!userId) {
                navigate('/auth');
                return;
            }

            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/profile`, {
                    headers: { 'x-user-id': userId }
                });
                setUserProfile(res.data);
            } catch (error) {
                console.error("Failed to load profile", error);
                // If 401, force logout
                localStorage.clear();
                navigate('/auth');
            }
        };

        fetchProfile();
    }, [navigate, refreshKey]); 

    // 2. Fetch Workspace Data (Channels)
    // For Phase 2, we assume Single Workspace (ID: 1) created by seed
    useEffect(() => {
        const fetchWorkspaceData = async () => {
            const userId = localStorage.getItem('userId');
            if (!userId) return;

            try {
                // Fetch channels for Workspace 1
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/channels/1`, {
                    headers: { 'x-user-id': userId }
                });

                const workspaceData: Workspace = {
                    id: '1',
                    name: 'Default Workspace', 
                    channels: res.data.map((c: any) => ({
                        id: c.id,
                        name: c.name,
                        type: 'public'
                    }))
                };

                setWorkspaces([workspaceData]);
                setCurrentWorkspace(workspaceData);

                // Set initial view to first channel if none selected
                if (!activeView.id && res.data.length > 0) {
                    setActiveView({ type: 'channel', id: res.data[0].id });
                }

            } catch (error) {
                console.error("Failed to load workspace data", error);
            }
        };

        fetchWorkspaceData();
    }, [refreshKey]); // Re-run when sidebar triggers refresh

    // 3. Socket Connection
    useEffect(() => {
        const userId = localStorage.getItem('userId');
        if (!userId) return;

        const newSocket = io(import.meta.env.VITE_API_URL, {
            auth: { userId }, // Send userId for handshake auth
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
        localStorage.clear();
        if (socket) socket.disconnect();
        navigate('/auth');
    };

    // Callback to refresh data (passed to Sidebar -> Modals)
    const handleRefresh = useCallback(() => {
        setRefreshKey(prev => prev + 1);
    }, []);

    if (!userProfile || !currentWorkspace) {
        return <div className="h-screen bg-[#f8f9fb] dark:bg-slate-900 flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="h-screen bg-[#f8f9fb] dark:bg-slate-900 font-sans selection:bg-[#b5f2a1] flex flex-col overflow-hidden transition-colors">
            <Navbar
                userProfile={userProfile}
                onProfileUpdate={handleRefresh} // Update state when profile changes
            />

            <div className="flex-1 flex overflow-hidden pt-[88px]"> 
                <Sidebar
                    userProfile={userProfile}
                    activeView={activeView}
                    setActiveView={setActiveView}
                    workspaces={workspaces}
                    currentWorkspace={currentWorkspace}
                    directMessages={[]}
                    onAddPerson={() => setShowAddPerson(true)}
                    onLogout={handleLogout}
                    onRefresh={handleRefresh} 
                />

                <ChatArea
                    activeView={activeView}
                    showAddPerson={showAddPerson}
                    setShowAddPerson={setShowAddPerson}
                    socketConnected={socketConnected}
                    socket={socket}
                    currentWorkspace={currentWorkspace}
                />
            </div>
        </div>
    );
};