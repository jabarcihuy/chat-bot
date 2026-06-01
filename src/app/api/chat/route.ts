import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { google } from "@ai-sdk/google";

export const maxDuration = 60;

export async function POST(req: Request) {
    try {
        const { messages, model, temperature, systemPrompt, mode } =
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
        
        // Inject Vibe Coder PRD Persona
        if (mode === "prd") {
            effectiveSystemPrompt = `Anda adalah Manajer Produk Teknis Senior (Senior Technical Product Manager) yang berspesialisasi dalam membantu "vibe coder".
            Tugas Anda adalah mengambil ide-ide tingkat tinggi yang masih kasar dan mengubahnya menjadi Dokumen Persyaratan Produk (PRD) yang profesional dan terstruktur.
            
            Selalu susun output Anda dengan bagian berikut:
            - **Judul Proyek & Konteks**
            - **Pernyataan Masalah**
            - **User Stories (Sebagai... Saya ingin... Sehingga...)**
            - **Persyaratan Fungsional (Detail)**
            - **Batasan Teknis (Arsitektur, Teknologi, UI/UX)**
            - **Metrik Keberhasilan & Cakupan Masa Depan**
            
            Berikan detail teknis yang presisi namun tetap jaga semangat kreatif user. Jika user memberikan ide yang samar, gunakan keahlian Anda untuk mengisi celah teknis sambil memberikan pertanyaan klarifikasi jika diperlukan.`;
        }

        // Convert UIMessages to model messages
        const modelMessages = await convertToModelMessages(
            messages as UIMessage[]
        );

        const result = streamText({
            model: aiModel,
            system: effectiveSystemPrompt,
            messages: modelMessages,
            temperature: temperature ?? (mode === "prd" ? 0.3 : 0.7), // Lower temp for PRDs for consistency
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
