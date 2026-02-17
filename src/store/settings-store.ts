import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_SYSTEM_PROMPT, DEFAULT_TEMPERATURE } from "@/lib/constants";

interface SettingsState {
    model: string;
    temperature: number;
    systemPrompt: string;

    setModel: (model: string) => void;
    setTemperature: (temp: number) => void;
    setSystemPrompt: (prompt: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            model: "llama-3.3-70b-versatile",
            temperature: DEFAULT_TEMPERATURE,
            systemPrompt: DEFAULT_SYSTEM_PROMPT,

            setModel: (model) => set({ model }),
            setTemperature: (temperature) => set({ temperature }),
            setSystemPrompt: (systemPrompt) => set({ systemPrompt }),
        }),
        {
            name: "nexus-settings",
        }
    )
);
