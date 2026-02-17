"use client";

import { motion } from "framer-motion";
import { PanelLeftClose, PanelLeft, Settings, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChatStore } from "@/store/chat-store";
import { useSettingsStore } from "@/store/settings-store";

interface HeaderProps {
    onOpenSettings: () => void;
}

export function Header({ onOpenSettings }: HeaderProps) {
    const { sidebarOpen, toggleSidebar } = useChatStore();
    const { model } = useSettingsStore();

    return (
        <motion.header
            className="glass sticky top-0 z-30 flex h-14 items-center justify-between px-4 gap-2"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            <div className="flex items-center gap-2">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleSidebar}
                        className="h-9 w-9"
                    >
                        {sidebarOpen ? (
                            <PanelLeftClose className="h-4 w-4" />
                        ) : (
                            <PanelLeft className="h-4 w-4" />
                        )}
                    </Button>
                </motion.div>

                <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <span className="font-semibold text-sm hidden sm:inline">
                        Nexus AI
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/50 text-xs text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Groq</span>
                    <span className="text-border">•</span>
                    <span>{model}</span>
                </div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9"
                        onClick={onOpenSettings}
                    >
                        <Settings className="h-4 w-4" />
                    </Button>
                </motion.div>
            </div>
        </motion.header>
    );
}
