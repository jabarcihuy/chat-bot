export const OPENAI_MODELS = [
    { id: "gpt-4o", name: "GPT-4o" },
    { id: "gpt-4o-mini", name: "GPT-4o Mini" },
    { id: "gpt-4-turbo", name: "GPT-4 Turbo" },
    { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo" },
];

export const GOOGLE_MODELS = [
    { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash" },
    { id: "gemini-2.0-flash-lite", name: "Gemini 2.0 Flash Lite" },
    { id: "gemini-1.5-pro-latest", name: "Gemini 1.5 Pro" },
    { id: "gemini-pro", name: "Gemini Pro (Stable)" },
];

export const GROQ_MODELS = [
    { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B" },
    { id: "llama-3.1-8b-instant", name: "Llama 3.1 8B Instant" },
    { id: "mixtral-8x7b-32768", name: "Mixtral 8x7B" },
    { id: "gemma2-9b-it", name: "Gemma 2 9B" },
];

export const VERCEL_MODELS = [
    { id: "openai/gpt-4o", name: "GPT-4o" },
    { id: "openai/gpt-4o-mini", name: "GPT-4o Mini" },
    { id: "anthropic/claude-3-5-sonnet", name: "Claude 3.5 Sonnet" },
    { id: "google/gemini-2.0-flash", name: "Gemini 2.0 Flash" },
    { id: "meta/llama-3.3-70b", name: "Llama 3.3 70B" },
    { id: "deepseek/deepseek-chat", name: "DeepSeek Chat" },
    { id: "xai/grok-2", name: "Grok 2" },
];

export const DEFAULT_SYSTEM_PROMPT =
    "You are a helpful, friendly, and knowledgeable AI assistant. Respond clearly and concisely. Use markdown formatting when it helps readability.";

export const DEFAULT_TEMPERATURE = 0.7;

export const PROVIDER_OPTIONS = [
    { id: "openai" as const, name: "OpenAI" },
    { id: "google" as const, name: "Google (Gemini)" },
    { id: "groq" as const, name: "Groq" },
    { id: "vercel" as const, name: "Vercel AI" },
];
