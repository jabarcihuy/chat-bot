"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useChat, Chat, type UIMessage } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { toast } from "sonner";
import { AnimatedBackground } from "@/components/layout/animated-bg";
import { Sidebar } from "@/components/sidebar/sidebar";
import { DesktopWorkspace } from "@/components/layout/desktop-workspace";
import { MobileWorkspace } from "@/components/layout/mobile-workspace";
import { SettingsDialog } from "@/components/settings/settings-dialog";
import { DashboardDialog } from "@/components/settings/dashboard-dialog";
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

function toUIMessages(
  messages: Array<{
    id: string;
    role: "user" | "assistant" | "system";
    content: string;
  }>
): UIMessage[] {
  return messages.map((message) => ({
    id: message.id,
    role: message.role,
    parts: [{ type: "text" as const, text: message.content }],
  }));
}

function toStoredMessages(messages: UIMessage[]) {
  return messages.map((message) => ({
    id: message.id,
    role: message.role as "user" | "assistant" | "system",
    content: getMessageText(message.parts),
    createdAt: new Date(),
  }));
}

export default function ChatPage() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const pendingMessageRef = useRef<{
    chatId: string;
    text: string;
  } | null>(null);

  const {
    chats,
    activeChatId,
    createChat,
    updateChatMessages,
    setActiveChat,
    setChats,
  } = useChatStore();
  const { 
    model, 
    temperature, 
    systemPrompt, 
    mode, 
    prdTask, 
    customPersonaInstruction, 
    openaiApiKey, 
    deepseekApiKey,
    googleApiKey
  } = useSettingsStore();

  const activeChat = chats.find((c) => c.id === activeChatId);
  const activePrdDocument = activeChat?.prdDocument || "";
  const activeChatTitle = activeChat?.title;

  // Create a memoized Chat instance using the new v6 API
  const chatInstance = useMemo(() => {
    const chatId = activeChatId ?? "empty-chat";
    const currentChat = activeChatId
      ? useChatStore.getState().chats.find((chat) => chat.id === activeChatId)
      : undefined;

    return new Chat({
      id: chatId,
      messages: currentChat ? toUIMessages(currentChat.messages) : [],
      transport: new DefaultChatTransport({
        api: "/api/chat",
        body: {
          model,
          temperature,
          systemPrompt,
          mode,
          prdTask,
          prdDocument: activePrdDocument,
          customPersonaInstruction,
          openaiApiKey,
          deepseekApiKey,
          googleApiKey,
        },
      }),
      onError: (error) => {
        toast.error(error.message || "Terjadi kesalahan");
      },
      onFinish: ({ messages: finishedMessages }) => {
        if (chatId !== "empty-chat") {
          updateChatMessages(
            chatId,
            toStoredMessages(finishedMessages)
          );
        }
      },
    });
  }, [
    activeChatId,
    model,
    temperature,
    systemPrompt,
    mode,
    prdTask,
    activePrdDocument,
    customPersonaInstruction,
    updateChatMessages,
  ]);

  const { id: sdkChatId, messages, status, sendMessage, stop } =
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

  // Sync messages to store when they change (only on transition to ready/idle to prevent high-frequency write spams)
  const prevStatusRef = useRef(status);
  useEffect(() => {
    if (prevStatusRef.current !== "ready" && status === "ready") {
      if (sdkChatId !== "empty-chat" && messages.length > 0) {
        updateChatMessages(
          sdkChatId,
          toStoredMessages(messages)
        );
      }
    }
    prevStatusRef.current = status;
  }, [status, messages, sdkChatId, updateChatMessages]);

  // Cancel active streaming when switching chats to prevent zombie streams
  useEffect(() => {
    return () => {
      stop();
    };
  }, [activeChatId, stop]);

  // Submit a first message only after its newly created chat instance is active.
  useEffect(() => {
    const pendingMessage = pendingMessageRef.current;
    if (pendingMessage?.chatId === sdkChatId) {
      pendingMessageRef.current = null;
      sendMessage({ text: pendingMessage.text });
    }
  }, [sdkChatId, sendMessage]);

  // Update browser tab title based on active chat (like Gemini)
  useEffect(() => {
    if (activeChatTitle && activeChatTitle !== "Obrolan Baru") {
      document.title = `${activeChatTitle} - Nexus AI`;
    } else {
      document.title = "Nexus AI: Vibe Coder's PRD Factory";
    }
  }, [activeChatTitle]);

  useEffect(() => {
    if (activeChat && (activeChat.title === "Obrolan Baru" || activeChat.title === "Menganalisis...") && messages.length > 0) {
      const firstUserMessage = messages.find((m) => m.role === "user");
      
      if (firstUserMessage) {
        const updateTitle = useChatStore.getState().updateChatTitle;
        const msgText = getMessageText(firstUserMessage.parts);
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
      pendingMessageRef.current = {
        chatId,
        text: inputValue.trim(),
      };
      setActiveChat(chatId);
      setInputValue("");
      return;
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
        <Sidebar onOpenSettings={() => setSettingsOpen(true)} />

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
          onOpenDashboard={() => setDashboardOpen(true)}
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
          onOpenDashboard={() => setDashboardOpen(true)}
        />
      </div>

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      <DashboardDialog open={dashboardOpen} onOpenChange={setDashboardOpen} />
    </div>
  );
}
