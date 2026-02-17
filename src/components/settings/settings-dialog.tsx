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
import { Input } from "@/components/ui/input";
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
import {
    OPENAI_MODELS,
    GOOGLE_MODELS,
    GROQ_MODELS,
    VERCEL_MODELS,
    PROVIDER_OPTIONS,
} from "@/lib/constants";
import { Sun, Moon, Key, Cpu, SlidersHorizontal } from "lucide-react";

interface SettingsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
    const { theme, setTheme } = useTheme();
    const {
        apiKey,
        provider,
        model,
        temperature,
        systemPrompt,
        setApiKey,
        setProvider,
        setModel,
        setTemperature,
        setSystemPrompt,
    } = useSettingsStore();

    const models =
        provider === "openai"
            ? OPENAI_MODELS
            : provider === "google"
                ? GOOGLE_MODELS
                : provider === "vercel"
                    ? VERCEL_MODELS
                    : GROQ_MODELS;

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
                    <TabsList className="grid w-full grid-cols-3 bg-secondary/50">
                        <TabsTrigger value="general" className="text-xs gap-1.5">
                            <Sun className="h-3.5 w-3.5" />
                            General
                        </TabsTrigger>
                        <TabsTrigger value="api" className="text-xs gap-1.5">
                            <Key className="h-3.5 w-3.5" />
                            API
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
                    </TabsContent>

                    {/* API Tab */}
                    <TabsContent value="api" className="space-y-5 mt-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Provider</Label>
                            <Select
                                value={provider}
                                onValueChange={(v) => setProvider(v as "openai" | "google" | "groq" | "vercel")}
                            >
                                <SelectTrigger className="bg-secondary/30">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {PROVIDER_OPTIONS.map((p) => (
                                        <SelectItem key={p.id} value={p.id}>
                                            {p.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {provider === "groq" ? (
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">API Key</Label>
                                <div className="bg-primary/10 border border-primary/20 rounded-md p-3">
                                    <p className="text-xs text-muted-foreground flex items-center gap-2">
                                        <Key className="h-3.5 w-3.5" />
                                        Groq is pre-configured. No API key needed!
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">API Key</Label>
                                <Input
                                    type="password"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    placeholder={
                                        provider === "openai"
                                            ? "sk-..."
                                            : provider === "google"
                                                ? "AIza..."
                                                : "vck_..."
                                    }
                                    className="bg-secondary/30 font-mono text-xs"
                                />
                                <p className="text-[11px] text-muted-foreground">
                                    Your key is stored locally in your browser and never sent to our servers.
                                </p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Model</Label>
                            <Select value={model} onValueChange={setModel}>
                                <SelectTrigger className="bg-secondary/30">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {models.map((m) => (
                                        <SelectItem key={m.id} value={m.id}>
                                            {m.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
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
