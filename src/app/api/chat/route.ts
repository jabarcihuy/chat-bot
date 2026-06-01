import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { google } from "@ai-sdk/google";

export const maxDuration = 60;

// Map legacy or imprecise model IDs to verified latest IDs from Google API
const MODEL_MAPPING: Record<string, string> = {
    "gemini-1.5-flash": "gemini-flash-latest",
    "gemini-1.5-flash-latest": "gemini-flash-latest",
    "gemini-1.5-pro": "gemini-pro-latest",
    "gemini-1.5-pro-latest": "gemini-pro-latest",
    "gemini-2.0-flash-exp": "gemini-2.0-flash",
    "gemini-3-flash": "gemini-3-flash-preview",
};

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

        // Get the effective model ID based on mapping or fallback
        const modelId = MODEL_MAPPING[model] || model || "gemini-flash-latest";
        const aiModel = google(modelId);

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
            
            ATURAN PENTING:
            1. DILARANG memberikan kata pengantar atau penutup (seperti "Tentu", "Ini hasil PRD-nya", dll).
            2. Output HARUS berupa Markdown murni.
            3. Langsung mulai dengan Heading (misal: # Judul Proyek).
            4. Gunakan Bahasa Indonesia yang profesional.`;
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
            maxTokens: 8192, // Set to maximum supported output limit
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
