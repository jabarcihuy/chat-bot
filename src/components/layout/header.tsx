"use client";

import { motion } from "framer-motion";
import { PanelLeftClose, PanelLeft, Settings, Sparkles, Sun, Moon, Rocket, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChatStore } from "@/store/chat-store";
import { useSettingsStore } from "@/store/settings-store";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

interface HeaderProps {
    onOpenSettings: () => void;
}

export function Header({ onOpenSettings }: HeaderProps) {
    const { sidebarOpen, toggleSidebar } = useChatStore();
    const { model, mode, setMode } = useSettingsStore();
    const { theme, setTheme } = useTheme();

    return (
        <motion.header
            className="glass-strong sticky top-0 z-30 flex h-16 items-center justify-between px-6 gap-2 border-b border-border/10 shrink-0"
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
                {/* Mode Toggle Button */}
                <div className="flex items-center bg-muted/40 p-1 rounded-full border border-border/10 backdrop-blur-md">
                    <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                            "h-7 px-3 rounded-full text-[10px] font-bold gap-1.5 transition-all duration-200",
                            mode === "chat" 
                                ? "bg-primary text-primary-foreground shadow-md" 
                                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                        )}
                        onClick={() => setMode("chat")}
                    >
                        <MessageSquare className="h-3 w-3" />
                        Obrolan
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                            "h-7 px-3 rounded-full text-[10px] font-bold gap-1.5 transition-all duration-200",
                            mode === "prd" 
                                ? "bg-accent text-accent-foreground shadow-md" 
                                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                        )}
                        onClick={() => setMode("prd")}
                    >
                        <Rocket className="h-3 w-3" />
                        PRD
                    </Button>
                </div>

                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/10 backdrop-blur-md text-[10px] font-bold text-muted-foreground border border-border/10">
                    <div className={cn(
                        "w-1.5 h-1.5 rounded-full animate-pulse",
                        mode === "prd" ? "bg-accent shadow-[0_0_8px_oklch(var(--accent))]" : "bg-primary shadow-[0_0_8px_oklch(var(--primary))]"
                    )} />
                    <span className="uppercase tracking-wider">{mode === "prd" ? "Mode PRD" : "Obrolan"}</span>
                    <span className="opacity-20">|</span>
                    <span className="font-mono opacity-80">{model}</span>
                </div>

                            <div className="flex items-center gap-1 ml-2">
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-full"
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            >
                            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                            <span className="sr-only">Ganti tema</span>
                            </Button>
                            </motion.div>

                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-full"
                            onClick={onOpenSettings}
                            >
                            <Settings className="h-4 w-4" />
                            <span className="sr-only">Pengaturan</span>
                            </Button>
                            </motion.div>
                </div>
            </div>
        </motion.header>
    );
}
