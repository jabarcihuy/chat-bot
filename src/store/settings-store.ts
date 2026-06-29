import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_SYSTEM_PROMPT, DEFAULT_TEMPERATURE } from "@/lib/constants";

export type PRDTask = "structure" | "stories" | "tech" | "metrics";

interface SettingsState {
    model: string;
    temperature: number;
    systemPrompt: string;
    mode: "chat" | "prd" | "coder" | "debugger" | "architect";
    prdTask: PRDTask;
    customPersonaInstruction: string;
    openaiApiKey: string;
    deepseekApiKey: string;
    googleApiKey: string;

    setModel: (model: string) => void;
    setTemperature: (temp: number) => void;
    setSystemPrompt: (prompt: string) => void;
    setMode: (mode: "chat" | "prd" | "coder" | "debugger" | "architect") => void;
    setPrdTask: (task: PRDTask) => void;
    setCustomPersonaInstruction: (instruction: string) => void;
    setOpenaiApiKey: (key: string) => void;
    setDeepseekApiKey: (key: string) => void;
    setGoogleApiKey: (key: string) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            model: "gemini-3.5-flash",
            temperature: DEFAULT_TEMPERATURE,
            systemPrompt: DEFAULT_SYSTEM_PROMPT,
            mode: "chat",
            prdTask: "structure",
            customPersonaInstruction: "",
            openaiApiKey: "",
            deepseekApiKey: "",
            googleApiKey: "",

            setModel: (model) => set({ model }),
            setTemperature: (temperature) => set({ temperature }),
            setSystemPrompt: (systemPrompt) => set({ systemPrompt }),
            setMode: (mode) => set({ mode }),
            setPrdTask: (prdTask) => set({ prdTask }),
            setCustomPersonaInstruction: (customPersonaInstruction) => set({ customPersonaInstruction }),
            setOpenaiApiKey: (openaiApiKey) => set({ openaiApiKey }),
            setDeepseekApiKey: (deepseekApiKey) => set({ deepseekApiKey }),
            setGoogleApiKey: (googleApiKey) => set({ googleApiKey }),
        }),
        {
            name: "nexus-settings",
        }
    )
);
