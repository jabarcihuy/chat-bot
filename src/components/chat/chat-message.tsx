"use client";

import { motion } from "framer-motion";
import { Download, Copy, Check, FilePlus2 } from "lucide-react";
import { MarkdownRenderer } from "./markdown-renderer";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/store/settings-store";
import { useChatStore } from "@/store/chat-store";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ChatMessageProps {
    role: "user" | "assistant" | "system";
    content: string;
    isStreaming?: boolean;
}

export function ChatMessage({ role, content, isStreaming }: ChatMessageProps) {
    const isUser = role === "user";
    const { mode, prdTask } = useSettingsStore();
    const { activeChatId, chats, updateChatPrdDocument } = useChatStore();
    const [copied, setCopied] = useState(false);

    const activeChat = chats.find((c) => c.id === activeChatId);

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const downloadMarkdown = () => {
        // Extract title from first line or use default
        const firstLine = content.split('\n')[0].replace(/[#*]/g, '').trim();
        const fileName = firstLine ? `PRD-${firstLine.replace(/\s+/g, '-')}` : `PRD-${prdTask}-${Date.now()}`;
        
        const blob = new Blob([content], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${fileName}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleInsertToCanvas = () => {
        if (!activeChatId) {
            toast.error("Tidak ada obrolan aktif!");
            return;
        }
        const currentDoc = activeChat?.prdDocument || "";
        const updatedDoc = currentDoc ? `${currentDoc}\n\n${content}` : content;
        updateChatPrdDocument(activeChatId, updatedDoc);
        toast.success("Konten berhasil ditambahkan ke Kanvas PRD!");
    };

    return (
        <motion.div
            className={cn(
                "flex items-start w-full py-2.5 sm:py-3 group/msg",
                isUser ? "justify-end" : "justify-start"
            )}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
        >

            {/* Message bubble */}
            <div
                className={cn(
                    "w-fit max-w-full sm:max-w-[85%] min-w-0 rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 shadow-sm border border-border/10 relative",
                    isUser
                        ? "bg-primary text-primary-foreground rounded-tr-md"
                        : "bg-card text-card-foreground rounded-tl-md"
                )}
            >
                {isUser ? (
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                        {content}
                    </p>
                ) : (
                    <div className="text-sm">
                        <MarkdownRenderer content={content} />
                        {isStreaming && (
                            <motion.span
                                className="inline-block w-1.5 h-4 bg-primary/70 rounded-full ml-0.5 -mb-0.5"
                                animate={{ opacity: [1, 0] }}
                                transition={{
                                    duration: 0.8,
                                    repeat: Infinity,
                                    repeatType: "reverse",
                                }}
                            />
                        )}
                        
                        {/* Action Buttons for AI Message */}
                        {!isStreaming && content && (
                            <div className="flex flex-wrap items-center gap-1.5 mt-4 pt-3 border-t border-border/5">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2 text-[10px] gap-1 hover:bg-secondary/50 text-muted-foreground"
                                    onClick={handleCopy}
                                    title={copied ? "Tersalin" : "Salin"}
                                >
                                    {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
                                    <span className="hidden sm:inline">{copied ? "Tersalin" : "Salin"}</span>
                                </Button>
                                
                                {mode === "prd" && (
                                    <>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="h-7 px-2 text-[10px] gap-1 font-bold shadow-sm"
                                            onClick={downloadMarkdown}
                                            title="Unduh .md"
                                        >
                                            <Download className="h-3.5 w-3.5" />
                                            <span className="hidden sm:inline">Unduh .md</span>
                                        </Button>

                                        <Button
                                            variant="default"
                                            size="sm"
                                            className="h-7 px-2 text-[10px] gap-1 font-bold shadow-sm bg-accent text-accent-foreground hover:bg-accent/90"
                                            onClick={handleInsertToCanvas}
                                            title="Masukkan ke Kanvas"
                                        >
                                            <FilePlus2 className="h-3.5 w-3.5" />
                                            <span className="hidden sm:inline">Masukkan ke Kanvas</span>
                                        </Button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
