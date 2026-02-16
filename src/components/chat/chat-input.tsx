"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Square, Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ChatInputProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
    onStop: () => void;
    isLoading: boolean;
    disabled?: boolean;
}

export function ChatInput({
    value,
    onChange,
    onSubmit,
    onStop,
    isLoading,
    disabled,
}: ChatInputProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [isListening, setIsListening] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognitionRef = useRef<any>(null);

    // Auto-resize textarea
    const adjustHeight = useCallback(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = "auto";
        el.style.height = Math.min(el.scrollHeight, 200) + "px";
    }, []);

    useEffect(() => {
        adjustHeight();
    }, [value, adjustHeight]);

    // Focus on mount
    useEffect(() => {
        textareaRef.current?.focus();
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (!isLoading && value.trim()) onSubmit();
        }
    };

    const toggleVoice = () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const w = window as any;
        if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
            return;
        }

        if (isListening && recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
            return;
        }

        const SpeechRecognitionCtor =
            w.SpeechRecognition || w.webkitSpeechRecognition;
        const recognition = new SpeechRecognitionCtor();
        recognitionRef.current = recognition;

        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onresult = (event: any) => {
            let transcript = "";
            for (let i = 0; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }
            onChange(transcript);
        };

        recognition.onerror = () => {
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
        setIsListening(true);
    };

    return (
        <motion.div
            className="glass border-t border-border/50 p-3 sm:p-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
        >
            <div className="max-w-3xl mx-auto">
                <div className="relative flex items-end gap-2 rounded-2xl bg-secondary/40 border border-border/50 p-2 transition-colors focus-within:border-primary/30 focus-within:bg-secondary/60">
                    <textarea
                        ref={textareaRef}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Send a message..."
                        rows={1}
                        disabled={disabled}
                        className="flex-1 resize-none bg-transparent text-sm leading-relaxed px-2 py-1.5 outline-none placeholder:text-muted-foreground/50 disabled:opacity-50 max-h-[200px]"
                    />

                    <div className="flex items-center gap-1 shrink-0">
                        {/* Voice button */}
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={toggleVoice}
                                type="button"
                            >
                                <AnimatePresence mode="wait">
                                    {isListening ? (
                                        <motion.div
                                            key="mic-off"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            exit={{ scale: 0 }}
                                        >
                                            <MicOff className="h-4 w-4 text-destructive" />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="mic"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            exit={{ scale: 0 }}
                                        >
                                            <Mic className="h-4 w-4 text-muted-foreground" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </Button>
                        </motion.div>

                        {/* Send / Stop button */}
                        <AnimatePresence mode="wait">
                            {isLoading ? (
                                <motion.div
                                    key="stop"
                                    initial={{ scale: 0, rotate: -90 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    exit={{ scale: 0, rotate: 90 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                >
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        className="h-8 w-8 rounded-xl"
                                        onClick={onStop}
                                    >
                                        <Square className="h-3.5 w-3.5" />
                                    </Button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="send"
                                    initial={{ scale: 0, rotate: -90 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    exit={{ scale: 0, rotate: 90 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                >
                                    <Button
                                        size="icon"
                                        className="h-8 w-8 rounded-xl"
                                        onClick={onSubmit}
                                        disabled={!value.trim() || disabled}
                                    >
                                        <Send className="h-3.5 w-3.5" />
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
                <p className="text-[10px] text-muted-foreground/40 text-center mt-2">
                    Nexus AI can make mistakes. Verify important information.
                </p>
            </div>
        </motion.div>
    );
}
