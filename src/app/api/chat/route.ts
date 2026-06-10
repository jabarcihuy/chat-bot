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
        const { messages, model, temperature, systemPrompt, mode, prdTask, prdDocument, customPersonaInstruction } =
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
                structure: `Anda adalah Principal Product Manager. Tugas Anda membedah ide mentah menjadi Struktur PRD yang strategis. 
                           Gunakan kerangka: 1. Executive Summary, 2. Problem Statement (Siapa yang menderita & Mengapa), 
                           3. Goals vs Non-Goals (Batasan MVP), dan 4. Core Features. Pastikan setiap poin memiliki nilai bisnis yang jelas.`,
                stories: `Anda adalah Lead Business Analyst. Buat User Stories yang presisi (Sebagai... Saya ingin... Sehingga...). 
                         UNTUK SETIAP Story, Anda WAJIB menyertakan 'Acceptance Criteria' (AC) dalam bentuk poin-poin teknis. 
                         Sertakan skenario 'Happy Path' dan 'Edge Case' agar developer tidak bingung.`,
                tech: `Anda adalah Chief Technology Officer (CTO). Rekomendasikan Tech Stack yang efisien namun scalable. 
                       Berikan alasan teknis (Reasoning) mengapa stack ini dipilih. Sertakan rekomendasi Database Schema singkat 
                       dan integrasi pihak ketiga yang krusial (Vibe Coder friendly).`,
                metrics: `Anda adalah Head of Data Strategy. Tentukan metrik menggunakan framework AARRR atau HEART. 
                         Identifikasi satu 'North Star Metric'. Berikan analisis risiko yang brutal: di mana sistem kemungkinan besar 
                         akan gagal dan bagaimana cara memitigasinya secara teknis.`,
            };

            const taskName = prdTask || "structure";
            effectiveSystemPrompt = `${taskPrompts[taskName]} 
            
            ATURAN PENTING:
            1. DILARANG memberikan kata pengantar atau penutup (seperti "Tentu", "Ini hasil PRD-nya", dll).
            2. Output HARUS berupa Markdown murni.
            3. Langsung mulai dengan Heading (misal: # Judul Proyek).
            4. Gunakan Bahasa Indonesia yang profesional.`;

            if (customPersonaInstruction && customPersonaInstruction.trim()) {
                effectiveSystemPrompt += `
                
                PETUNJUK ARSITEKTURAL/KUSTOM PENGGUNA:
                ${customPersonaInstruction}`;
            }

            if (prdDocument && prdDocument.trim()) {
                effectiveSystemPrompt += `
                
                DOKUMEN PRD SAAT INI (Konteks Penting):
                AI harus membaca dokumen PRD saat ini di bawah untuk memastikan output tugas baru ("${taskName}") selaras dengan apa yang sudah tertulis di dokumen utama.
                
                \`\`\`markdown
                ${prdDocument}
                \`\`\``;
            }
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
            maxOutputTokens: 8192, // Verified working property name
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
