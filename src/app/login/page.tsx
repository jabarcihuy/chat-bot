"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { AnimatedBackground } from "@/components/layout/animated-bg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Github, KeyRound, Mail, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) throw new Error("Email atau password salah");

      toast.success("Berhasil masuk!");
      router.push("/chat");
      router.refresh();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Terjadi kesalahan";
      toast.error(message);
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
            Masuk ke pabrik PRD Anda.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
            {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : "Masuk"}
          </Button>
        </form>

        <div className="text-center">
          <Link 
            href="/register"
            className="text-xs font-bold text-primary hover:underline underline-offset-4"
          >
            Belum punya akun? Daftar gratis
          </Link>
        </div>

        <div className="relative flex items-center py-1">
          <div className="flex-grow border-t border-border/50"></div>
          <span className="flex-shrink-0 mx-4 text-[9px] font-bold uppercase tracking-widest text-muted-foreground/40">Atau</span>
          <div className="flex-grow border-t border-border/50"></div>
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          <Button 
            variant="outline" 
            onClick={() => signIn("google", { redirectTo: "/chat" })}
            className="h-11 rounded-xl bg-background/50 border-border/50 text-xs font-medium gap-2 hover:bg-background/80 transition-all duration-200"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            Lanjutkan dengan Google
          </Button>

          <Button 
            variant="outline" 
            onClick={() => signIn("github", { redirectTo: "/chat" })}
            className="h-11 rounded-xl bg-background/50 border-border/50 text-xs font-medium gap-2 hover:bg-background/80 transition-all duration-200"
          >
            <Github className="w-4 h-4" />
            Lanjutkan dengan GitHub
          </Button>
        </div>
      </div>
    </div>
  );
}
