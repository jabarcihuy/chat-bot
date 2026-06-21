"use client";

import { motion } from "framer-motion";
import { PanelLeftClose, PanelLeft, Settings, Sparkles, Sun, Moon, Rocket, MessageSquare, LogOut, Trash2, Code, Bug, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChatStore } from "@/store/chat-store";
import { useSettingsStore } from "@/store/settings-store";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface HeaderProps {
    onOpenSettings: () => void;
}

export function Header({ onOpenSettings }: HeaderProps) {
    const { sidebarOpen, toggleSidebar, activeChatId, updateChatMessages } = useChatStore();
    const { model, mode, setMode } = useSettingsStore();
    const { theme, setTheme } = useTheme();

    const handleClearChat = () => {
        if (!activeChatId) return;
        const confirmClear = window.confirm("Apakah Anda yakin ingin menghapus semua pesan dalam obrolan ini?");
        if (confirmClear) {
            updateChatMessages(activeChatId, []);
        }
    };

    return (
        <motion.header
            className="glass-strong sticky top-0 z-30 flex h-16 items-center justify-between px-3 sm:px-6 gap-1 sm:gap-2 border-b border-border/10 shrink-0"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
        >
            <div className="flex items-center gap-2">
                <motion.div 
                    className="md:hidden" // Hide on desktop
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }}
                >
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleSidebar}
                        className="h-9 w-9 rounded-full"
                    >
                        {sidebarOpen ? (
                            <PanelLeftClose className="h-4 w-4" />
                        ) : (
                            <PanelLeft className="h-4 w-4" />
                        )}
                    </Button>
                </motion.div>

                <div className="flex items-center gap-2 px-1">
                    <div className="p-1.5 rounded-xl bg-primary/10">
                        <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    <span className="font-bold text-sm hidden sm:inline tracking-tight">
                        Nexus AI
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-2">
                {/* Mode Selector Dropdown */}
                <div className="flex items-center">
                    <Select value={mode} onValueChange={(val) => setMode(val as "chat" | "prd" | "coder" | "debugger" | "architect")}>
                        <SelectTrigger className="h-8 rounded-xl text-[10px] font-bold bg-muted/40 border border-border/10 px-3 gap-1.5 focus:ring-1 focus:ring-primary backdrop-blur-md">
                            <SelectValue placeholder="Pilih Alat Bantu" />
                        </SelectTrigger>
                        <SelectContent className="glass border-border/50 text-[10px] font-bold rounded-xl">
                            <SelectItem value="chat" className="gap-2 focus:bg-primary/10 rounded-lg">
                                <span className="flex items-center gap-1.5">
                                    <MessageSquare className="h-3.5 w-3.5 text-primary" />
                                    Developer Chat
                                </span>
                            </SelectItem>
                            <SelectItem value="coder" className="gap-2 focus:bg-primary/10 rounded-lg">
                                <span className="flex items-center gap-1.5">
                                    <Code className="h-3.5 w-3.5 text-emerald-400" />
                                    AI Coding Assistant
                                </span>
                            </SelectItem>
                            <SelectItem value="prd" className="gap-2 focus:bg-primary/10 rounded-lg">
                                <span className="flex items-center gap-1.5">
                                    <Rocket className="h-3.5 w-3.5 text-accent" />
                                    Documentation Gen
                                </span>
                            </SelectItem>
                            <SelectItem value="debugger" className="gap-2 focus:bg-primary/10 rounded-lg">
                                <span className="flex items-center gap-1.5">
                                    <Bug className="h-3.5 w-3.5 text-rose-400" />
                                    Debug Assistant
                                </span>
                            </SelectItem>
                            <SelectItem value="architect" className="gap-2 focus:bg-primary/10 rounded-lg">
                                <span className="flex items-center gap-1.5">
                                    <Layers className="h-3.5 w-3.5 text-amber-400" />
                                    Architecture Planner
                                </span>
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {activeChatId && (
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleClearChat}
                            className="h-8 px-2.5 rounded-full text-[10px] font-bold text-destructive/80 hover:text-destructive hover:bg-destructive/10 border border-destructive/10 transition-all duration-200 gap-1 flex items-center"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Bersihkan Obrolan</span>
                        </Button>
                    </motion.div>
                )}

                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/10 backdrop-blur-md text-[10px] font-bold text-muted-foreground border border-border/10">
                    <div className={cn(
                        "w-1.5 h-1.5 rounded-full animate-pulse",
                        mode === "prd" ? "bg-accent shadow-[0_0_8px_oklch(var(--accent))]" :
                        mode === "coder" ? "bg-emerald-400 shadow-[0_0_8px_oklch(0.7_0.18_140)]" :
                        mode === "debugger" ? "bg-rose-400 shadow-[0_0_8px_oklch(0.7_0.2_25)]" :
                        mode === "architect" ? "bg-amber-400 shadow-[0_0_8px_oklch(0.8_0.15_80)]" :
                        "bg-primary shadow-[0_0_8px_oklch(var(--primary))]"
                    )} />
                    <span className="uppercase tracking-wider">
                        {mode === "prd" ? "Mode PRD" :
                         mode === "coder" ? "Coding Assistant" :
                         mode === "debugger" ? "Debug Assistant" :
                         mode === "architect" ? "Architecture" :
                         "Obrolan"}
                    </span>
                    <span className="opacity-20">|</span>
                    <span className="font-mono opacity-80">{model}</span>
                </div>

                            <div className="hidden md:flex items-center gap-0.5 sm:gap-1 ml-1 sm:ml-2">
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 sm:h-9 sm:w-9 rounded-full"
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            >
                            <Sun className="h-3.5 w-3.5 sm:h-4 sm:w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                            <Moon className="absolute h-3.5 w-3.5 sm:h-4 sm:w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                            <span className="sr-only">Ganti tema</span>
                            </Button>
                            </motion.div>

                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 sm:h-9 sm:w-9 rounded-full"
                            onClick={onOpenSettings}
                            >
                            <Settings className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            <span className="sr-only">Pengaturan</span>
                            </Button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 sm:h-9 sm:w-9 rounded-full"
                            onClick={() => signOut({ callbackUrl: "/login" })}
                            >
                            <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-destructive/80" />
                            <span className="sr-only">Keluar</span>
                            </Button>
                            </motion.div>
                </div>
            </div>
        </motion.header>
    );
}
