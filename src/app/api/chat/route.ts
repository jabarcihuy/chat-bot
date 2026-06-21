import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { google } from "@ai-sdk/google";
import { auth } from "@/auth";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rate-limit";

export const maxDuration = 60;

const CHAT_RATE_LIMIT = {
    limit: 20,
    windowMs: 60_000,
};

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
        const session = await auth();
        if (!session?.user?.id) {
            return Response.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const rateLimit = checkRateLimit(
            `chat:${session.user.id}`,
            CHAT_RATE_LIMIT
        );
        if (!rateLimit.allowed) {
            return Response.json(
                {
                    error: "Terlalu banyak permintaan. Silakan coba lagi sebentar.",
                },
                {
                    status: 429,
                    headers: rateLimitHeaders(rateLimit),
                }
            );
        }

        let body;
        try {
            body = await req.json();
        } catch {
            return Response.json(
                { error: "Format request body JSON tidak valid" },
                { status: 400 }
            );
        }
        const { messages, model, temperature, systemPrompt, mode, prdTask, prdDocument, customPersonaInstruction } =
            body;

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
        } else if (mode === "coder") {
            effectiveSystemPrompt = `Anda adalah Principal AI Coding Assistant Senior. Tugas Anda membantu menulis kode pemrograman yang bersih, aman, efisien, dan berkinerja tinggi. Terapkan prinsip SOLID dan clean code.
            
            ATURAN PENTING:
            1. Selalu berikan penjelasan singkat dan fokus langsung pada solusi kode.
            2. Gunakan markdown block code untuk semua cuplikan kode.
            3. Gunakan Bahasa Indonesia yang profesional.`;
        } else if (mode === "debugger") {
            effectiveSystemPrompt = `Anda adalah Lead Debugging Assistant. Tugas Anda menganalisis kesalahan kompilasi, runtime, stack trace, atau perilaku tidak terduga pada kode program.
            
            ATURAN PENTING:
            1. Diagnosis masalah secara mendalam (Root Cause Analysis).
            2. Tunjukkan baris kode yang bermasalah dan berikan perbaikannya secara jelas.
            3. Berikan saran pencegahan agar bug tidak terulang.
            4. Gunakan Bahasa Indonesia yang ramah dan profesional.`;
        } else if (mode === "architect") {
            effectiveSystemPrompt = `Anda adalah Principal Software Systems Architect. Tugas Anda adalah merancang arsitektur sistem perangkat lunak, struktur database, pola modularitas, skalabilitas, dan integrasi pihak ketiga.
            
            ATURAN PENTING:
            1. Fokus pada efisiensi, keandalan, dan skalabilitas.
            2. Gunakan diagram (misalnya ASCII atau penjelasan terstruktur) untuk visualisasi relasi antar-komponen jika diperlukan.
            3. Gunakan Bahasa Indonesia yang profesional.`;
        }

        // Shared custom instructions & document context across all developer modes
        if (mode !== "chat") {
            if (customPersonaInstruction && customPersonaInstruction.trim()) {
                effectiveSystemPrompt += `
                
                PETUNJUK ARSITEKTURAL/KUSTOM PENGGUNA:
                ${customPersonaInstruction}`;
            }

            if (prdDocument && prdDocument.trim()) {
                effectiveSystemPrompt += `
                
                DOKUMEN/KODE DI KANVAS SAAT INI (Konteks Penting):
                AI harus membaca isi kanvas saat ini di bawah untuk memastikan output selaras dengan apa yang sudah tertulis di dokumen utama.
                
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

        const response = result.toUIMessageStreamResponse();
        const headers = rateLimitHeaders(rateLimit);
        for (const [name, value] of Object.entries(headers)) {
            response.headers.set(name, value);
        }

        return response;
    } catch (error: unknown) {
        console.error("LLM Chat API Error:", error);
        return new Response(JSON.stringify({ 
            error: "Terjadi kesalahan saat menghubungi layanan AI. Silakan coba beberapa saat lagi." 
        }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
