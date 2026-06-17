import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { auth } from "@/auth";
import { checkRateLimit, rateLimitHeaders } from "@/lib/rate-limit";

const TITLE_RATE_LIMIT = {
    limit: 30,
    windowMs: 60_000,
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
            `title:${session.user.id}`,
            TITLE_RATE_LIMIT
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
        const { prompt } = body;
        
        const serverApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!serverApiKey) {
            return Response.json(
                { title: "Tanpa Judul" },
                { headers: rateLimitHeaders(rateLimit) }
            );
        }

        const { text } = await generateText({
            model: google("gemini-1.5-flash"),
            system: "Buat 1 judul sangat singkat (maksimal 3-4 kata) dalam bahasa Indonesia untuk instruksi atau pesan berikut. Jangan gunakan tanda kutip atau titik. Judul harus merepresentasikan inti pesan.",
            prompt,
        });

        return Response.json(
            { title: text.trim().replace(/["']/g, '') },
            { headers: rateLimitHeaders(rateLimit) }
        );
    } catch (error) {
        console.error("Title generation error:", error);
        return Response.json({ title: "Obrolan Baru" });
    }
}
