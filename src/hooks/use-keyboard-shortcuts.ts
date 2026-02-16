"use client";

import { useEffect } from "react";

interface ShortcutHandlers {
    onNewChat: () => void;
    onToggleSidebar: () => void;
}

export function useKeyboardShortcuts({
    onNewChat,
    onToggleSidebar,
}: ShortcutHandlers) {
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            // Don't fire if user is typing in an input/textarea
            const target = e.target as HTMLElement;
            if (
                target.tagName === "INPUT" ||
                target.tagName === "TEXTAREA" ||
                target.isContentEditable
            ) {
                return;
            }

            const ctrl = e.ctrlKey || e.metaKey;

            if (ctrl && e.key === "n") {
                e.preventDefault();
                onNewChat();
            }

            if (ctrl && e.key === "b") {
                e.preventDefault();
                onToggleSidebar();
            }
        };

        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onNewChat, onToggleSidebar]);
}
