import { create } from "zustand";
import type { Chat, DateGroup } from "@/types";

interface ChatState {
    chats: Chat[];
    activeChatId: string | null;
    sidebarOpen: boolean;

    setChats: (chats: Chat[]) => void;
    createChat: () => string;
    deleteChat: (id: string) => void;
    renameChat: (id: string, title: string) => void;
    setActiveChat: (id: string | null) => void;
    updateChatMessages: (
        id: string,
        messages: { id: string; role: "user" | "assistant" | "system"; content: string; createdAt: Date }[]
    ) => void;
    updateChatTitle: (id: string, title: string) => void;
    updateChatPrdDocument: (id: string, doc: string) => void;
    setSidebarOpen: (open: boolean) => void;
    toggleSidebar: () => void;
}

function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

export function groupChatsByDate(chats: Chat[]): Record<DateGroup, Chat[]> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 86400000);
    const last7 = new Date(today.getTime() - 7 * 86400000);
    const last30 = new Date(today.getTime() - 30 * 86400000);

    const groups: Record<DateGroup, Chat[]> = {
        "Hari Ini": [],
        "Kemarin": [],
        "7 Hari Terakhir": [],
        "30 Hari Terakhir": [],
        "Lama": [],
    };

    const sorted = [...chats].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    for (const chat of sorted) {
        const d = new Date(chat.updatedAt);
        if (d >= today) groups["Hari Ini"].push(chat);
        else if (d >= yesterday) groups["Kemarin"].push(chat);
        else if (d >= last7) groups["7 Hari Terakhir"].push(chat);
        else if (d >= last30) groups["30 Hari Terakhir"].push(chat);
        else groups["Lama"].push(chat);
    }

    return groups;
}

export const useChatStore = create<ChatState>()((set, get) => ({
    chats: [],
    activeChatId: null,
    sidebarOpen: true,

    setChats: (chats) => set({ chats }),

    createChat: () => {
        const id = generateId();
        const chat: Chat = {
            id,
            title: "Obrolan Baru",
            messages: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        set((state) => ({
            chats: [chat, ...state.chats],
            activeChatId: id,
        }));

        // Async sync to database
        fetch("/api/chats", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, title: "Obrolan Baru" }),
        }).catch((err) => console.error("Failed to sync new chat to database:", err));

        return id;
    },

    deleteChat: (id) => {
        const state = get();
        const remaining = state.chats.filter((c) => c.id !== id);
        set({
            chats: remaining,
            activeChatId:
                state.activeChatId === id
                    ? remaining.length > 0
                        ? remaining[0].id
                        : null
                    : state.activeChatId,
        });

        // Async sync to database
        fetch(`/api/chats/${id}`, {
            method: "DELETE",
        }).catch((err) => console.error("Failed to delete chat from database:", err));
    },

    renameChat: (id, title) => {
        set((state) => ({
            chats: state.chats.map((c) =>
                c.id === id ? { ...c, title, updatedAt: new Date() } : c
            ),
        }));

        // Async sync to database
        fetch(`/api/chats/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title }),
        }).catch((err) => console.error("Failed to rename chat in database:", err));
    },

    setActiveChat: (id) => set({ activeChatId: id }),

    updateChatMessages: (id, messages) => {
        set((state) => ({
            chats: state.chats.map((c) =>
                c.id === id
                    ? {
                        ...c,
                        messages: messages.map((m) => ({
                            ...m,
                            createdAt: new Date(m.createdAt),
                        })),
                        updatedAt: new Date(),
                    }
                    : c
            ),
        }));

        // Async sync to database
        fetch(`/api/chats/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages }),
        }).catch((err) => console.error("Failed to update chat messages in database:", err));
    },

    updateChatTitle: (id, title) => {
        set((state) => ({
            chats: state.chats.map((c) =>
                c.id === id ? { ...c, title, updatedAt: new Date() } : c
            ),
        }));

        // Async sync to database
        fetch(`/api/chats/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title }),
        }).catch((err) => console.error("Failed to update chat title in database:", err));
    },

    updateChatPrdDocument: (id, prdDocument) => {
        set((state) => ({
            chats: state.chats.map((c) =>
                c.id === id ? { ...c, prdDocument, updatedAt: new Date() } : c
            ),
        }));

        // Async sync to database
        fetch(`/api/chats/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prdDocument }),
        }).catch((err) => console.error("Failed to update chat PRD document in database:", err));
    },

    setSidebarOpen: (open) => set({ sidebarOpen: open }),
    toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
