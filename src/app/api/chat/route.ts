import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createGroq } from "@ai-sdk/groq";
import { createGateway } from "@ai-sdk/gateway";

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const { messages, apiKey, provider, model, temperature, systemPrompt } =
            await req.json();

        if (!apiKey) {
            return new Response(
                JSON.stringify({ error: "API key is required. Please add one in Settings." }),
                { status: 401, headers: { "Content-Type": "application/json" } }
            );
        }

        let aiModel;

        if (provider === "google") {
            const google = createGoogleGenerativeAI({ apiKey });
            aiModel = google(model || "gemini-2.0-flash");
        } else if (provider === "groq") {
            const groq = createGroq({ apiKey });
            aiModel = groq(model || "llama-3.3-70b-versatile");
        } else if (provider === "vercel") {
            const gateway = createGateway({ apiKey });
            aiModel = gateway(model || "openai/gpt-4o-mini");
        } else {
            const openai = createOpenAI({ apiKey });
            aiModel = openai(model || "gpt-4o-mini");
        }

        // Convert UIMessages to model messages
        const modelMessages = await convertToModelMessages(
            messages as UIMessage[]
        );

        const result = streamText({
            model: aiModel,
            system: systemPrompt || "You are a helpful assistant.",
            messages: modelMessages,
            temperature: temperature ?? 0.7,
        });

        return result.toUIMessageStreamResponse();
    } catch (error: unknown) {
        const message =
            error instanceof Error ? error.message : "An unexpected error occurred";
        return new Response(JSON.stringify({ error: message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
