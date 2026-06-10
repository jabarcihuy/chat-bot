"use client";

import { useTheme } from "next-themes";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useSettingsStore } from "@/store/settings-store";
import { MODELS } from "@/lib/constants";
import { Sun, Moon, Cpu, SlidersHorizontal } from "lucide-react";

interface SettingsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
    const { theme, setTheme } = useTheme();
    const {
        model,
        temperature,
        systemPrompt,
        customPersonaInstruction,
        setModel,
        setTemperature,
        setSystemPrompt,
        setCustomPersonaInstruction,
    } = useSettingsStore();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] glass">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <SlidersHorizontal className="h-4 w-4" />
                        Pengaturan
                    </DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="general" className="mt-2">
                    <TabsList className="grid w-full grid-cols-2 bg-secondary/50">
                        <TabsTrigger value="general" className="text-xs gap-1.5">
                            <Sun className="h-3.5 w-3.5" />
                            Umum
                        </TabsTrigger>
                        <TabsTrigger value="advanced" className="text-xs gap-1.5">
                            <Cpu className="h-3.5 w-3.5" />
                            Lanjutan
                        </TabsTrigger>
                    </TabsList>

                    {/* General Tab */}
                    <TabsContent value="general" className="space-y-5 mt-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label className="text-sm font-medium">Mode Gelap</Label>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Pilih antara tema terang dan gelap
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Sun className="h-3.5 w-3.5 text-muted-foreground" />
                                <Switch
                                    checked={theme === "dark"}
                                    onCheckedChange={(c) => setTheme(c ? "dark" : "light")}
                                />
                                <Moon className="h-3.5 w-3.5 text-muted-foreground" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Model AI</Label>
                            <Select value={model} onValueChange={setModel}>
                                <SelectTrigger className="bg-secondary/30">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {MODELS.map((m) => (
                                        <SelectItem key={m.id} value={m.id}>
                                            {m.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-[11px] text-muted-foreground">
                                Ditenagai oleh Google Gemini - Model AI performa tinggi
                            </p>
                        </div>
                    </TabsContent>

                    {/* Advanced Tab */}
                    <TabsContent value="advanced" className="space-y-5 mt-4">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">Temperatur</Label>
                                <span className="text-xs text-muted-foreground font-mono bg-secondary/50 px-2 py-0.5 rounded">
                                    {temperature.toFixed(1)}
                                </span>
                            </div>
                            <Slider
                                value={[temperature]}
                                onValueChange={([v]) => setTemperature(v)}
                                min={0}
                                max={2}
                                step={0.1}
                                className="w-full"
                            />
                            <div className="flex justify-between text-[10px] text-muted-foreground">
                                <span>Presisi</span>
                                <span>Seimbang</span>
                                <span>Kreatif</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Instruksi Sistem (System Prompt)</Label>
                            <Textarea
                                value={systemPrompt}
                                onChange={(e) => setSystemPrompt(e.target.value)}
                                placeholder="Anda adalah asisten yang membantu..."
                                rows={3}
                                className="bg-secondary/30 text-xs resize-none"
                            />
                            <p className="text-[11px] text-muted-foreground">
                                Instruksi khusus yang mendefinisikan cara AI berperilaku.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Instruksi Tambahan Persona (Mode PRD)</Label>
                            <Textarea
                                value={customPersonaInstruction}
                                onChange={(e) => setCustomPersonaInstruction(e.target.value)}
                                placeholder="Misal: Saya ingin Tech Architect lebih condong menyarankan Node.js..."
                                rows={3}
                                className="bg-secondary/30 text-xs resize-none"
                            />
                            <p className="text-[11px] text-muted-foreground">
                                Modifikasi khusus bagaimana AI bertindak pada target Mode PRD (Tech Stack, User Stories, dll).
                            </p>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
