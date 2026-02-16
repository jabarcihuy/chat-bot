"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useChat, Chat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { toast } from "sonner";
import { AnimatedBackground } from "@/components/layout/animated-bg";
import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/sidebar/sidebar";
import { ChatArea } from "@/components/chat/chat-area";
import { ChatInput } from "@/components/chat/chat-input";
import { SettingsDialog } from "@/components/settings/settings-dialog";
import { useChatStore } from "@/store/chat-store";
import { useSettingsStore } from "@/store/settings-store";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";

// Helper to extract text from UIMessage parts
export function getMessageText(
  parts: Array<{ type: string; text?: string }>
): string {
  return parts
    .filter((p) => p.type === "text")
    .map((p) => p.text || "")
    .join("");
}

export default function Home() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const {
    chats,
    activeChatId,
    createChat,
    updateChatMessages,
    setActiveChat,
  } = useChatStore();
  const { apiKey, provider, model, temperature, systemPrompt } =
    useSettingsStore();

  const activeChat = chats.find((c) => c.id === activeChatId);

  // Create a memoized Chat instance using the new v6 API
  const chatInstance = useMemo(() => {
    return new Chat({
      transport: new DefaultChatTransport({
        api: "/api/chat",
        body: {
          apiKey,
          provider,
          model,
          temperature,
          systemPrompt,
        },
      }),
      onError: (error) => {
        toast.error(error.message || "Something went wrong");
      },
      onFinish: () => {
        // Messages synced via the effect below
      },
    });
  }, [apiKey, provider, model, temperature, systemPrompt]);

  const { messages, setMessages, status, sendMessage, stop } =
    useChat({ chat: chatInstance });

  const isLoading = status === "submitted" || status === "streaming";

  // Hydration safety
  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync messages to store when they change
  useEffect(() => {
    if (activeChatId && messages.length > 0) {
      updateChatMessages(
        activeChatId,
        messages.map((m) => ({
          id: m.id,
          role: m.role as "user" | "assistant" | "system",
          content: getMessageText(m.parts),
          createdAt: new Date(),
        }))
      );
    }
  }, [messages, activeChatId, updateChatMessages]);

  // Load messages when switching chats
  useEffect(() => {
    if (activeChat && activeChat.messages.length > 0) {
      setMessages(
        activeChat.messages.map((m) => ({
          id: m.id,
          role: m.role,
          parts: [{ type: "text" as const, text: m.content }],
        }))
      );
    } else {
      setMessages([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChatId]);

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onNewChat: () => {
      createChat();
    },
    onToggleSidebar: () => {
      useChatStore.getState().toggleSidebar();
    },
  });

  const handleSuggestion = useCallback(
    (text: string) => {
      setInputValue(text);
      // Focus the textarea so user can see the text and hit enter
      setTimeout(() => {
        const textarea = document.querySelector('textarea');
        textarea?.focus();
      }, 50);
    },
    []
  );

  const handleSubmit = useCallback(() => {
    if (!inputValue.trim()) return;

    if (!apiKey) {
      toast.error("Please add your API key in Settings first.", {
        action: {
          label: "Open Settings",
          onClick: () => setSettingsOpen(true),
        },
      });
      return;
    }

    // Create a new chat if none active
    let chatId = activeChatId;
    if (!chatId) {
      chatId = createChat();
      setActiveChat(chatId);
    }

    sendMessage({ text: inputValue.trim() });
    setInputValue("");
  }, [inputValue, apiKey, activeChatId, createChat, setActiveChat, sendMessage]);

  if (!mounted) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <AnimatedBackground />
      <Sidebar />

      <div className="relative z-10 flex flex-1 flex-col min-w-0">
        <Header onOpenSettings={() => setSettingsOpen(true)} />

        <ChatArea
          messages={messages}
          isLoading={isLoading}
          onSuggestionClick={handleSuggestion}
        />

        <ChatInput
          value={inputValue}
          onChange={setInputValue}
          onSubmit={handleSubmit}
          onStop={stop}
          isLoading={isLoading}
        />
      </div>

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}
