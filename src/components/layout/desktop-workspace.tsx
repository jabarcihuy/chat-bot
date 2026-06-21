"use client";

import { useSettingsStore } from "@/store/settings-store";
import { Header } from "./header";
import { ChatArea } from "@/components/chat/chat-area";
import { ChatInput } from "@/components/chat/chat-input";
import { PrdCanvas } from "@/components/chat/prd-canvas";
import { cn } from "@/lib/utils";
import type { UIMessage } from "@ai-sdk/react";

interface DesktopWorkspaceProps {
    messages: UIMessage[];
    isLoading: boolean;
    inputValue: string;
    setInputValue: (val: string) => void;
    handleSubmit: () => void;
    stop: () => void;
    handleSuggestion: (text: string) => void;
    onOpenSettings: () => void;
}

export function DesktopWorkspace({
    messages,
    isLoading,
    inputValue,
    setInputValue,
    handleSubmit,
    stop,
    handleSuggestion,
    onOpenSettings,
}: DesktopWorkspaceProps) {
    const { mode } = useSettingsStore();

    return (
        <div className="hidden md:flex flex-col flex-1 min-w-0 bg-transparent h-full overflow-hidden">
            <Header onOpenSettings={onOpenSettings} />

            <div className={cn(
                "flex-1 min-h-0 relative overflow-hidden",
                mode !== "chat" ? "grid grid-cols-2" : "flex flex-col"
            )}>
                <div className={cn(
                    "flex flex-col h-full min-h-0 min-w-0 relative",
                    mode !== "chat" && "border-r border-border/10"
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

                {/* Right side: Workspace Canvas */}
                {mode !== "chat" && (
                    <div className="h-full min-h-0 flex flex-col min-w-0">
                        <PrdCanvas />
                    </div>
                )}
            </div>
        </div>
    );
}
