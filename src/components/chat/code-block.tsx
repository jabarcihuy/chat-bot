"use client";

import { useState } from "react";
import { Check, Copy, ChevronDown, ChevronUp } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface CodeBlockProps {
    language: string;
    code: string;
}

export function CodeBlock({ language, code }: CodeBlockProps) {
    const [copied, setCopied] = useState(false);
    const [collapsed, setCollapsed] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        toast.success("Code copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    const lines = code.split("\n").length;

    return (
        <motion.div
            className="relative my-3 rounded-xl overflow-hidden border border-border/30 bg-[#1e1e2e]"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            {/* Header bar */}
            <div className="flex items-center justify-between px-4 py-2 bg-[#181825] border-b border-white/5">
                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-[#cdd6f4]/60 uppercase tracking-wide">
                        {language || "text"}
                    </span>
                    <span className="text-[10px] text-[#cdd6f4]/30">
                        {lines} {lines === 1 ? "line" : "lines"}
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    {lines > 20 && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-[#cdd6f4]/50 hover:text-[#cdd6f4] hover:bg-white/5"
                            onClick={() => setCollapsed(!collapsed)}
                        >
                            {collapsed ? (
                                <ChevronDown className="h-3 w-3" />
                            ) : (
                                <ChevronUp className="h-3 w-3" />
                            )}
                        </Button>
                    )}
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-[#cdd6f4]/50 hover:text-[#cdd6f4] hover:bg-white/5"
                            onClick={handleCopy}
                        >
                            {copied ? (
                                <Check className="h-3 w-3 text-emerald-400" />
                            ) : (
                                <Copy className="h-3 w-3" />
                            )}
                        </Button>
                    </motion.div>
                </div>
            </div>

            {/* Code content */}
            <div
                className={
                    collapsed ? "max-h-[120px] overflow-hidden relative" : undefined
                }
            >
                <SyntaxHighlighter
                    language={language || "text"}
                    style={oneDark}
                    customStyle={{
                        margin: 0,
                        padding: "1rem",
                        background: "transparent",
                        fontSize: "0.8125rem",
                        lineHeight: "1.6",
                    }}
                    showLineNumbers={lines > 3}
                    lineNumberStyle={{
                        minWidth: "2em",
                        paddingRight: "1em",
                        color: "rgba(205, 214, 244, 0.2)",
                        fontSize: "0.75rem",
                    }}
                >
                    {code}
                </SyntaxHighlighter>
                {collapsed && (
                    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#1e1e2e] to-transparent" />
                )}
            </div>
        </motion.div>
    );
}
