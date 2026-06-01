import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { google } from "@ai-sdk/google";

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const { messages, model, temperature, systemPrompt, mode, prdTask } =
            await req.json();

        // Use server-side Google AI API key
        const serverApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!serverApiKey) {
            return new Response(
                JSON.stringify({
                    error: "Kesalahan konfigurasi server: API key Google AI tidak ditemukan. Silakan hubungi administrator."
                }),
                { status: 500, headers: { "Content-Type": "application/json" } }
            );
        }

        const aiModel = google(model || "gemini-3.5-flash");

        let effectiveSystemPrompt = systemPrompt || "Anda adalah asisten yang membantu.";
        
        // Inject Vibe Coder PRD Persona based on TASK
        if (mode === "prd") {
            const taskPrompts: Record<string, string> = {
                structure: `Anda adalah Senior Technical PM. Tugas Anda: Buat STRUKTUR PRD formal dari ide user. 
                           Fokus pada: Proyek, Masalah, dan Persyaratan Fungsional utama.`,
                stories: `Anda adalah Senior Technical PM. Tugas Anda: Buat USER STORIES detail (Sebagai... Saya ingin... Sehingga...). 
                         Jabarkan semua skenario interaksi pengguna.`,
                tech: `Anda adalah Senior Architect. Tugas Anda: Berikan REKOMENDASI TECH STACK dan batasan arsitektur. 
                       Fokus pada: Efisiensi, Scalability, dan modernitas (Vibe Coder friendly).`,
                metrics: `Anda adalah Product Data Scientist. Tugas Anda: Tentukan METRIK SUKSES (KPI) dan antisipasi EDGE CASES. 
                         Berikan detail tentang apa yang bisa gagal dan bagaimana mengukurnya.`,
            };

            const taskName = prdTask || "structure";
            effectiveSystemPrompt = `${taskPrompts[taskName]} 
            Gunakan Bahasa Indonesia yang profesional. Tetap dukung semangat kreatif user yang memberikan ide ringkas/vibey.`;
        }

        // Convert UIMessages to model messages
        const modelMessages = await convertToModelMessages(
            messages as UIMessage[]
        );

        const result = streamText({
            model: aiModel,
            system: effectiveSystemPrompt,
            messages: modelMessages,
            temperature: temperature ?? (mode === "prd" ? 0.3 : 0.7),
            maxTokens: 4096, // Increase token limit to prevent cut-offs
        });

        return result.toUIMessageStreamResponse();
    } catch (error: unknown) {
        const message =
            error instanceof Error ? error.message : "Terjadi kesalahan yang tidak terduga";
        return new Response(JSON.stringify({ error: message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
