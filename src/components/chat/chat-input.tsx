"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Square, Mic, MicOff, Rocket, MessageSquare, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSettingsStore } from "@/store/settings-store";

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
    const { mode } = useSettingsStore();
    const [isListening, setIsListening] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognitionRef = useRef<any>(null);

    const handleQuickAction = (action: string) => {
        let prefix = "";
        switch (action) {
            case "structure":
                prefix = "Buatkan struktur PRD untuk ide ini: ";
                break;
            case "stories":
                prefix = "Definisikan user stories detail untuk: ";
                break;
            case "tech":
                prefix = "Rekomendasikan tech stack modern dan batasan arsitektur untuk: ";
                break;
            case "metrics":
                prefix = "Apa saja metrik keberhasilan kunci dan edge cases untuk: ";
                break;
        }
        onChange(prefix + value);
        textareaRef.current?.focus();
    };

    // Auto-resize textarea
    const adjustHeight = useCallback(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = "auto";
        el.style.height = Math.min(el.scrollHeight, 250) + "px";
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
        recognition.lang = "id-ID";

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
            className="border-t border-border/10 bg-background p-4 sm:p-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
        >
            <div className="max-w-5xl mx-auto">
                <AnimatePresence>
                    {mode === "prd" && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="flex flex-wrap gap-2 mb-4"
                        >
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 px-4 text-[11px] rounded-full border-primary/20 hover:bg-primary/10 text-primary font-bold"
                                onClick={() => handleQuickAction("structure")}
                            >
                                <Rocket className="h-3.5 w-3.5 mr-2" />
                                Struktur PRD
                            </Button>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 px-4 text-[11px] rounded-full border-accent/20 hover:bg-accent/10 text-accent font-bold"
                                onClick={() => handleQuickAction("stories")}
                            >
                                <MessageSquare className="h-3.5 w-3.5 mr-2" />
                                User Stories
                            </Button>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 px-4 text-[11px] rounded-full border-foreground/10 hover:bg-foreground/5 font-bold"
                                onClick={() => handleQuickAction("tech")}
                            >
                                <Square className="h-3.5 w-3.5 mr-2" />
                                Tech Stack
                            </Button>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 px-4 text-[11px] rounded-full border-foreground/10 hover:bg-foreground/5 font-bold"
                                onClick={() => handleQuickAction("metrics")}
                            >
                                <Plus className="h-3.5 w-3.5 mr-2" />
                                Metrik Sukses
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="relative flex items-end gap-2 rounded-2xl bg-card border border-border/20 p-3 shadow-lg focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/5 transition-all">
                    <textarea
                        ref={textareaRef}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ketik pesan Anda di sini..."
                        rows={1}
                        disabled={disabled}
                        className="flex-1 resize-none bg-transparent text-[15px] leading-relaxed px-2 py-1.5 outline-none placeholder:text-muted-foreground/30 disabled:opacity-50 max-h-[250px]"
                    />

                    <div className="flex items-center gap-2 shrink-0 pb-1">
                        {/* Voice button */}
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 rounded-full"
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
                                            <Mic className="h-4 w-4 text-muted-foreground/60" />
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
                                        className="h-9 w-9 rounded-full"
                                        onClick={onStop}
                                    >
                                        <Square className="h-4 w-4" />
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
                                        className="h-9 w-9 rounded-full bg-primary hover:bg-primary/90 shadow-md shadow-primary/20"
                                        onClick={onSubmit}
                                        disabled={!value.trim() || disabled}
                                    >
                                        <Send className="h-4 w-4" />
                                    </Button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
                <p className="text-[10px] text-muted-foreground/40 text-center mt-2">
                    Nexus AI dapat membuat kesalahan. Verifikasi informasi penting.
                </p>
            </div>
        </motion.div>
    );
}
