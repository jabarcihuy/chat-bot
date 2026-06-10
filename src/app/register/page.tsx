"use client";

import { useState } from "react";
import { AnimatedBackground } from "@/components/layout/animated-bg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KeyRound, Mail, Lock, User, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mendaftar");

      toast.success("Akun berhasil dibuat! Silakan masuk.");
      router.push("/login");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 w-full overflow-hidden bg-background flex items-center justify-center p-4">
      <AnimatedBackground />
      <div className="relative z-10 glass-strong w-full max-w-md p-8 md:p-10 rounded-[2rem] flex flex-col gap-6 shadow-2xl">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary/10 mb-2">
            <KeyRound className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Nexus AI</h1>
          <p className="text-muted-foreground text-xs font-medium">
            Buat akun baru untuk memulai petualangan PRD Anda.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="space-y-1">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
              <Input name="name" placeholder="Nama Lengkap" required className="pl-10 h-11 rounded-xl" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
              <Input name="email" type="email" placeholder="Email" required className="pl-10 h-11 rounded-xl" />
            </div>
          </div>
          <div className="space-y-1">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
              <Input name="password" type="password" placeholder="Password" required className="pl-10 h-11 rounded-xl" />
            </div>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full h-11 rounded-xl font-bold mt-2">
            {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : "Daftar Sekarang"}
          </Button>
        </form>

        <div className="text-center pt-2">
          <Link 
            href="/login"
            className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-3 h-3" />
            Kembali ke Login
          </Link>
        </div>
      </div>
    </div>
  );
}
