"use client";

import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "./chat-message";
import { ThinkingIndicator } from "./thinking-indicator";
import { useSettingsStore } from "@/store/settings-store";
import { 
    Rocket, 
    MessageSquare, 
    Square, 
    Plus, 
    Info, 
    ArrowDown,
    Code,
    Zap,
    FileCheck,
    AlertTriangle,
    RefreshCw,
    Database,
    MousePointer,
    Server,
    Shield,
    Cloud,
    GitBranch,
    HelpCircle,
    Settings,
    Palette
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { UIMessage } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";

import { useChatStore } from "@/store/chat-store";

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
    const containerRef = useRef<HTMLDivElement>(null);
    const { mode } = useSettingsStore();
    const { activeChatId } = useChatStore();
    const [showScrollButton, setShowScrollButton] = useState(false);

    // Auto-scroll to bottom of viewport container (prevents browser window scroll/layout shift)
    useEffect(() => {
        const viewport = containerRef.current?.querySelector('[data-slot="scroll-area-viewport"]');
        if (viewport) {
            setTimeout(() => {
                viewport.scrollTo({
                    top: viewport.scrollHeight,
                    behavior: "smooth"
                });
            }, 60);
        }
    }, [messages, isLoading]);

    // Scroll back to the top of viewport and ensure window stays at (0,0)
    useEffect(() => {
        if (typeof window !== "undefined") {
            window.scrollTo(0, 0);
        }
        const viewport = containerRef.current?.querySelector('[data-slot="scroll-area-viewport"]');
        if (viewport) {
            viewport.scrollTop = 0;
        }
    }, [activeChatId, mode]);

    // Listen to scroll events to toggle scroll-to-bottom button visibility
    useEffect(() => {
        const viewport = containerRef.current?.querySelector('[data-slot="scroll-area-viewport"]');
        if (!viewport) return;

        const handleScroll = () => {
            const offsetFromBottom = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight;
            setShowScrollButton(offsetFromBottom > 300);
        };

        viewport.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();

        return () => {
            viewport.removeEventListener("scroll", handleScroll);
        };
    }, [messages, isLoading]);

    const scrollToBottom = () => {
        const viewport = containerRef.current?.querySelector('[data-slot="scroll-area-viewport"]');
        if (viewport) {
            viewport.scrollTo({
                top: viewport.scrollHeight,
                behavior: "smooth"
            });
        }
    };

    return (
        <div ref={containerRef} className="flex-1 overflow-hidden min-h-0 relative">
            <ScrollArea className="h-full w-full">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 pb-28 sm:pb-32 space-y-4">
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

                    <div className="h-4" />
                </div>
            </ScrollArea>

            {/* Scroll-to-Bottom Button */}
            <AnimatePresence>
                {showScrollButton && (
                    <motion.div
                        className="absolute bottom-24 sm:bottom-28 right-5 z-20"
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 10 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Button
                            variant="secondary"
                            size="icon"
                            onClick={scrollToBottom}
                            className="h-10 w-10 rounded-full shadow-lg border border-border/10 bg-background/80 backdrop-blur-md hover:bg-secondary/80 flex items-center justify-center text-foreground hover:scale-105 transition-transform"
                            aria-label="Gulir ke bawah"
                        >
                            <ArrowDown className="h-5 w-5 animate-bounce" />
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

interface WelcomeScreenProps {
    onSuggestionClick?: (text: string) => void;
    mode?: "chat" | "prd" | "coder" | "debugger" | "architect";
}

interface WelcomeCard {
    id: string;
    icon: React.ReactNode;
    title: string;
    desc: string;
    prompt: string;
}

interface WelcomeConfig {
    badge: string;
    title: string;
    desc: string;
    theme: "emerald" | "rose" | "amber" | "accent" | "primary";
    cards: WelcomeCard[];
}

function WelcomeScreen({ onSuggestionClick, mode }: WelcomeScreenProps) {
    const { prdTask, setPrdTask } = useSettingsStore();

    const getWelcomeConfig = (): WelcomeConfig => {
        switch (mode) {
            case "coder":
                return {
                    badge: "Mode Asisten Coding",
                    title: "Coding Workspace",
                    desc: "Mulai kembangkan ide Anda menjadi baris kode berkualitas tinggi. Pilih spesialisasi instruksi pemrograman di bawah:",
                    theme: "emerald",
                    cards: [
                        {
                            id: "feature",
                            icon: <Code className="h-4 w-4" />,
                            title: "Buat Fitur Baru",
                            desc: "Tulis komponen UI, fungsi backend, utility helper, atau boilerplate proyek.",
                            prompt: "Tulis custom React Hook untuk throttling API request"
                        },
                        {
                            id: "optimize",
                            icon: <Zap className="h-4 w-4" />,
                            title: "Refaktor & Kecepatan",
                            desc: "Meningkatkan efisiensi algoritma, merapikan struktur clean code, dan memperbaiki kompleksitas waktu.",
                            prompt: "Tulis fungsi Javascript untuk melakukan deep merge objek dengan cepat"
                        },
                        {
                            id: "api",
                            icon: <Square className="h-4 w-4" />,
                            title: "Rancang REST API",
                            desc: "Buat endpoint API menggunakan Express, NestJS, Next.js, Fastify, atau REST framework.",
                            prompt: "Buat REST API sederhana dengan Express.js dan TypeScript"
                        },
                        {
                            id: "test",
                            icon: <FileCheck className="h-4 w-4" />,
                            title: "Tulis Unit Test",
                            desc: "Tulis skenario pengujian unit otomatis menggunakan Jest, Vitest, Cypress, atau Mocha.",
                            prompt: "Tulis unit test menggunakan Jest untuk fungsi utilitas pemformatan tanggal"
                        }
                    ]
                };
            case "debugger":
                return {
                    badge: "Mode Diagnosis Bug",
                    title: "Diagnostic Center",
                    desc: "Temukan dan musnahkan bug/error pada aplikasi Anda. Pilih kategori masalah debug di bawah:",
                    theme: "rose",
                    cards: [
                        {
                            id: "runtime",
                            icon: <AlertTriangle className="h-4 w-4" />,
                            title: "Analisis Stack Trace",
                            desc: "Pahami pesan kegagalan crash, runtime error, stack trace, dan cari solusinya.",
                            prompt: "Mengapa muncul error 'PrismaClient is not configured to run in Edge Runtime'?"
                        },
                        {
                            id: "memory",
                            icon: <RefreshCw className="h-4 w-4" />,
                            title: "Perbaiki Memory & Loop",
                            desc: "Identifikasi re-render tak berujung, kebocoran memori, atau konsumsi CPU berlebihan.",
                            prompt: "Debug loop tak terbatas di dependency array useEffect ini"
                        },
                        {
                            id: "database",
                            icon: <Database className="h-4 w-4" />,
                            title: "Masalah DB & ORM",
                            desc: "Atasi error query database, relasi gagal, atau kesalahan sinkronisasi migrasi skema.",
                            prompt: "Perbaiki masalah error Prisma 'Foreign key constraint failed on the db'"
                        },
                        {
                            id: "events",
                            icon: <MousePointer className="h-4 w-4" />,
                            title: "Memory Leak Listener",
                            desc: "Diagnosis pembersihan event listener, cleanup interval, dan performa DOM.",
                            prompt: "Perbaiki masalah Memory Leak pada event listener window scroll"
                        }
                    ]
                };
            case "architect":
                return {
                    badge: "Mode Arsitek Sistem",
                    title: "System Blueprint",
                    desc: "Rancang rancang-bangun software, skema database, atau diagram alir data berskala besar:",
                    theme: "amber",
                    cards: [
                        {
                            id: "relational",
                            icon: <Database className="h-4 w-4" />,
                            title: "Rancang Relasi DB",
                            desc: "Desain skema tabel database relasional (PostgreSQL, MySQL) dengan relasi multi-tenant.",
                            prompt: "Rancang skema database PostgreSQL untuk sistem e-commerce multi-tenant"
                        },
                        {
                            id: "microservices",
                            icon: <Server className="h-4 w-4" />,
                            title: "Sistem Terdistribusi",
                            desc: "Desain arsitektur microservices, antrean pesan, caching, dan skalabilitas backend.",
                            prompt: "Buat arsitektur microservices untuk aplikasi streaming video"
                        },
                        {
                            id: "security",
                            icon: <Shield className="h-4 w-4" />,
                            title: "Keamanan Stateless",
                            desc: "Tentukan protokol otentikasi JWT, session management, OAuth2, atau refresh token.",
                            prompt: "Rancang mekanisme otentikasi stateless menggunakan JWT dan Refresh Token"
                        },
                        {
                            id: "cloud",
                            icon: <Cloud className="h-4 w-4" />,
                            title: "Desain Infrastruktur",
                            desc: "Sketsa topologi cloud, load balancing, CDN, serverless, dan pipeline deployment.",
                            prompt: "Rancang arsitektur cloud AWS dengan auto-scaling group untuk website trafik tinggi"
                        }
                    ]
                };
            case "prd":
                return {
                    badge: "Panduan Mode PRD",
                    title: "Vibe Coder Workspace",
                    desc: "Pilih satu fokus tugas di bawah untuk mulai membangun dokumen Anda. Gemini akan menyesuaikan keahliannya berdasarkan pilihan Anda.",
                    theme: "accent",
                    cards: [
                        { 
                            id: "structure",
                            icon: <Rocket className="h-4 w-4" />, 
                            title: "Struktur PRD", 
                            desc: "Ubah ide kasar Anda menjadi kerangka dokumen formal (Konteks, Masalah, Batasan).",
                            prompt: ""
                        },
                        { 
                            id: "stories",
                            icon: <MessageSquare className="h-4 w-4" />, 
                            title: "User Stories", 
                            desc: "Jabarkan skenario pengguna secara spesifik (Sebagai... Saya ingin... Sehingga...).",
                            prompt: ""
                        },
                        { 
                            id: "tech",
                            icon: <Square className="h-4 w-4" />, 
                            title: "Tech Stack", 
                            desc: "Minta rekomendasi teknologi dan arsitektur yang paling pas untuk proyek Anda.",
                            prompt: ""
                        },
                        { 
                            id: "metrics",
                            icon: <Plus className="h-4 w-4" />, 
                            title: "Metrik Sukses", 
                            desc: "Tentukan tolok ukur keberhasilan dan antisipasi berbagai edge cases.",
                            prompt: ""
                        }
                    ]
                };
            default: // chat / general helper
                return {
                    badge: "Bantuan Developer Umum",
                    title: "Developer Hub",
                    desc: "Tanyakan apa saja tentang pemecahan masalah algoritma, refactoring, konsep dasar, atau obrolan santai:",
                    theme: "primary",
                    cards: [
                        {
                            id: "algorithms",
                            icon: <GitBranch className="h-4 w-4" />,
                            title: "Struktur Data & Logika",
                            desc: "Analisis kompleksitas waktu Big O, implementasi sorting, search, atau rekursi.",
                            prompt: "Jelaskan konsep dan perbedaan antara Breadth-First Search (BFS) dan Depth-First Search (DFS)"
                        },
                        {
                            id: "theory",
                            icon: <HelpCircle className="h-4 w-4" />,
                            title: "Konsep Teknologi Baru",
                            desc: "Pelajari komputasi kuantum, model bahasa besar, serverless, atau paradigma OOP vs FP.",
                            prompt: "Jelaskan tentang Quantum Computing secara sederhana"
                        },
                        {
                            id: "standards",
                            icon: <Settings className="h-4 w-4" />,
                            title: "Best Practices & SOLID",
                            desc: "Rancang code review yang bersih, penulisan git commit yang benar, dan dokumentasi API.",
                            prompt: "Bagaimana cara menulis commit message yang baik menggunakan Conventional Commits?"
                        },
                        {
                            id: "styling",
                            icon: <Palette className="h-4 w-4" />,
                            title: "Slicing UI & CSS Layout",
                            desc: "Atasi flexbox alignment, grid layouts, responsive queries, atau animasi framer motion.",
                            prompt: "Berikan tips merancang tata letak CSS Grid yang responsif tanpa media query"
                        }
                    ]
                };
        }
    };

    const getThemeStyles = (theme: string, active: boolean) => {
        const styles: Record<string, { badge: string; cardActive: string; iconActive: string; iconHover: string }> = {
            emerald: {
                badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
                cardActive: "bg-emerald-500/5 border-emerald-500 shadow-lg shadow-emerald-500/5",
                iconActive: "bg-emerald-500 text-white",
                iconHover: "bg-secondary/50 text-muted-foreground group-hover:text-emerald-400 group-hover:bg-emerald-500/15"
            },
            rose: {
                badge: "bg-rose-500/10 text-rose-400 border-rose-500/20",
                cardActive: "bg-rose-500/5 border-rose-500 shadow-lg shadow-rose-500/5",
                iconActive: "bg-rose-500 text-white",
                iconHover: "bg-secondary/50 text-muted-foreground group-hover:text-rose-400 group-hover:bg-rose-500/15"
            },
            amber: {
                badge: "bg-amber-500/10 text-amber-400 border-amber-500/20",
                cardActive: "bg-amber-500/5 border-amber-500 shadow-lg shadow-amber-500/5",
                iconActive: "bg-amber-500 text-white",
                iconHover: "bg-secondary/50 text-muted-foreground group-hover:text-amber-400 group-hover:bg-amber-500/15"
            },
            accent: {
                badge: "bg-accent/10 text-accent border-accent/20",
                cardActive: "bg-accent/5 border-accent shadow-lg shadow-accent/5",
                iconActive: "bg-accent text-accent-foreground",
                iconHover: "bg-secondary/50 text-muted-foreground group-hover:text-accent group-hover:bg-accent/15"
            },
            primary: {
                badge: "bg-primary/10 text-primary border-primary/20",
                cardActive: "bg-primary/5 border-primary shadow-lg shadow-primary/5",
                iconActive: "bg-primary text-primary-foreground",
                iconHover: "bg-secondary/50 text-muted-foreground group-hover:text-primary group-hover:bg-primary/15"
            }
        };
        const current = styles[theme] || styles.primary;
        return {
            badge: current.badge,
            card: active ? current.cardActive : "bg-card border-border/10 hover:border-primary/30",
            icon: active ? current.iconActive : current.iconHover
        };
    };

    const config = getWelcomeConfig();

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-16rem)] px-4">
            <motion.div
                className="mb-8 text-center max-w-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className={cn(
                    "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4 border",
                    getThemeStyles(config.theme, false).badge
                )}>
                    <Info className="h-3 w-3" />
                    {config.badge}
                </div>
                <h1 className="text-3xl font-black mb-3 tracking-tight">{config.title}</h1>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    {config.desc}
                </p>
            </motion.div>

            <div className="grid gap-4 sm:grid-cols-2 w-full max-w-3xl">
                {config.cards.map((item, i) => {
                    const isPrdActive = mode === "prd" && prdTask === item.id;
                    const styles = getThemeStyles(config.theme, isPrdActive);
                    return (
                        <motion.button
                            key={item.id}
                            className={cn(
                                "p-5 rounded-2xl border transition-all text-left group",
                                styles.card
                            )}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 + i * 0.05 }}
                            onClick={() => {
                                if (mode === "prd") {
                                    setPrdTask(item.id as any);
                                    document.querySelector('textarea')?.focus();
                                } else {
                                    onSuggestionClick?.(item.prompt);
                                }
                            }}
                        >
                            <div className="flex items-start gap-4">
                                <div className={cn(
                                    "p-2.5 rounded-xl transition-colors shrink-0",
                                    styles.icon
                                )}>
                                    {item.icon}
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-sm font-bold">{item.title}</h3>
                                    <p className="text-xs text-muted-foreground leading-normal">
                                        {item.desc}
                                    </p>
                                </div>
                            </div>
                        </motion.button>
                    );
                })}
            </div>

            <motion.p 
                className="mt-10 text-[11px] text-muted-foreground/60 italic"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                {mode === "prd" ? (
                    <>
                        Target aktif: <span className="font-bold text-primary uppercase">{prdTask}</span>. Ketik ide Anda di bawah dan tekan Enter.
                    </>
                ) : (
                    "Pilih topik di atas atau tulis pertanyaan Anda sendiri di bawah."
                )}
            </motion.p>
        </div>
    );
}
