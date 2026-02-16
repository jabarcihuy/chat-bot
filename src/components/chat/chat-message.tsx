"use client";

import { motion } from "framer-motion";
import { Sparkles, User } from "lucide-react";
import { MarkdownRenderer } from "./markdown-renderer";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
    role: "user" | "assistant" | "system";
    content: string;
    isStreaming?: boolean;
}

export function ChatMessage({ role, content, isStreaming }: ChatMessageProps) {
    const isUser = role === "user";

    return (
        <motion.div
            className={cn(
                "flex items-start gap-3 px-4 py-3",
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
                    "max-w-[80%] min-w-0 rounded-2xl px-4 py-2.5",
                    isUser
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-secondary/60 rounded-tl-sm"
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
                    </div>
                )}
            </div>
        </motion.div>
    );
}
