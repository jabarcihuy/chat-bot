"use client";

import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "./chat-message";
import { ThinkingIndicator } from "./thinking-indicator";
import { useSettingsStore } from "@/store/settings-store";
import { Rocket, MessageSquare, Square, Plus, Info } from "lucide-react";
import type { UIMessage } from "@ai-sdk/react";

interface ChatAreaProps {
    messages: UIMessage[];
    isLoading: boolean;
    onSuggestionClick?: (text: string) => void;
}

// Extract text content from UIMessage parts
function getTextFromParts(parts: UIMessage["parts"]): string {
    return parts
        .filter((p): p is { type: "text"; text: string } => p.type === "text")
        .map((p) => p.text)
        .join("");
}

export function ChatArea({ messages, isLoading, onSuggestionClick }: ChatAreaProps) {
    const bottomRef = useRef<HTMLDivElement>(null);
    const { mode } = useSettingsStore();

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    return (
        <div className="flex-1 overflow-hidden min-h-0">
            <ScrollArea className="h-full w-full">
                <div className="max-w-5xl mx-auto px-6 py-10 space-y-4">
                    {messages.length === 0 && !isLoading && (
                        <WelcomeScreen onSuggestionClick={onSuggestionClick} mode={mode} />
                    )}

                    <div className="flex flex-col gap-4">
                        <AnimatePresence mode="popLayout">
                            {messages.map((msg, i) => {
                                const content = getTextFromParts(msg.parts);
                                return (
                                    <ChatMessage
                                        key={msg.id || i}
                                        role={msg.role as "user" | "assistant"}
                                        content={content}
                                        isStreaming={
                                            isLoading &&
                                            msg.role === "assistant" &&
                                            i === messages.length - 1
                                        }
                                    />
                                );
                            })}
                        </AnimatePresence>
                    </div>

                    <AnimatePresence>
                        {isLoading &&
                            (messages.length === 0 ||
                                messages[messages.length - 1]?.role !== "assistant") && (
                                <ThinkingIndicator />
                            )}
                    </AnimatePresence>

                    <div ref={bottomRef} className="h-4" />
                </div>
            </ScrollArea>
        </div>
    );
}

interface WelcomeScreenProps {
    onSuggestionClick?: (text: string) => void;
    mode?: "chat" | "prd";
}

function WelcomeScreen({ onSuggestionClick, mode }: WelcomeScreenProps) {
    const suggestions = [
        { emoji: "💡", text: "Jelaskan tentang Quantum Computing" },
        { emoji: "📝", text: "Tulis komponen React untuk login" },
        { emoji: "🎯", text: "Debug kode Python saya" },
    ];

    if (mode === "prd") {
        const prdGuide = [
            { 
                icon: <Rocket className="h-4 w-4 text-primary" />, 
                title: "Struktur PRD", 
                desc: "Ubah ide kasar Anda menjadi kerangka dokumen formal (Konteks, Batasan, dll)." 
            },
            { 
                icon: <MessageSquare className="h-4 w-4 text-accent" />, 
                title: "User Stories", 
                desc: "Jabarkan skenario pengguna secara spesifik (Sebagai... Saya ingin... Sehingga...)." 
            },
            { 
                icon: <Square className="h-4 w-4 text-foreground/60" />, 
                title: "Tech Stack", 
                desc: "Minta rekomendasi teknologi dan arsitektur yang paling pas untuk proyek Anda." 
            },
            { 
                icon: <Plus className="h-4 w-4 text-foreground/60" />, 
                title: "Metrik Sukses", 
                desc: "Tentukan tolok ukur keberhasilan dan antisipasi berbagai edge cases." 
            },
        ];

        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
                <motion.div
                    className="mb-8 text-center max-w-2xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-[10px] font-bold uppercase tracking-widest mb-4 border border-accent/20">
                        <Info className="h-3 w-3" />
                        Panduan Mode PRD
                    </div>
                    <h1 className="text-3xl font-black mb-3 tracking-tight">Vibe Coder Workspace</h1>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Selamat datang di ruang kerja khusus pembuatan dokumen produk. Di sini, Gemini bertindak sebagai 
                        **Technical PM Senior** yang akan menyusun ide Anda menjadi dokumen teknis siap pakai.
                    </p>
                </motion.div>

                <div className="grid gap-4 sm:grid-cols-2 w-full max-w-3xl">
                    {prdGuide.map((item, i) => (
                        <motion.div
                            key={item.title}
                            className="p-5 rounded-2xl bg-card border border-border/10 shadow-sm hover:shadow-md transition-all group"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 + i * 0.05 }}
                        >
                            <div className="flex items-start gap-4">
                                <div className="p-2.5 rounded-xl bg-secondary/50 group-hover:bg-secondary transition-colors shrink-0">
                                    {item.icon}
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-sm font-bold">{item.title}</h3>
                                    <p className="text-xs text-muted-foreground leading-normal">
                                        {item.desc}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <motion.p 
                    className="mt-10 text-[11px] text-muted-foreground/60 italic"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    Tips: Ketik ide singkat di bawah, lalu klik salah satu tombol aksi cepat untuk mulai membangun.
                </motion.p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <motion.div
                className="relative mb-6"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
            >
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center shadow-2xl shadow-primary/30">
                    <svg
                        className="h-8 w-8 text-primary-foreground"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                    >
                        <path d="M12 2L2 7l10 5 10-5-10-5z" />
                        <path d="M2 17l10 5 10-5" />
                        <path d="M2 12l10 5 10-5" />
                    </svg>
                </div>
                <div className="absolute -inset-4 bg-primary/10 rounded-3xl blur-2xl -z-10" />
            </motion.div>

            <motion.h1
                className="text-2xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
            >
                Selamat Datang di Nexus AI
            </motion.h1>
            <motion.p
                className="text-sm text-muted-foreground max-w-md mb-8"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
            >
                Asisten cerdas Anda yang ditenagai oleh model AI terbaru. Mulai percakapan 
                di bawah atau beralih ke mode PRD untuk menyusun dokumen produk.
            </motion.p>

            <div className="grid gap-3 sm:grid-cols-3 max-w-lg w-full">
                {suggestions.map((suggestion, i) => (
                    <motion.button
                        key={suggestion.text}
                        className="group flex items-center gap-2 rounded-xl border border-border/50 bg-secondary/30 px-4 py-3 text-left text-xs transition-all hover:bg-secondary/60 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + i * 0.08 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSuggestionClick?.(suggestion.text)}
                    >
                        <span className="text-base">{suggestion.emoji}</span>
                        <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                            {suggestion.text}
                        </span>
                    </motion.button>
                ))}
            </div>
        </div>
    );
}
