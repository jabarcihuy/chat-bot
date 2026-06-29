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
    onOpenDashboard: () => void;
}

const modeBorders = {
    chat: "border-blue-500/10 dark:border-blue-500/20",
    coder: "border-emerald-500/10 dark:border-emerald-500/20",
    prd: "border-rose-500/10 dark:border-rose-500/20",
    debugger: "border-red-500/10 dark:border-red-500/20",
    architect: "border-amber-500/10 dark:border-amber-500/20",
};

const modeBackgrounds = {
    chat: "from-blue-500/[0.03] via-transparent to-transparent",
    coder: "from-emerald-500/[0.03] via-transparent to-transparent",
    prd: "from-rose-500/[0.03] via-transparent to-transparent",
    debugger: "from-red-500/[0.03] via-transparent to-transparent",
    architect: "from-amber-500/[0.03] via-transparent to-transparent",
};

export function DesktopWorkspace({
    messages,
    isLoading,
    inputValue,
    setInputValue,
    handleSubmit,
    stop,
    handleSuggestion,
    onOpenSettings,
    onOpenDashboard,
}: DesktopWorkspaceProps) {
    const { mode } = useSettingsStore();

    return (
        <div className="hidden md:flex flex-col flex-1 min-w-0 bg-[#07070A] h-full overflow-hidden text-foreground">
            {/* Edge-to-Edge Integrated Header */}
            <div className={cn(
                "border-b transition-colors duration-500 ease-in-out bg-[#0B0B0F]/90 backdrop-blur-md z-20",
                modeBorders[mode]
            )}>
                <Header onOpenSettings={onOpenSettings} onOpenDashboard={onOpenDashboard} />
            </div>

            {/* Split Panel Layout (Edge-to-Edge, Integrated, No Floating Margins) */}
            <div className={cn(
                "flex-1 min-h-0 relative overflow-hidden grid z-10",
                mode !== "chat" ? "grid-cols-2" : "grid-cols-1"
            )}>
                {/* Left Panel: Chat Interface */}
                <div className={cn(
                    "flex flex-col h-full min-h-0 min-w-0 relative bg-gradient-to-tr transition-all duration-500 ease-in-out",
                    modeBackgrounds[mode],
                    mode !== "chat" && "border-r",
                    modeBorders[mode]
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

                {/* Right Panel: Workspace Canvas */}
                {mode !== "chat" && (
                    <div className={cn(
                        "h-full min-h-0 flex flex-col min-w-0 bg-gradient-to-tl transition-all duration-500 ease-in-out",
                        modeBackgrounds[mode]
                    )}>
                        <PrdCanvas />
                    </div>
                )}
            </div>
        </div>
    );
}
