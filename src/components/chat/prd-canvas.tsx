"use client";

import { useState, useEffect } from "react";
import { useChatStore } from "@/store/chat-store";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    Edit3, 
    Eye, 
    FileText, 
    Download, 
    Copy, 
    Check, 
    Sparkles, 
    Printer,
    FileCode,
    RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { MarkdownRenderer } from "./markdown-renderer";
import { motion } from "framer-motion";

export function PrdCanvas() {
    const { activeChatId, chats, updateChatPrdDocument } = useChatStore();
    const activeChat = chats.find((c) => c.id === activeChatId);
    
    const [docContent, setDocContent] = useState("");
    const [activeTab, setActiveTab] = useState("edit");
    const [copied, setCopied] = useState(false);

    // Sync state with active chat
    useEffect(() => {
        if (activeChat) {
            setDocContent(activeChat.prdDocument || "");
        } else {
            setDocContent("");
        }
    }, [activeChatId, activeChat]);

    if (!activeChat) {
        return (
            <div className="flex flex-col items-center justify-center w-full h-full bg-card/30 md:border-l border-border/10 p-6 text-center">
                <FileText className="h-12 w-12 text-muted-foreground/30 mb-3 animate-pulse" />
                <p className="text-xs text-muted-foreground font-medium">Pilih obrolan untuk membuka Kanvas PRD</p>
            </div>
        );
    }

    const handleContentChange = (val: string) => {
        setDocContent(val);
        updateChatPrdDocument(activeChat.id, val);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(docContent);
        setCopied(true);
        toast.success("Dokumen PRD berhasil disalin ke clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleDownload = () => {
        if (!docContent.trim()) {
            toast.error("Dokumen masih kosong!");
            return;
        }

        const fileName = `PRD-${activeChat.title.replace(/\s+/g, "-") || "Dokumen"}`;
        const blob = new Blob([docContent], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${fileName}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("Dokumen PRD berhasil diunduh sebagai .md!");
    };

    const handlePrint = () => {
        const printWindow = window.open("", "_blank");
        if (!printWindow) {
            toast.error("Gagal membuka jendela cetak.");
            return;
        }

        // Generate a clean HTML page for PDF printing
        printWindow.document.write(`
            <html>
                <head>
                    <title>PRD - ${activeChat.title}</title>
                    <style>
                        body {
                            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            max-width: 800px;
                            margin: 40px auto;
                            padding: 0 20px;
                        }
                        h1, h2, h3, h4, h5, h6 {
                            color: #111;
                            margin-top: 24px;
                            margin-bottom: 16px;
                            font-weight: 600;
                            line-height: 1.25;
                        }
                        h1 { font-size: 2em; border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }
                        h2 { font-size: 1.5em; border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }
                        h3 { font-size: 1.25em; }
                        p, ul, ol { margin-top: 0; margin-bottom: 16px; }
                        code {
                            font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
                            background-color: rgba(27, 31, 35, 0.05);
                            padding: 0.2em 0.4em;
                            border-radius: 3px;
                            font-size: 85%;
                        }
                        pre {
                            background-color: #f6f8fa;
                            padding: 16px;
                            border-radius: 6px;
                            overflow: auto;
                            font-size: 85%;
                            line-height: 1.45;
                        }
                        pre code {
                            background-color: transparent;
                            padding: 0;
                        }
                        blockquote {
                            border-left: 4px solid #dfe2e5;
                            color: #6a737d;
                            padding: 0 1em;
                            margin: 0 0 16px 0;
                        }
                        table {
                            border-collapse: collapse;
                            width: 100%;
                            margin-bottom: 16px;
                        }
                        table th, table td {
                            border: 1px solid #dfe2e5;
                            padding: 6px 13px;
                        }
                        table tr:nth-child(even) {
                            background-color: #f6f8fa;
                        }
                        @media print {
                            body { margin: 20px; }
                            button { display: none; }
                        }
                    </style>
                </head>
                <body>
                    <div id="content"></div>
                </body>
            </html>
        `);

        // We can render the document simple parsing or just inject raw markdown with simple replacement
        // For accurate printing, it's easiest to write a quick parser or use marked if available,
        // otherwise we can just use the HTML preview we already have.
        // Let's write the markdown rendering to it.
        const contentDiv = printWindow.document.getElementById("content");
        if (contentDiv) {
            // Simple markdown parser for printing
            let html = docContent
                .replace(/^# (.*$)/gim, '<h1>$1</h1>')
                .replace(/^## (.*$)/gim, '<h2>$1</h2>')
                .replace(/^### (.*$)/gim, '<h3>$1</h3>')
                .replace(/^\* (.*$)/gim, '<ul><li>$1</li></ul>')
                .replace(/^\- (.*$)/gim, '<ul><li>$1</li></ul>')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/`(.*?)`/g, '<code>$1</code>')
                .replace(/\n/g, '<br/>');
            
            // Clean up list rendering tags
            html = html.replace(/<\/ul>\s*<ul>/g, "");
            contentDiv.innerHTML = html;
        }

        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 250);
        toast.success("Menyiapkan dokumen untuk dicetak/simpan ke PDF!");
    };

    const handleAutoGenerateTemplate = () => {
        const template = `# PRD: ${activeChat.title}

## 1. Pendahuluan & Ringkasan Proyek
*Tulis ringkasan singkat dari proyek/ide Anda di sini.*

- **Pernyataan Masalah:** apa masalah yang ingin diselesaikan?
- **Tujuan Proyek:** apa gol utama dari pembuatan software ini?
- **Target Pengguna:** siapa saja pengguna aplikasi ini?

## 2. Persyaratan Fungsional (User Stories)
*Gunakan format standard: Sebagai [Siapa], Saya ingin [Apa], Sehingga [Mengapa].*

1. **Autentikasi:** Sebagai pengguna biasa, saya ingin bisa mendaftar akun agar data saya aman.
2. **Dashboard:** Sebagai pengguna terdaftar, saya ingin melihat ringkasan data saya.

## 3. Spesifikasi Arsitektur & Teknologi (Tech Stack)
*Rekomendasi arsitektur.*

- **Frontend:** Next.js (App Router), Tailwind CSS
- **Backend/Database:** Prisma ORM, PostgreSQL
- **Penyimpanan Berkas:** Supabase Storage
- **Deployment:** Vercel

## 4. Metrik Sukses & Kasus Batas (Edge Cases)
- **KPI:** Load time halaman < 1.5 detik.
- **Edge Cases:** Penanganan saat pengguna mengunggah berkas > 5MB.
`;
        handleContentChange(template);
        toast.success("Template PRD berhasil dimuat!");
    };

    return (
        <motion.div 
            className="flex flex-col w-full h-full bg-card/20 overflow-hidden relative"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
        >
            {/* Canvas Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/10 bg-muted/30">
                <div className="flex items-center gap-2">
                    <FileCode className="h-4 w-4 text-accent" />
                    <span className="text-xs font-bold uppercase tracking-wider text-card-foreground">Kanvas PRD</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/20 font-mono">
                        {docContent.split(/\s+/).filter(Boolean).length} kata
                    </span>
                </div>

                <div className="flex items-center gap-1.5">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleCopy}
                        className="h-8 w-8 rounded-lg"
                        title="Salin Dokumen"
                    >
                        {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handlePrint}
                        className="h-8 w-8 rounded-lg"
                        title="Cetak / PDF"
                    >
                        <Printer className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        variant="default"
                        size="sm"
                        onClick={handleDownload}
                        className="h-8 gap-1.5 text-xs rounded-lg font-bold shadow-md shadow-primary/10"
                    >
                        <Download className="h-3.5 w-3.5" />
                        Ekspor .md
                    </Button>
                </div>
            </div>

            {/* Editor & Preview Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between px-5 py-2 border-b border-border/10 bg-background/50">
                    <TabsList className="bg-muted/50 p-0.5 h-8">
                        <TabsTrigger value="edit" className="h-7 text-xs gap-1.5 px-3">
                            <Edit3 className="h-3 w-3" />
                            Edit
                        </TabsTrigger>
                        <TabsTrigger value="preview" className="h-7 text-xs gap-1.5 px-3">
                            <Eye className="h-3 w-3" />
                            Pratinjau
                        </TabsTrigger>
                    </TabsList>

                    {docContent.length === 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-[10px] gap-1.5 hover:bg-accent/10 hover:text-accent font-bold"
                            onClick={handleAutoGenerateTemplate}
                        >
                            <Sparkles className="h-3 w-3" />
                            Gunakan Template
                        </Button>
                    )}
                </div>

                {/* Edit tab pane */}
                <TabsContent value="edit" className="flex flex-col flex-1 m-0 p-0 overflow-hidden relative">
                    <textarea
                        value={docContent}
                        onChange={(e) => handleContentChange(e.target.value)}
                        placeholder="Mulai ketik Dokumen PRD Anda di sini dalam format Markdown... atau klik tombol 'Masukkan ke Kanvas' pada obrolan untuk menambahkan konten secara otomatis."
                        className="w-full h-full p-6 bg-transparent text-sm resize-none focus:outline-none font-mono leading-relaxed border-0 focus:ring-0 selection:bg-primary/20 placeholder:text-muted-foreground/40 overflow-y-auto"
                    />
                </TabsContent>

                {/* Preview tab pane */}
                <TabsContent value="preview" className="flex flex-col flex-1 m-0 p-0 overflow-hidden">
                    <ScrollArea className="h-full">
                        <div className="p-8 prose prose-sm dark:prose-invert max-w-none">
                            {docContent.trim() ? (
                                <MarkdownRenderer content={docContent} />
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground/40">
                                    <Eye className="h-10 w-10 mb-3" />
                                    <p className="text-xs">Belum ada konten untuk dipratinjau</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </TabsContent>
            </Tabs>

            {/* Bottom Status bar */}
            <div className="flex items-center justify-between px-5 py-2.5 border-t border-border/10 bg-muted/20 text-[10px] text-muted-foreground font-medium font-mono shrink-0">
                <div>
                    Format: <span className="font-bold text-accent">Markdown (.md)</span>
                </div>
                <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    Tersimpan Otomatis ke Database
                </div>
            </div>
        </motion.div>
    );
}
