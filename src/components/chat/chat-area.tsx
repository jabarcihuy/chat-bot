"use client";

import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "./chat-message";
import { ThinkingIndicator } from "./thinking-indicator";
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

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    return (
        <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
                <div className="max-w-3xl mx-auto py-4 space-y-1">
                    {messages.length === 0 && !isLoading && (
                        <WelcomeScreen onSuggestionClick={onSuggestionClick} />
                    )}

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

                    <AnimatePresence>
                        {isLoading &&
                            (messages.length === 0 ||
                                messages[messages.length - 1]?.role !== "assistant") && (
                                <ThinkingIndicator />
                            )}
                    </AnimatePresence>

                    <div ref={bottomRef} />
                </div>
            </ScrollArea>
        </div>
    );
}

interface WelcomeScreenProps {
    onSuggestionClick?: (text: string) => void;
}

function WelcomeScreen({ onSuggestionClick }: WelcomeScreenProps) {
    const suggestions = [
        { emoji: "💡", text: "Explain quantum computing" },
        { emoji: "📝", text: "Write a React component" },
        { emoji: "🎯", text: "Debug my Python code" },
    ];

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
                Welcome to Nexus AI
            </motion.h1>
            <motion.p
                className="text-sm text-muted-foreground max-w-md mb-8"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
            >
                Your intelligent assistant powered by the latest AI models. Start a
                conversation below or configure your API key in Settings.
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
