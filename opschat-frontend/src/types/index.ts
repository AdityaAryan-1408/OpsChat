export interface User {
    id: string;
    username: string;
    avatarUrl?: string;
    status: 'online' | 'offline' | 'busy';
    role?: string; 
}

export interface Message {
    id: string;
    content: string;
    senderId: string;
    senderName: string;
    createdAt: string; // ISO date string
    channelId: string;
    type: 'text' | 'image' | 'voice' | 'system';
}

export interface Channel {
    id: string;
    name: string;
    type: 'public' | 'private';
    unreadCount?: number;
}

export interface Workspace {
    id: string;
    name: string;
    channels: Channel[];
}

export type ViewState = {
    type: 'channel' | 'dm' | null;
    id: string | null;
};