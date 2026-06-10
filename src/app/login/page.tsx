"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { AnimatedBackground } from "@/components/layout/animated-bg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Github, KeyRound, ArrowRight, Mail, Lock, User, Loader2 } from "lucide-react";
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
      router.push("/");
      router.refresh();
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

        <div className="grid grid-cols-1 gap-3">
          <Button 
            variant="outline" 
            onClick={() => signIn("github", { redirectTo: "/" })}
            className="h-11 rounded-xl bg-background/50 border-border/50 text-xs font-medium gap-2"
          >
            <Github className="w-4 h-4" />
            Lanjutkan dengan GitHub
          </Button>
        </div>
      </div>
    </div>
  );
}
