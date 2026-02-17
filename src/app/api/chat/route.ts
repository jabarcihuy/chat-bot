import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { createGroq } from "@ai-sdk/groq";

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const { messages, model, temperature, systemPrompt } =
            await req.json();

        // Use server-side Groq API key
        const serverApiKey = process.env.GROQ_API_KEY;
        if (!serverApiKey) {
            return new Response(
                JSON.stringify({
                    error: "Server configuration error: Groq API key not configured. Please contact administrator."
                }),
                { status: 500, headers: { "Content-Type": "application/json" } }
            );
        }

        const groq = createGroq({ apiKey: serverApiKey });
        const aiModel = groq(model || "llama-3.3-70b-versatile");

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
