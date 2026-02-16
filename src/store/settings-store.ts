import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_SYSTEM_PROMPT, DEFAULT_TEMPERATURE } from "@/lib/constants";

interface SettingsState {
    apiKey: string;
    provider: "openai" | "google" | "groq" | "vercel";
    model: string;
    temperature: number;
    systemPrompt: string;

    setApiKey: (key: string) => void;
    setProvider: (provider: "openai" | "google" | "groq" | "vercel") => void;
    setModel: (model: string) => void;
    setTemperature: (temp: number) => void;
    setSystemPrompt: (prompt: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            apiKey: "",
            provider: "openai",
            model: "gpt-4o-mini",
            temperature: DEFAULT_TEMPERATURE,
            systemPrompt: DEFAULT_SYSTEM_PROMPT,

            setApiKey: (apiKey) => set({ apiKey }),
            setProvider: (provider) =>
                set({
                    provider,
                    model:
                        provider === "openai"
                            ? "gpt-4o-mini"
                            : provider === "google"
                                ? "gemini-2.0-flash"
                                : provider === "vercel"
                                    ? "openai/gpt-4o-mini"
                                    : "llama-3.3-70b-versatile",
                }),
            setModel: (model) => set({ model }),
            setTemperature: (temperature) => set({ temperature }),
            setSystemPrompt: (systemPrompt) => set({ systemPrompt }),
        }),
        {
            name: "nexus-settings",
        }
    )
);
