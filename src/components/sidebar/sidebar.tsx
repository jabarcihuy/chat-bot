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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useChatStore, groupChatsByDate } from "@/store/chat-store";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import type { DateGroup } from "@/types";

function SidebarContent() {
    const {
        chats,
        activeChatId,
        createChat,
        deleteChat,
        renameChat,
        setActiveChat,
        setSidebarOpen,
    } = useChatStore();

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

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
        setSidebarOpen(false);
    };

    const handleRename = (id: string) => {
        if (editTitle.trim()) {
            renameChat(id, editTitle.trim());
        }
        setEditingId(null);
    };

    const dateGroups: DateGroup[] = [
        "Today",
        "Yesterday",
        "Last 7 Days",
        "Last 30 Days",
        "Older",
    ];

    return (
        <div className="flex h-full flex-col">
            {/* Sidebar header */}
            <div className="p-3 space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">Chats</span>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                            size="sm"
                            onClick={handleNew}
                            className="h-8 gap-1.5 px-3 text-xs"
                        >
                            <Plus className="h-3.5 w-3.5" />
                            New
                        </Button>
                    </motion.div>
                </div>

                {/* Search input */}
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                        placeholder="Search chats..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-8 pl-8 text-xs bg-secondary/50"
                    />
                </div>
            </div>

            <Separator />

            {/* Chat list */}
            <ScrollArea className="flex-1 px-2 py-2">
                {chats.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <MessageSquare className="h-8 w-8 text-muted-foreground/40 mb-2" />
                        <p className="text-xs text-muted-foreground">No chats yet</p>
                        <p className="text-xs text-muted-foreground/60">
                            Start a new chat to begin
                        </p>
                    </div>
                )}

                {dateGroups.map((group) => {
                    const items = filteredGrouped[group];
                    if (!items || items.length === 0) return null;

                    return (
                        <div key={group} className="mb-3">
                            <p className="px-2 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground/60 font-medium">
                                {group}
                            </p>
                            <AnimatePresence mode="popLayout">
                                {items.map((chat) => (
                                    <motion.div
                                        key={chat.id}
                                        layout
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <div
                                            className={cn(
                                                "group flex items-center gap-2 rounded-lg px-2.5 py-2 cursor-pointer transition-colors",
                                                "hover:bg-accent/70",
                                                activeChatId === chat.id && "bg-accent"
                                            )}
                                            onClick={() => {
                                                setActiveChat(chat.id);
                                                setSidebarOpen(false);
                                            }}
                                        >
                                            <MessageSquare className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />

                                            {editingId === chat.id ? (
                                                <div className="flex items-center gap-1 flex-1 min-w-0">
                                                    <Input
                                                        value={editTitle}
                                                        onChange={(e) => setEditTitle(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === "Enter") handleRename(chat.id);
                                                            if (e.key === "Escape") setEditingId(null);
                                                        }}
                                                        className="h-6 text-xs flex-1"
                                                        autoFocus
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 shrink-0"
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
                                                        className="h-6 w-6 shrink-0"
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
                                                    <span className="text-xs truncate flex-1">
                                                        {chat.title}
                                                    </span>
                                                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-6 w-6 shrink-0"
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
                                                            className="h-6 w-6 shrink-0 hover:text-destructive"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                deleteChat(chat.id);
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
                    );
                })}
            </ScrollArea>

            {/* Keyboard shortcut hint */}
            <div className="p-3 border-t border-border/30">
                <div className="flex items-center justify-center gap-3 text-[10px] text-muted-foreground/40">
                    <span><kbd className="px-1 py-0.5 rounded bg-secondary/60 font-mono">Ctrl+N</kbd> New</span>
                    <span><kbd className="px-1 py-0.5 rounded bg-secondary/60 font-mono">Ctrl+B</kbd> Sidebar</span>
                </div>
            </div>
        </div>
    );
}

export function Sidebar() {
    const { sidebarOpen, setSidebarOpen } = useChatStore();
    const isDesktop = useMediaQuery("(min-width: 768px)");

    return (
        <>
            {/* Desktop sidebar — only rendered on md+ screens */}
            {isDesktop && (
                <AnimatePresence mode="wait">
                    {sidebarOpen && (
                        <motion.aside
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 280, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            className="relative z-20 flex h-full overflow-hidden glass-strong border-r border-border/50"
                        >
                            <div className="w-[280px]">
                                <SidebarContent />
                            </div>
                        </motion.aside>
                    )}
                </AnimatePresence>
            )}

            {/* Mobile sidebar — only rendered on < md screens */}
            {!isDesktop && (
                <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                    <SheetContent side="left" className="w-[280px] p-0 glass-strong">
                        <SidebarContent />
                    </SheetContent>
                </Sheet>
            )}
        </>
    );
}
