"use client";

import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

// Initialize mermaid configurations
mermaid.initialize({
    startOnLoad: false,
    theme: "dark",
    securityLevel: "loose",
    fontFamily: "var(--font-geist-sans), sans-serif",
});

interface MermaidRendererProps {
    code: string;
}

export function MermaidRenderer({ code }: MermaidRendererProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [svg, setSvg] = useState<string>("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        
        const renderDiagram = async () => {
            try {
                setError(null);
                const id = `mermaid-${Math.random().toString(36).substring(2, 9)}`;
                // Render mermaid code to SVG string
                const { svg: renderedSvg } = await mermaid.render(id, code);
                
                if (isMounted) {
                    setSvg(renderedSvg);
                }
            } catch (err: unknown) {
                console.error("Mermaid parsing error:", err);
                if (isMounted) {
                    setError("Gagal merender diagram Mermaid. Periksa kembali sintaksis diagram Anda.");
                }
            }
        };

        renderDiagram();

        return () => {
            isMounted = false;
        };
    }, [code]);

    if (error) {
        return (
            <div className="p-4 my-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-mono">
                <span className="font-bold block mb-1">Error Mermaid:</span>
                {error}
                <pre className="mt-2 text-[10px] opacity-70 overflow-x-auto bg-black/20 p-2.5 rounded-lg">{code}</pre>
            </div>
        );
    }

    if (!svg) {
        return (
            <div className="p-8 my-4 text-center text-xs text-muted-foreground bg-muted/20 border border-border/10 rounded-xl animate-pulse">
                Merender diagram alir...
            </div>
        );
    }

    return (
        <div 
            ref={ref} 
            className="flex justify-center my-4 overflow-x-auto p-5 bg-card/40 border border-border/10 rounded-xl shadow-inner max-w-full"
            dangerouslySetInnerHTML={{ __html: svg }} 
        />
    );
}
