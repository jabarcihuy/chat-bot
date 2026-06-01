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
    model: string;
    temperature: number;
    systemPrompt: string;
}

export type DateGroup = "Hari Ini" | "Kemarin" | "7 Hari Terakhir" | "30 Hari Terakhir" | "Lama";
