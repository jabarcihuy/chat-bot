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
        setModel,
        setTemperature,
        setSystemPrompt,
    } = useSettingsStore();

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] glass">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <SlidersHorizontal className="h-4 w-4" />
                        Settings
                    </DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="general" className="mt-2">
                    <TabsList className="grid w-full grid-cols-2 bg-secondary/50">
                        <TabsTrigger value="general" className="text-xs gap-1.5">
                            <Sun className="h-3.5 w-3.5" />
                            General
                        </TabsTrigger>
                        <TabsTrigger value="advanced" className="text-xs gap-1.5">
                            <Cpu className="h-3.5 w-3.5" />
                            Advanced
                        </TabsTrigger>
                    </TabsList>

                    {/* General Tab */}
                    <TabsContent value="general" className="space-y-5 mt-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label className="text-sm font-medium">Dark Mode</Label>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Toggle between light and dark theme
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
                            <Label className="text-sm font-medium">AI Model</Label>
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
                                Powered by Groq - Ultra-fast AI inference
                            </p>
                        </div>
                    </TabsContent>

                    {/* Advanced Tab */}
                    <TabsContent value="advanced" className="space-y-5 mt-4">
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-medium">Temperature</Label>
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
                                <span>Precise</span>
                                <span>Balanced</span>
                                <span>Creative</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-medium">System Prompt</Label>
                            <Textarea
                                value={systemPrompt}
                                onChange={(e) => setSystemPrompt(e.target.value)}
                                placeholder="You are a helpful assistant..."
                                rows={4}
                                className="bg-secondary/30 text-xs resize-none"
                            />
                            <p className="text-[11px] text-muted-foreground">
                                Custom instructions that define how the AI should behave.
                            </p>
                        </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
