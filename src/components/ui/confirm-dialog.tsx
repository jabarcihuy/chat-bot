"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
    variant?: "default" | "destructive";
}

export function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    onConfirm,
    confirmText = "Konfirmasi",
    cancelText = "Batal",
    variant = "default",
}: ConfirmDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px] bg-card/95 dark:bg-[#12121A]/95 border border-border/40 dark:border-white/5 backdrop-blur-2xl rounded-3xl p-6 shadow-2xl z-[100]">
                <DialogHeader className="space-y-2 text-left">
                    <DialogTitle className="text-base font-bold tracking-tight text-foreground">
                        {title}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
                        {description}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex flex-row items-center justify-end gap-2 mt-5 shrink-0">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onOpenChange(false)}
                        className="h-9 px-4 text-xs font-bold rounded-xl text-muted-foreground hover:bg-secondary/40 shrink-0"
                    >
                        {cancelText}
                    </Button>
                    <Button
                        variant={variant === "destructive" ? "destructive" : "default"}
                        size="sm"
                        onClick={() => {
                            onConfirm();
                            onOpenChange(false);
                        }}
                        className="h-9 px-4 text-xs font-bold rounded-xl shrink-0"
                    >
                        {confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
