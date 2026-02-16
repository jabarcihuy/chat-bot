import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Chat, DateGroup } from "@/types";

interface ChatState {
    chats: Chat[];
    activeChatId: string | null;
    sidebarOpen: boolean;

    createChat: () => string;
    deleteChat: (id: string) => void;
    renameChat: (id: string, title: string) => void;
    setActiveChat: (id: string | null) => void;
    updateChatMessages: (
        id: string,
        messages: { id: string; role: "user" | "assistant" | "system"; content: string; createdAt: Date }[]
    ) => void;
    updateChatTitle: (id: string, title: string) => void;
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
        Today: [],
        Yesterday: [],
        "Last 7 Days": [],
        "Last 30 Days": [],
        Older: [],
    };

    const sorted = [...chats].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    for (const chat of sorted) {
        const d = new Date(chat.updatedAt);
        if (d >= today) groups["Today"].push(chat);
        else if (d >= yesterday) groups["Yesterday"].push(chat);
        else if (d >= last7) groups["Last 7 Days"].push(chat);
        else if (d >= last30) groups["Last 30 Days"].push(chat);
        else groups["Older"].push(chat);
    }

    return groups;
}

export const useChatStore = create<ChatState>()(
    persist(
        (set, get) => ({
            chats: [],
            activeChatId: null,
            sidebarOpen: true,

            createChat: () => {
                const id = generateId();
                const chat: Chat = {
                    id,
                    title: "New Chat",
                    messages: [],
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
                set((state) => ({
                    chats: [chat, ...state.chats],
                    activeChatId: id,
                }));
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
            },

            renameChat: (id, title) => {
                set((state) => ({
                    chats: state.chats.map((c) =>
                        c.id === id ? { ...c, title, updatedAt: new Date() } : c
                    ),
                }));
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
                                title:
                                    c.title === "New Chat" && messages.length > 0
                                        ? messages[0].content.slice(0, 40) +
                                        (messages[0].content.length > 40 ? "..." : "")
                                        : c.title,
                            }
                            : c
                    ),
                }));
            },

            updateChatTitle: (id, title) => {
                set((state) => ({
                    chats: state.chats.map((c) =>
                        c.id === id ? { ...c, title, updatedAt: new Date() } : c
                    ),
                }));
            },

            setSidebarOpen: (open) => set({ sidebarOpen: open }),
            toggleSidebar: () =>
                set((state) => ({ sidebarOpen: !state.sidebarOpen })),
        }),
        {
            name: "nexus-chats",
        }
    )
);
