import { generateText } from "ai";
import { google } from "@ai-sdk/google";

export async function POST(req: Request) {
    try {
        const { prompt } = await req.json();
        
        const serverApiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!serverApiKey) {
            return Response.json({ title: "Tanpa Judul" });
        }

        const { text } = await generateText({
            model: google("gemini-1.5-flash"),
            system: "Buat 1 judul sangat singkat (maksimal 3-4 kata) dalam bahasa Indonesia untuk instruksi atau pesan berikut. Jangan gunakan tanda kutip atau titik. Judul harus merepresentasikan inti pesan.",
            prompt,
        });

        return Response.json({ title: text.trim().replace(/["']/g, '') });
    } catch (error) {
        console.error("Title generation error:", error);
        return Response.json({ title: "Obrolan Baru" });
    }
}
