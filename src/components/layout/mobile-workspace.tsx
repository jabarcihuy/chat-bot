"use client";

import { useState } from "react";
import { useSettingsStore } from "@/store/settings-store";
import { useChatStore } from "@/store/chat-store";
import { Header } from "./header";
import { ChatArea } from "@/components/chat/chat-area";
import { ChatInput } from "@/components/chat/chat-input";
import { PrdCanvas } from "@/components/chat/prd-canvas";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { UIMessage } from "@ai-sdk/react";

interface MobileWorkspaceProps {
    messages: UIMessage[];
    isLoading: boolean;
    inputValue: string;
    setInputValue: (val: string) => void;
    handleSubmit: () => void;
    stop: () => void;
    handleSuggestion: (text: string) => void;
    onOpenSettings: () => void;
}

export function MobileWorkspace({
    messages,
    isLoading,
    inputValue,
    setInputValue,
    handleSubmit,
    stop,
    handleSuggestion,
    onOpenSettings,
}: MobileWorkspaceProps) {
    const { mode } = useSettingsStore();
    const { activeChatId } = useChatStore();
    const [activeMobileTab, setActiveMobileTab] = useState<"chat" | "canvas">("chat");
    const [prevKey, setPrevKey] = useState("");

    // Reset mobile tab to chat during render when activeChatId or mode changes to avoid cascading effects
    const currentKey = `${activeChatId}-${mode}`;
    if (prevKey !== currentKey) {
        setPrevKey(currentKey);
        setActiveMobileTab("chat");
    }

    return (
        <div className="flex md:hidden flex-col flex-1 min-w-0 bg-transparent h-full overflow-hidden">
            <Header onOpenSettings={onOpenSettings} />

            {/* Mobile Tab Switcher (Visible in split-pane modes) */}
            {mode !== "chat" && (
                <div className="flex bg-muted/20 p-2 border-b border-border/10 justify-center gap-2 shrink-0">
                    <Button
                        variant={activeMobileTab === "chat" ? "default" : "ghost"}
                        size="sm"
                        className={cn(
                            "flex-1 h-8 rounded-xl text-xs font-bold transition-all",
                            activeMobileTab === "chat" ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground"
                        )}
                        onClick={() => setActiveMobileTab("chat")}
                    >
                        Obrolan
                    </Button>
                    <Button
                        variant={activeMobileTab === "canvas" ? "default" : "ghost"}
                        size="sm"
                        className={cn(
                            "flex-1 h-8 rounded-xl text-xs font-bold transition-all",
                            activeMobileTab === "canvas" ? "bg-accent text-accent-foreground shadow" : "text-muted-foreground"
                        )}
                        onClick={() => setActiveMobileTab("canvas")}
                    >
                        {mode === "prd" ? "Kanvas PRD" : mode === "coder" ? "Kanvas Kode" : mode === "debugger" ? "Diagnosis" : "Arsitektur"}
                    </Button>
                </div>
            )}

            <div className="flex-1 min-h-0 relative overflow-hidden flex flex-col">
                {/* Chat Tab View */}
                <div className={cn(
                    "flex-col h-full min-w-0 flex-1 relative",
                    mode !== "chat" && activeMobileTab !== "chat" ? "hidden" : "flex"
                )}>
                    <main className="flex-1 flex flex-col overflow-hidden relative">
                        <ChatArea
                            messages={messages}
                            isLoading={isLoading}
                            onSuggestionClick={handleSuggestion}
                        />
                    </main>

                    <ChatInput
                        value={inputValue}
                        onChange={setInputValue}
                        onSubmit={handleSubmit}
                        onStop={stop}
                        isLoading={isLoading}
                    />
                </div>

                {/* Canvas Tab View */}
                {mode !== "chat" && activeMobileTab === "canvas" && (
                    <div className="h-full flex flex-col min-w-0 flex-1">
                        <PrdCanvas />
                    </div>
                )}
            </div>
        </div>
    );
}
