"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function ThinkingIndicator() {
    return (
        <motion.div
            className="flex items-start gap-3 px-4 py-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
        >
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="flex items-center gap-2 pt-2">
                <div className="flex space-x-1.5">
                    <div className="h-2 w-2 rounded-full bg-primary/60 thinking-dot" />
                    <div className="h-2 w-2 rounded-full bg-primary/60 thinking-dot" />
                    <div className="h-2 w-2 rounded-full bg-primary/60 thinking-dot" />
                </div>
                <span className="text-xs text-muted-foreground ml-1">Thinking...</span>
            </div>
        </motion.div>
    );
}
