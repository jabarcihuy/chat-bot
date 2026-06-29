"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus,
    MessageSquare,
    Trash2,
    Pencil,
    Check,
    X,
    Search,
    Settings,
    LogOut,
    Sun,
    Moon,
    Folder
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useChatStore, groupChatsByDate } from "@/store/chat-store";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import type { DateGroup } from "@/types";
import { useTheme } from "next-themes";
import { signOut, useSession } from "next-auth/react";
import { FileExplorer } from "./file-explorer";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";


function SidebarContent({ onOpenSettings }: { onOpenSettings?: () => void }) {
    const { theme, setTheme } = useTheme();
    const { data: session } = useSession();
    const [chatToDelete, setChatToDelete] = useState<{ id: string; title: string } | null>(null);
    const {

        chats,
        activeChatId,
        createChat,
        deleteChat,
        renameChat,
        setActiveChat,
        setSidebarOpen,
    } = useChatStore();

    const [sidebarTab, setSidebarTab] = useState<"chats" | "files">("chats");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const isDesktop = useMediaQuery("(min-width: 768px)");

    const grouped = groupChatsByDate(chats);

    const filteredGrouped: Record<DateGroup, typeof chats> = searchQuery
        ? (Object.fromEntries(
            (Object.entries(grouped) as [DateGroup, typeof chats][]).map(
                ([key, items]) => [
                    key,
                    items.filter((c) =>
                        c.title.toLowerCase().includes(searchQuery.toLowerCase())
                    ),
                ]
            )
        ) as Record<DateGroup, typeof chats>)
        : grouped;

    const handleNew = () => {
        createChat();
        setSidebarTab("chats");
        setSidebarOpen(false);
    };

    const handleRename = (id: string) => {
        if (editTitle.trim()) {
            renameChat(id, editTitle.trim());
        }
        setEditingId(null);
    };

    const dateGroups: DateGroup[] = [
        "Hari Ini",
        "Kemarin",
        "7 Hari Terakhir",
        "30 Hari Terakhir",
        "Lama",
    ];

    return (
        <div className="flex h-full flex-col">
            {/* Sidebar header */}
            <div className="p-3 space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Ruang Kerja</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                                size="sm"
                                onClick={handleNew}
                                className="h-8 gap-1.5 px-3 text-xs rounded-full font-bold shadow-sm shadow-primary/20"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                Baru
                            </Button>
                        </motion.div>
                        {!isDesktop && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full text-muted-foreground hover:bg-muted"
                                onClick={() => setSidebarOpen(false)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Tab Switcher */}
                <div className="flex bg-muted/40 p-0.5 rounded-xl border border-border/5">
                    <button
                        onClick={() => setSidebarTab("chats")}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-lg transition-all",
                            sidebarTab === "chats"
                                ? "bg-background text-primary shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <MessageSquare className="h-3.5 w-3.5" />
                        Obrolan
                    </button>
                    <button
                        onClick={() => setSidebarTab("files")}
                        className={cn(
                            "flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded-lg transition-all",
                            sidebarTab === "files"
                                ? "bg-background text-primary shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Folder className="h-3.5 w-3.5" />
                        Berkas
                    </button>
                </div>

                {/* Search input (only for chats) */}
                {sidebarTab === "chats" && (
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
                        <Input
                            placeholder="Cari riwayat..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-9 pl-9 text-xs bg-background/50 border-border/10 rounded-xl focus:ring-primary/20"
                        />
                    </div>
                )}
            </div>

            <Separator className="opacity-5" />

            {/* Chat list / File tree */}
            <div className="flex-1 overflow-hidden">
                {sidebarTab === "files" ? (
                    <FileExplorer onFileSelect={!isDesktop ? () => setSidebarOpen(false) : undefined} />
                ) : (
                    <ScrollArea className="h-full px-3 py-4">
                {chats.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center opacity-40">
                        <MessageSquare className="h-10 w-10 mb-3" />
                        <p className="text-xs font-medium">Belum ada riwayat</p>
                    </div>
                )}

                {dateGroups.map((group) => {
                    const items = filteredGrouped[group];
                    if (!items || items.length === 0) return null;

                    return (
                        <div key={group} className="mb-6">
                            <p className="px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 font-bold">
                                {group}
                            </p>
                            <div className="space-y-1">
                                <AnimatePresence mode="popLayout">
                                    {items.map((chat) => (
                                        <motion.div
                                            key={chat.id}
                                            layout
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                        >
                                            <div
                                                className={cn(
                                                    "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 cursor-pointer transition-all duration-200 border border-transparent overflow-hidden",
                                                    "hover:bg-primary/5 hover:border-primary/10",
                                                    activeChatId === chat.id && "bg-primary/10 border-primary/20 text-primary"
                                                )}
                                                onClick={() => {
                                                    setActiveChat(chat.id);
                                                    setSidebarOpen(false);
                                                }}
                                            >
                                                <MessageSquare className={cn(
                                                    "h-3.5 w-3.5 shrink-0 z-10",
                                                    activeChatId === chat.id ? "text-primary" : "text-muted-foreground/40"
                                                )} />

                                                {editingId === chat.id ? (
                                                    <div className="flex items-center gap-1 flex-1 min-w-0 z-10 bg-background/50">
                                                        <Input
                                                            value={editTitle}
                                                            onChange={(e) => setEditTitle(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === "Enter") handleRename(chat.id);
                                                                if (e.key === "Escape") setEditingId(null);
                                                            }}
                                                            className="h-7 text-xs flex-1 bg-background px-2"
                                                            autoFocus
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 text-green-500 hover:text-green-600 hover:bg-green-500/10 shrink-0"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleRename(chat.id);
                                                            }}
                                                        >
                                                            <Check className="h-3 w-3" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 shrink-0"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setEditingId(null);
                                                            }}
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <span className="text-[13px] truncate font-medium flex-1 pr-12">
                                                            {chat.title}
                                                        </span>
                                                        
                                                        {/* Absolute positioned action buttons (always visible on mobile, hover only on desktop) */}
                                                        <div className="absolute right-2 flex items-center gap-0.5 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity bg-gradient-to-l from-sidebar via-sidebar to-transparent pl-4 py-1 z-10">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6 text-muted-foreground/40 hover:text-primary shrink-0"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setEditingId(chat.id);
                                                                    setEditTitle(chat.title);
                                                                }}
                                                            >
                                                                <Pencil className="h-3 w-3" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-6 w-6 text-muted-foreground/40 hover:text-destructive shrink-0"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setChatToDelete({ id: chat.id, title: chat.title });
                                                                }}
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    );
                })}
                    </ScrollArea>
                )}
            </div>

            {/* Bottom Info Section */}
            <div className="p-4 mt-auto border-t border-border/5 bg-background/20 backdrop-blur-sm">
                <div className="flex flex-col gap-3">
                    {/* User Profile Widget */}
                    {session?.user && (
                        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-secondary/10 border border-border/5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-bold border border-primary/20">
                                {session.user.image ? (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img 
                                        src={session.user.image} 
                                        alt={session.user.name || "User"} 
                                        className="h-full w-full rounded-lg object-cover"
                                    />
                                ) : (
                                    (session.user.name || session.user.email || "?").substring(0, 2).toUpperCase()
                                )}
                            </div>
                            <div className="flex flex-col min-w-0 flex-1">
                                <span className="text-[11px] font-semibold truncate text-foreground/90">
                                    {session.user.name || "Pengguna"}
                                </span>
                                <span className="text-[9px] text-muted-foreground/80 truncate">
                                    {session.user.email}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Mobile-only control buttons */}
                    <div className="flex md:hidden items-center justify-between gap-2 border-b border-border/5 pb-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1.5 text-[11px] flex-1 text-muted-foreground justify-center rounded-xl hover:bg-secondary/40"
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        >
                            {theme === "dark" ? <Sun className="h-3.5 w-3.5 text-amber-500 animate-in spin-in-12" /> : <Moon className="h-3.5 w-3.5 text-primary" />}
                            <span>Tema</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1.5 text-[11px] flex-1 text-muted-foreground justify-center rounded-xl hover:bg-secondary/40"
                            onClick={onOpenSettings}
                        >
                            <Settings className="h-3.5 w-3.5" />
                            <span>Setelan</span>
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 gap-1.5 text-[11px] flex-1 text-destructive hover:bg-destructive/10 justify-center rounded-xl"
                            onClick={() => signOut({ callbackUrl: "/login" })}
                        >
                            <LogOut className="h-3.5 w-3.5 text-destructive/80" />
                            <span>Keluar</span>
                        </Button>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-muted-foreground/60 font-medium">
                        <div className="flex items-center gap-2">
                            <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border/10 text-[9px]">Ctrl</kbd>
                            <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border/10 text-[9px]">N</kbd>
                            <span>Baru</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border/10 text-[9px]">Ctrl</kbd>
                            <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border/10 text-[9px]">B</kbd>
                            <span>Sidebar</span>
                        </div>
                    </div>
                </div>
            </div>

            <ConfirmDialog
                open={chatToDelete !== null}
                onOpenChange={(open) => {
                    if (!open) setChatToDelete(null);
                }}
                title="Hapus Obrolan?"
                description={`Apakah Anda yakin ingin menghapus obrolan "${chatToDelete?.title || ""}"? Semua pesan di dalamnya akan terhapus secara permanen.`}
                confirmText="Hapus"
                cancelText="Batal"
                variant="destructive"
                onConfirm={() => {
                    if (chatToDelete) {
                        deleteChat(chatToDelete.id);
                        setChatToDelete(null);
                    }
                }}
            />
        </div>
    );
}

export function Sidebar({ onOpenSettings }: { onOpenSettings?: () => void }) {
    const { sidebarOpen, setSidebarOpen } = useChatStore();
    const isDesktop = useMediaQuery("(min-width: 768px)");

    return (
        <>
            {/* Desktop sidebar — permanent fixed column */}
            {isDesktop && (
                <aside className="h-full w-[360px] flex-shrink-0 overflow-hidden glass-strong border-r border-border/10 bg-sidebar/40 backdrop-blur-xl">
                    <SidebarContent onOpenSettings={onOpenSettings} />
                </aside>
            )}

            {/* Mobile sidebar — drawer functionality (Portaled by Sheet) */}
            {!isDesktop && (
                <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                    <SheetContent side="left" className="w-[340px] p-0 glass-strong border-r-0" showCloseButton={false}>
                        <SheetTitle className="sr-only">Navigasi Obrolan</SheetTitle>
                        <SheetDescription className="sr-only">Daftar riwayat obrolan Anda</SheetDescription>
                        <SidebarContent onOpenSettings={onOpenSettings} />
                    </SheetContent>
                </Sheet>
            )}
        </>
    );
}
