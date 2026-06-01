import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_SYSTEM_PROMPT, DEFAULT_TEMPERATURE } from "@/lib/constants";

interface SettingsState {
    model: string;
    temperature: number;
    systemPrompt: string;
    mode: "chat" | "prd";

    setModel: (model: string) => void;
    setTemperature: (temp: number) => void;
    setSystemPrompt: (prompt: string) => void;
    setMode: (mode: "chat" | "prd") => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            model: "gemini-3.5-flash",
            temperature: DEFAULT_TEMPERATURE,
            systemPrompt: DEFAULT_SYSTEM_PROMPT,
            mode: "chat",

            setModel: (model) => set({ model }),
            setTemperature: (temperature) => set({ temperature }),
            setSystemPrompt: (systemPrompt) => set({ systemPrompt }),
            setMode: (mode) => set({ mode }),
        }),
        {
            name: "nexus-settings",
        }
    )
);
