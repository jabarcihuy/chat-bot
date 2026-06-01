"use client";

import { motion } from "framer-motion";
import { Sparkles, User, Download, Copy, Check } from "lucide-react";
import { MarkdownRenderer } from "./markdown-renderer";
import { cn } from "@/lib/utils";
import { useSettingsStore } from "@/store/settings-store";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ChatMessageProps {
    role: "user" | "assistant" | "system";
    content: string;
    isStreaming?: boolean;
}

export function ChatMessage({ role, content, isStreaming }: ChatMessageProps) {
    const isUser = role === "user";
    const { mode, prdTask } = useSettingsStore();
    const [copied, setCopied] = useState(false);

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

    return (
        <motion.div
            className={cn(
                "flex items-start gap-3 px-4 py-3 group/msg",
                isUser && "flex-row-reverse"
            )}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
        >
            {/* Avatar */}
            <motion.div
                className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center shrink-0 shadow-lg",
                    isUser
                        ? "bg-gradient-to-br from-secondary to-accent"
                        : "bg-gradient-to-br from-primary/80 to-primary shadow-primary/20"
                )}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
            >
                {isUser ? (
                    <User className="h-4 w-4 text-foreground" />
                ) : (
                    <Sparkles className="h-4 w-4 text-primary-foreground" />
                )}
            </motion.div>

            {/* Message bubble */}
            <div
                className={cn(
                    "max-w-[85%] min-w-0 rounded-2xl px-5 py-3.5 shadow-sm border border-border/10 relative",
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
                            <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border/5 opacity-0 group-hover/msg:opacity-100 transition-opacity">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2 text-[10px] gap-1.5 hover:bg-secondary/50 text-muted-foreground"
                                    onClick={handleCopy}
                                >
                                    {copied ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
                                    {copied ? "Tersalin" : "Salin"}
                                </Button>
                                
                                {mode === "prd" && (
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        className="h-7 px-2 text-[10px] gap-1.5 font-bold shadow-sm"
                                        onClick={downloadMarkdown}
                                    >
                                        <Download className="h-3 w-3" />
                                        Unduh .md
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
