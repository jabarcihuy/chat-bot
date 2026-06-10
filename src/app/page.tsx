"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useChat, Chat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { toast } from "sonner";
import { AnimatedBackground } from "@/components/layout/animated-bg";
import { Sidebar } from "@/components/sidebar/sidebar";
import { DesktopWorkspace } from "@/components/layout/desktop-workspace";
import { MobileWorkspace } from "@/components/layout/mobile-workspace";
import { SettingsDialog } from "@/components/settings/settings-dialog";
import { useChatStore } from "@/store/chat-store";
import { useSettingsStore } from "@/store/settings-store";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";

// Helper to extract text from UIMessage parts
export function getMessageText(
  parts?: Array<{ type: string; text?: string }>
): string {
  if (!parts) return "";
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
    setChats,
  } = useChatStore();
  const { model, temperature, systemPrompt, mode, prdTask, customPersonaInstruction } = useSettingsStore();

  const activeChat = chats.find((c) => c.id === activeChatId);

  // Create a memoized Chat instance using the new v6 API
  const chatInstance = useMemo(() => {
    return new Chat({
      transport: new DefaultChatTransport({
        api: "/api/chat",
        body: {
          model,
          temperature,
          systemPrompt,
          mode,
          prdTask,
          prdDocument: activeChat?.prdDocument || "",
          customPersonaInstruction,
        },
      }),
      onError: (error) => {
        toast.error(error.message || "Terjadi kesalahan");
      },
      onFinish: () => {
        // Messages synced via the effect below
      },
    });
  }, [model, temperature, systemPrompt, mode, prdTask, activeChat?.prdDocument, customPersonaInstruction]);

  const { messages, setMessages, status, sendMessage, stop } =
    useChat({ chat: chatInstance });

  const isLoading = status === "submitted" || status === "streaming";

  // Hydration safety and initial fetch
  useEffect(() => {
    setMounted(true);
    fetch("/api/chats")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load chats");
        return res.json();
      })
      .then((data) => {
        setChats(data);
      })
      .catch((err) => {
        console.error("Gagal memuat riwayat obrolan:", err);
      });
  }, [setChats]);

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

  // Load messages when switching chats or toggling mode
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
  }, [activeChatId, mode]);

  // Update browser tab title based on active chat (like Gemini)
  useEffect(() => {
    if (activeChat && activeChat.title && activeChat.title !== "Obrolan Baru") {
      document.title = `${activeChat.title} - Nexus AI`;
    } else {
      document.title = "Nexus AI: Vibe Coder's PRD Factory";
    }
  }, [activeChat?.title]);

  useEffect(() => {
    if (activeChat && (activeChat.title === "Obrolan Baru" || activeChat.title === "Menganalisis...") && messages.length > 0) {
      const firstUserMessage = messages.find((m) => m.role === "user");
      
      if (firstUserMessage) {
        const updateTitle = useChatStore.getState().updateChatTitle;
        const msgText = (firstUserMessage as any).content || (firstUserMessage.parts ? getMessageText(firstUserMessage.parts) : "");
        const fallbackTitle = msgText.slice(0, 30) + (msgText.length > 30 ? "..." : "");
        
        updateTitle(activeChat.id, fallbackTitle || "Obrolan...");
        
        fetch("/api/title", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: msgText }),
        })
          .then((res) => {
            if (!res.ok) throw new Error("API Gagal");
            return res.json();
          })
          .then((data) => {
            if (data.title && data.title !== "Obrolan Baru" && data.title !== "Tanpa Judul") {
              updateTitle(activeChat.id, data.title);
            }
          })
          .catch((err) => {
            console.error("Gagal membuat judul AI:", err);
          });
      }
    }
  }, [messages, activeChat]);

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

    if (!navigator.onLine) {
      toast.error("Tidak ada koneksi internet. Silakan periksa jaringan Anda.");
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
  }, [inputValue, activeChatId, createChat, setActiveChat, sendMessage]);

  if (!mounted) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-full overflow-hidden bg-background overscroll-none">
      <AnimatedBackground />
      
      <div className="relative z-10 flex h-full w-full overflow-hidden">
        {/* Permanent Sidebar for Desktop */}
        <Sidebar />

        {/* Desktop Workspace (visible only on desktop) */}
        <DesktopWorkspace
          messages={messages}
          isLoading={isLoading}
          inputValue={inputValue}
          setInputValue={setInputValue}
          handleSubmit={handleSubmit}
          stop={stop}
          handleSuggestion={handleSuggestion}
          onOpenSettings={() => setSettingsOpen(true)}
        />

        {/* Mobile Workspace (visible only on mobile) */}
        <MobileWorkspace
          messages={messages}
          isLoading={isLoading}
          inputValue={inputValue}
          setInputValue={setInputValue}
          handleSubmit={handleSubmit}
          stop={stop}
          handleSuggestion={handleSuggestion}
          onOpenSettings={() => setSettingsOpen(true)}
        />
      </div>

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  );
}
