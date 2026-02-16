export interface Message {
    id: string;
    role: "user" | "assistant" | "system";
    content: string;
    createdAt: Date;
}

export interface Chat {
    id: string;
    title: string;
    messages: Message[];
    createdAt: Date;
    updatedAt: Date;
}

export interface Settings {
    apiKey: string;
    provider: "openai" | "google";
    model: string;
    temperature: number;
    systemPrompt: string;
}

export type DateGroup = "Today" | "Yesterday" | "Last 7 Days" | "Last 30 Days" | "Older";
