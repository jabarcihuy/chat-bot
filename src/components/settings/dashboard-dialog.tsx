"use client";

import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Activity, ShieldCheck, Zap, HardDrive, Cpu, RefreshCw, BarChart3, Database } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface DashboardDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

interface StatsData {
    uptime: number;
    avgLatency: number;
    totalRequests: number;
    totalTokens: number;
    systemStats: {
        cpu: number;
        memory: number;
        totalChats: number;
        totalMessages: number;
    };
}

export function DashboardDialog({ open, onOpenChange }: DashboardDialogProps) {
    const [stats, setStats] = useState<StatsData | null>(null);
    const [loading, setLoading] = useState(false);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/stats");
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (error) {
            console.error("Gagal memuat stats:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            fetchStats();
            const interval = setInterval(fetchStats, 10000); // refresh every 10s
            return () => clearInterval(interval);
        }
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px] glass">
                <DialogHeader className="flex flex-row items-center justify-between border-b border-border/10 pb-4">
                    <div>
                        <DialogTitle className="flex items-center gap-2 text-base font-bold">
                            <Activity className="h-4 w-4 text-primary animate-pulse" />
                            Dashboard Kontrol & Performa
                        </DialogTitle>
                        <DialogDescription className="text-[11px] text-muted-foreground mt-0.5">
                            Status operasional server dan penggunaan kuota token LLM secara real-time
                        </DialogDescription>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={fetchStats}
                        disabled={loading}
                        className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
                    >
                        <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
                    </Button>
                </DialogHeader>

                {stats ? (
                    <div className="space-y-6 mt-4">
                        {/* 2x2 Grid of Metrics */}
                        <div className="grid grid-cols-2 gap-4">
                            <motion.div 
                                className="bg-secondary/15 border border-border/5 rounded-2xl p-4 flex flex-col justify-between h-[100px]"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.05 }}
                            >
                                <div className="flex items-center justify-between text-muted-foreground">
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Uptime Server</span>
                                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                                </div>
                                <div>
                                    <div className="text-xl font-black font-mono tracking-tight text-emerald-400">
                                        {stats.uptime}%
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground mt-1">
                                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                                        <span>Server Aktif & Normal</span>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div 
                                className="bg-secondary/15 border border-border/5 rounded-2xl p-4 flex flex-col justify-between h-[100px]"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <div className="flex items-center justify-between text-muted-foreground">
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Avg Latency</span>
                                    <Zap className="h-4 w-4 text-amber-400 animate-bounce" />
                                </div>
                                <div>
                                    <div className="text-xl font-black font-mono tracking-tight text-amber-400">
                                        {stats.avgLatency} <span className="text-xs font-normal">ms</span>
                                    </div>
                                    <span className="text-[9px] text-muted-foreground block mt-1">
                                        Waktu respons API rata-rata
                                    </span>
                                </div>
                            </motion.div>

                            <motion.div 
                                className="bg-secondary/15 border border-border/5 rounded-2xl p-4 flex flex-col justify-between h-[100px]"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 }}
                            >
                                <div className="flex items-center justify-between text-muted-foreground">
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Total Request</span>
                                    <BarChart3 className="h-4 w-4 text-primary" />
                                </div>
                                <div>
                                    <div className="text-xl font-black font-mono tracking-tight text-primary">
                                        {stats.totalRequests}
                                    </div>
                                    <span className="text-[9px] text-muted-foreground block mt-1">
                                        Jumlah panggilan API tercatat
                                    </span>
                                </div>
                            </motion.div>

                            <motion.div 
                                className="bg-secondary/15 border border-border/5 rounded-2xl p-4 flex flex-col justify-between h-[100px]"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <div className="flex items-center justify-between text-muted-foreground">
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Token LLM</span>
                                    <Database className="h-4 w-4 text-accent" />
                                </div>
                                <div>
                                    <div className="text-xl font-black font-mono tracking-tight text-accent">
                                        {stats.totalTokens.toLocaleString()}
                                    </div>
                                    <span className="text-[9px] text-muted-foreground block mt-1">
                                        Estimasi token LLM terpakai
                                    </span>
                                </div>
                            </motion.div>
                        </div>

                        {/* System Resources (CPU & Memory) */}
                        <div className="space-y-4 bg-muted/20 border border-border/10 rounded-2xl p-4">
                            <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Beban Sumber Daya Sistem</h4>
                            
                            {/* CPU usage */}
                            <div className="space-y-1.5">
                                <div className="flex justify-between text-xs">
                                    <span className="flex items-center gap-1.5 font-medium">
                                        <Cpu className="h-3.5 w-3.5 text-muted-foreground" />
                                        CPU Load
                                    </span>
                                    <span className="font-mono font-bold">{stats.systemStats.cpu}%</span>
                                </div>
                                <div className="w-full bg-secondary/50 h-2 rounded-full overflow-hidden">
                                    <motion.div 
                                        className="bg-primary h-full rounded-full"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${stats.systemStats.cpu}%` }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </div>
                            </div>

                            {/* RAM usage */}
                            <div className="space-y-1.5">
                                <div className="flex justify-between text-xs">
                                    <span className="flex items-center gap-1.5 font-medium">
                                        <HardDrive className="h-3.5 w-3.5 text-muted-foreground" />
                                        Memory (RAM)
                                    </span>
                                    <span className="font-mono font-bold">{stats.systemStats.memory}%</span>
                                </div>
                                <div className="w-full bg-secondary/50 h-2 rounded-full overflow-hidden">
                                    <motion.div 
                                        className="bg-accent h-full rounded-full"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${stats.systemStats.memory}%` }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Database metrics footer */}
                        <div className="flex justify-between border-t border-border/10 pt-4 text-[10px] text-muted-foreground font-medium font-mono">
                            <div>Total Obrolan: <span className="text-foreground font-bold">{stats.systemStats.totalChats}</span></div>
                            <div>Total Pesan: <span className="text-foreground font-bold">{stats.systemStats.totalMessages}</span></div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <RefreshCw className="h-6 w-6 text-primary animate-spin" />
                        <span className="text-xs text-muted-foreground">Mengumpulkan metrik server...</span>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
