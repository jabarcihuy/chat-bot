"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AnimatedBackground } from "@/components/layout/animated-bg";
import { cn } from "@/lib/utils";
import { 
  Sparkles, 
  ArrowRight, 
  MessageSquare, 
  FileText, 
  Code, 
  ShieldCheck,
  Zap,
  Terminal,
  Layers,
  Bug,
  ChevronDown,
  CheckCircle,
  HelpCircle,
  Activity,
  Layers2,
  FileCode,
  Globe,
  Settings
} from "lucide-react";

export function LandingContent() {
  const { status } = useSession();
  const [mounted, setMounted] = useState(false);
  const [showcaseTab, setShowcaseTab] = useState<"chat" | "doc" | "code" | "dash">("chat");
  const [faqOpen, setFaqOpen] = useState<Record<number, boolean>>({});

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const getStartedHref = mounted && status === "authenticated" ? "/chat" : "/register";

  const toggleFaq = (index: number) => {
    setFaqOpen((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const showcaseContent = {
    chat: {
      title: "Developer Chat",
      desc: "Collaborate directly with AI in conversational workspace layouts to solve tricky technical challenges.",
      prompt: "Write a high-performance React custom hook for fetching APIs with request caching.",
      aiResponse: "I've designed the useFetch hook. It utilizes an in-memory cache to store key-value query results and uses AbortController to automatically cancel stale or unmounted HTTP requests.",
      fileName: "hooks/useFetch.ts",
      code: `import { useState, useEffect, useRef } from "react";

const cache: Record<string, any> = {};

export function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const cacheKey = useRef(url);

  useEffect(() => {
    const controller = new AbortController();
    if (cache[url]) {
      setData(cache[url]);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(url, { signal: controller.signal })
      .then(res => res.json())
      .then(json => {
        cache[url] = json;
        setData(json);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [url]);

  return { data, loading };
}`
    },
    doc: {
      title: "Documentation Generator",
      desc: "Create PRDs, README files, API specifications, and technical docs with clean markdown exports.",
      prompt: "Generate a standard PRD structure for our user onboarding authentication flow.",
      aiResponse: "Here is the Product Requirements Document (PRD) for User Onboarding Auth. It outlines goals, flows, tech stack, and safety checklists.",
      fileName: "docs/AUTH_PRD.md",
      code: `# Product Requirements Document (PRD)

## 1. Onboarding & Authentication Flow

### Executive Summary
Nexus AI relies on secure, single sign-on (SSO) login options using OAuth 2.0. The goal is to provide friction-free authorization paths while protecting database resources.

### Technical Target
- **Framework**: NextAuth v5 (Auth.js)
- **Database**: Prisma ORM with MariaDB adapter
- **Endpoints**: \`/api/auth/[...nextauth]\`

### User Acceptance Criteria
- [x] Secure email/password validation with bcrypt hashing
- [x] Social logins via Google & GitHub providers
- [x] Redirect authenticated sessions automatically to /chat
- [ ] Implement rate limiting on the registration route`
    },
    code: {
      title: "Code Analysis",
      desc: "Analyze stack traces, refactor loops, detect security flaws, and rewrite code for performance.",
      prompt: "Optimize this sequential Prisma database querying code inside my server route.",
      aiResponse: "Identified database access bottleneck. Replaced sequential await statements with Promise.all to fetch the data concurrently, cutting latency by 50%.",
      fileName: "api/dashboard/route.ts",
      code: `// BEFORE: Sequential Awaits (Slower)
const user = await prisma.user.findUnique({ where: { id } });
const posts = await prisma.post.findMany({ where: { userId } });
const sessions = await prisma.session.findMany({ where: { userId } });

// AFTER: Concurrent Fetching (Fast & Clean)
const [user, posts, sessions] = await Promise.all([
  prisma.user.findUnique({ where: { id } }),
  prisma.post.findMany({ where: { userId } }),
  prisma.session.findMany({ where: { userId } })
]);`
    },
    dash: {
      title: "Workspace Dashboard",
      desc: "Unify your coding tools, workspace sessions, project configurations, and model providers.",
      prompt: "Show platform metrics and active model providers.",
      aiResponse: "Currently monitoring 4 active developer workspace paths. Gemini 1.5 Pro is running as your primary intelligence engine.",
      fileName: "Nexus AI Control Panel",
      code: `+-----------------------------------------+
| NEXUS AI DEVELOPER CORE: ONLINE        |
+-----------------------------------------+
| ACTIVE WORKSPACES : 4                   |
| TOTAL API REQUESTS: 1,420               |
| AVERAGE LATENCY   : 124ms               |
| SYSTEM UPTIME     : 99.98%              |
+-----------------------------------------+
| ENGINE STATUS                           |
| - Gemini 1.5 Pro  : ACTIVE (Low Latency)|
| - DeepSeek-R1     : STANDBY (Reasoning) |
| - GPT-4o          : READY               |
+-----------------------------------------+`
    }
  };

  const faqs = [
    {
      q: "What is Nexus AI?",
      a: "Nexus AI is a developer-focused productivity platform that unifies multiple AI assistants (coding, debugging, architecture, documentation) into a single, seamless workspace to accelerate your software development lifecycle."
    },
    {
      q: "How is Nexus AI different from ChatGPT?",
      a: "Unlike generic chatbots, Nexus AI is built specifically for developers. It features a dual-panel workspace where the AI assistant writes code, generates files, or designs database schemas directly into editable workspace canvases, keeping your project files organized side-by-side with your conversations."
    },
    {
      q: "Who is Nexus AI for?",
      a: "It is built for software engineers, startup founders, indie hackers, product managers, and technology students who want to build software faster without switching between multiple browser tabs and generic tools."
    },
    {
      q: "Can I generate technical documentation?",
      a: "Yes. Nexus AI can generate markdown-formatted PRDs, READMEs, API specifications, and database schema documentation. You can edit them live in the workspace and export them as standard Markdown (.md) files."
    },
    {
      q: "Is my data secure?",
      a: "Absolutely. We secure your session using NextAuth v5. Your chats and documentation are stored in an encrypted database instance, and your code inputs are never used to train public models."
    }
  ];

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-background text-foreground flex flex-col justify-between selection:bg-primary/20 antialiased font-sans">
      <AnimatedBackground />

      {/* Modern SaaS Floating Navbar */}
      <div className="sticky top-0 z-50 w-full px-4 sm:px-6 py-4">
        <header className="max-w-6xl mx-auto rounded-2xl border border-border/10 bg-background/50 backdrop-blur-xl px-6 py-3 flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
          <motion.div 
            className="flex items-center gap-3 cursor-pointer"
            whileHover={{ scale: 1.06, rotate: 1 }}
            whileTap={{ scale: 0.94 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 shadow-[0_0_15px_rgba(var(--primary-rgb),0.05)]">
              <Terminal className="h-4 w-4 text-primary animate-pulse" />
            </div>
            <span className="font-black text-sm tracking-wider uppercase bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent">
              Nexus AI
            </span>
            <span className="text-[8px] font-black tracking-widest px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
              BETA
            </span>
          </motion.div>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-3 text-xs font-semibold text-muted-foreground/80">
            <motion.div 
              whileHover={{ scale: 1.10, y: -2 }} 
              whileTap={{ scale: 0.92 }}
              transition={{ type: "spring", stiffness: 450, damping: 14 }}
            >
              <a href="#tools" className="px-3.5 py-1.5 rounded-full bg-secondary/20 hover:bg-secondary/40 border border-border/5 hover:text-foreground transition-all duration-200">
                Fitur Utama
              </a>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.10, y: -2 }} 
              whileTap={{ scale: 0.92 }}
              transition={{ type: "spring", stiffness: 450, damping: 14 }}
            >
              <a href="#faq" className="px-3.5 py-1.5 rounded-full bg-secondary/20 hover:bg-secondary/40 border border-border/5 hover:text-foreground transition-all duration-200">
                Pertanyaan (FAQ)
              </a>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.10, y: -2 }} 
              whileTap={{ scale: 0.92 }}
              transition={{ type: "spring", stiffness: 450, damping: 14 }}
            >
              <a href="mailto:support@nexusai.dev" className="px-3.5 py-1.5 rounded-full bg-secondary/20 hover:bg-secondary/40 border border-border/5 hover:text-foreground transition-all duration-200">
                Hubungi Kami
              </a>
            </motion.div>
          </nav>

          <div className="flex items-center gap-4">
            {mounted && status === "authenticated" ? (
              <Link href="/chat">
                <Button variant="outline" className="rounded-xl text-xs font-bold gap-2 border-border/20 bg-background/30 hover:bg-secondary/40 hover:text-foreground transition-all duration-300 focus:ring-2 focus:ring-primary/20" aria-label="Go to workspace">
                  Go to Workspace
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground transition-colors" aria-label="Sign in to account">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="rounded-xl text-xs font-bold bg-primary hover:bg-primary/95 text-primary-foreground shadow-md shadow-primary/20 transition-all hover:scale-[1.03] active:scale-[0.98] focus:ring-2 focus:ring-primary/20" aria-label="Start Building">
                    Start Building
                  </Button>
                </Link>
              </>
            )}
          </div>
        </header>
      </div>

      {/* Main Content Area */}
      <main className="relative z-10 w-full flex-1 flex flex-col items-center">
        
        {/* 1. HERO SECTION */}
        <section className="w-full max-w-5xl mx-auto px-6 pt-12 sm:pt-20 pb-8 text-center space-y-6 sm:space-y-8 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-primary/10 rounded-full blur-3xl -z-10" />
          
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider border border-primary/25 shadow-[0_0_15px_rgba(var(--primary-rgb),0.08)]">
              <Sparkles className="h-3.5 w-3.5" />
              <span>The AI Workspace for Developers</span>
            </div>

            <h1 className="text-4xl sm:text-7xl font-black tracking-tight leading-[1.05] max-w-4xl mx-auto text-foreground">
              The AI Workspace <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-primary via-teal-400 to-accent bg-clip-text text-transparent drop-shadow-sm">
                for Developers
              </span>
            </h1>

            <p className="text-base sm:text-xl font-medium text-foreground/90 max-w-3xl mx-auto">
              Multiple AI tools. One unified workspace. Faster development.
            </p>

            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Build, document, debug, and plan software projects with AI-powered tools designed to accelerate your workflow. Spend less time switching tools and more time building.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link href={getStartedHref}>
              <Button size="lg" className="rounded-xl text-xs font-bold gap-2 px-7 h-12 bg-primary hover:bg-primary/95 text-primary-foreground shadow-lg shadow-primary/20 hover:scale-[1.04] transition-all focus:ring-2 focus:ring-primary/20 active:scale-[0.98]" aria-label="Start Building">
                Start Building
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="#tools">
              <Button size="lg" variant="outline" className="rounded-xl text-xs font-bold px-7 h-12 border-border/20 bg-background/30 backdrop-blur-md hover:bg-secondary/40 hover:text-foreground transition-all duration-300 focus:ring-2 focus:ring-primary/20" aria-label="Explore Tools">
                Explore Tools
              </Button>
            </a>
          </div>

          {/* Realistic Dashboard Preview directly below the hero section */}
          <div className="pt-10 sm:pt-14 max-w-5xl mx-auto">
            <div className="rounded-2xl border border-border/10 bg-card/65 backdrop-blur-md p-2.5 sm:p-3 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.45)] relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-accent/5 opacity-50 pointer-events-none" />
              
              {/* Window Header */}
              <div className="flex items-center justify-between px-3 pb-3 border-b border-border/5 text-[9px] text-muted-foreground/50 font-mono shrink-0">
                <div className="flex gap-1.5 items-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
                </div>
                <div className="flex items-center gap-1.5 px-3 py-0.5 rounded-md bg-background/50 border border-border/5 font-mono text-[8px] uppercase tracking-wider">
                  <Layers2 className="h-3 w-3 text-primary" />
                  <span>workspace: main-dev-env</span>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground/30">
                  <Settings className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* IDE Dashboard Window */}
              <div className="grid md:grid-cols-12 gap-3 min-h-[380px] sm:min-h-[460px] mt-2.5 text-xs text-left">
                
                {/* Mock Workspace Left Sidebar */}
                <div className="md:col-span-3 flex flex-col gap-3 bg-background/40 border border-border/5 rounded-xl p-3 shrink-0">
                  <div className="flex items-center justify-between pb-2 border-b border-border/5">
                    <span className="font-bold text-[10px] text-foreground uppercase tracking-widest flex items-center gap-1.5">
                      <Layers className="h-3 w-3 text-primary" />
                      Tools Workspace
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary font-bold text-[10px]">
                      <Code className="h-3.5 w-3.5" />
                      <span>AI Coding Assistant</span>
                    </div>
                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-secondary/30 text-muted-foreground hover:text-foreground transition-all duration-200 text-[10px]">
                      <FileText className="h-3.5 w-3.5" />
                      <span>Documentation Gen</span>
                    </div>
                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-secondary/30 text-muted-foreground hover:text-foreground transition-all duration-200 text-[10px]">
                      <Bug className="h-3.5 w-3.5" />
                      <span>Debug Assistant</span>
                    </div>
                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-secondary/30 text-muted-foreground hover:text-foreground transition-all duration-200 text-[10px]">
                      <Layers2 className="h-3.5 w-3.5" />
                      <span>Architecture Planner</span>
                    </div>
                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-secondary/30 text-muted-foreground hover:text-foreground transition-all duration-200 text-[10px]">
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>Developer Chat</span>
                    </div>
                  </div>

                  <div className="mt-auto space-y-2 border-t border-border/5 pt-2">
                    <span className="text-[9px] font-black uppercase text-muted-foreground/40 tracking-wider">Saved Canvas Files</span>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground cursor-pointer text-[10px] truncate">
                        <FileCode className="h-3 w-3 text-emerald-400" />
                        <span>schema.prisma</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground cursor-pointer text-[10px] truncate">
                        <FileCode className="h-3 w-3 text-cyan-400" />
                        <span>route.ts</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground cursor-pointer text-[10px] truncate">
                        <FileText className="h-3 w-3 text-blue-400" />
                        <span>README.md</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mock Chat Pane */}
                <div className="md:col-span-5 flex flex-col bg-background/50 border border-border/5 rounded-xl overflow-hidden">
                  <div className="px-3 py-2 border-b border-border/5 bg-secondary/15 flex items-center justify-between">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                      <MessageSquare className="h-3 w-3 text-primary" />
                      Chat Assistant
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[7px] font-mono font-bold animate-pulse uppercase">Active</span>
                  </div>
                  
                  <div className="flex-1 p-3.5 space-y-4 overflow-y-auto font-sans leading-relaxed text-[11px]">
                    <div className="space-y-1.5 text-right">
                      <span className="text-[9px] font-bold text-muted-foreground/60 uppercase">Developer</span>
                      <div className="p-2.5 rounded-2xl rounded-tr-sm bg-primary/10 border border-primary/20 text-foreground ml-4 text-left">
                        Please design a robust Postgres relational model for user workspaces and project tasks in Prisma.
                      </div>
                    </div>

                    <div className="space-y-1.5 text-left">
                      <span className="text-[9px] font-bold text-primary uppercase flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-primary" /> Nexus AI
                      </span>
                      <div className="p-2.5 rounded-2xl rounded-tl-sm bg-card border border-border/5 text-muted-foreground mr-4 space-y-2">
                        <p>I have built the database schema with relational keys and cascade deletion rules.</p>
                        <p className="text-[10px] font-bold text-accent">Review the schema in the right canvas editor.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-2.5 border-t border-border/5 bg-background/30 flex items-center gap-2">
                    <div className="flex-1 bg-background border border-border/10 rounded-lg h-8 px-3 flex items-center text-[10px] text-muted-foreground">
                      Ask Nexus AI to generate, refactor, or plan...
                    </div>
                    <Button size="icon" className="h-8 w-8 rounded-lg bg-primary hover:bg-primary/90">
                      <ArrowRight className="h-3.5 w-3.5 text-primary-foreground" />
                    </Button>
                  </div>
                </div>

                {/* Mock Right Canvas Pane */}
                <div className="md:col-span-4 flex flex-col bg-background/50 border border-border/5 rounded-xl overflow-hidden">
                  <div className="px-3 py-2 border-b border-border/5 bg-secondary/15 flex items-center justify-between">
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                      <FileCode className="h-3 w-3 text-accent" />
                      canvas: schema.prisma
                    </span>
                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-accent/10 text-accent border border-accent/20">SQL DB</span>
                  </div>

                  <pre className="flex-1 p-3.5 overflow-y-auto font-mono text-[9px] leading-relaxed text-emerald-400 bg-black/30">
                    <code>{`model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  workspaces Workspace[]
}

model Workspace {
  id        String   @id @default(uuid())
  name      String
  ownerId   String
  owner     User     @relation(fields: [ownerId], references: [id])
  tasks     Task[]
}

model Task {
  id          String   @id @default(uuid())
  title       String
  done        Boolean  @default(false)
  workspaceId String
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
}`}</code>
                  </pre>

                  <div className="px-3 py-2 border-t border-border/5 bg-secondary/15 flex justify-between items-center text-[9px] font-mono text-muted-foreground uppercase">
                    <span>lines: 23</span>
                    <span className="text-primary hover:underline cursor-pointer flex items-center gap-1 font-bold">
                      <CheckCircle className="w-3 h-3" /> Sync Database
                    </span>
                  </div>
                </div>

              </div>

              {/* Terminal Bottom Bar */}
              <div className="mt-3 border-t border-border/5 pt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-[9px] font-mono text-muted-foreground/60 px-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Terminal Status: Active</span>
                  <span className="opacity-20">|</span>
                  <span className="text-emerald-500 font-bold">$ npx prisma db push --force</span>
                </div>
                <div className="flex items-center gap-3">
                  <span>✓ 12 schemas validated</span>
                  <span className="text-primary">99.98% coverage</span>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 2. TRUST BAR */}
        <section className="w-full max-w-5xl mx-auto px-6 py-8 border-y border-border/10 bg-secondary/5 mt-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-[11px] text-muted-foreground/80 font-bold uppercase tracking-widest text-center">
            <div className="flex items-center justify-center gap-2 hover:text-foreground transition-colors">
              <Sparkles className="h-4.5 w-4.5 text-primary shrink-0" />
              <span>Open Beta Access</span>
            </div>
            <div className="flex items-center justify-center gap-2 hover:text-foreground transition-colors">
              <Terminal className="h-4.5 w-4.5 text-accent shrink-0" />
              <span>Built for Developers</span>
            </div>
            <div className="flex items-center justify-center gap-2 hover:text-foreground transition-colors">
              <ShieldCheck className="h-4.5 w-4.5 text-primary shrink-0" />
              <span>Secure Session Auth</span>
            </div>
            <div className="flex items-center justify-center gap-2 hover:text-foreground transition-colors">
              <Zap className="h-4.5 w-4.5 text-accent shrink-0" />
              <span>Fast AI Responses</span>
            </div>
          </div>
        </section>

        {/* 3. TOOLS SECTION */}
        <section id="tools" className="w-full max-w-5xl mx-auto px-6 py-20 sm:py-28 space-y-16">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[9px] font-black uppercase tracking-wider border border-primary/20">
              <Layers className="h-3.5 w-3.5" />
              <span>Features Overview</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground leading-tight">
              AI Tools Built for Developer Workflows
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto">
              Discover contextual assistants that help you code, debug, document, and plan without context switching.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Tool 1 */}
            <div className="group p-6 rounded-[2rem] border border-border/10 bg-card/40 hover:bg-card/75 hover:border-primary/30 transition-all duration-300 flex flex-col gap-4 relative overflow-hidden shadow-sm hover:shadow-md hover:shadow-primary/5">
              <div className="p-3.5 rounded-2xl bg-primary/15 border border-primary/20 w-fit text-primary transition-transform group-hover:scale-105 group-hover:rotate-3 duration-300">
                <Code className="h-5 w-5" />
              </div>
              <div className="space-y-2 text-left">
                <h3 className="text-sm font-bold text-foreground flex items-center justify-between">
                  AI Coding Assistant
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/30 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Generate, explain, optimize, and refactor code. Accelerate syntax writing and refactoring.
                </p>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -z-10 group-hover:bg-primary/10 transition-colors" />
            </div>

            {/* Tool 2 */}
            <div className="group p-6 rounded-[2rem] border border-border/10 bg-card/40 hover:bg-card/75 hover:border-accent/30 transition-all duration-300 flex flex-col gap-4 relative overflow-hidden shadow-sm hover:shadow-md hover:shadow-accent/5">
              <div className="p-3.5 rounded-2xl bg-accent/15 border border-accent/20 w-fit text-accent transition-transform group-hover:scale-105 group-hover:rotate-3 duration-300">
                <FileText className="h-5 w-5" />
              </div>
              <div className="space-y-2 text-left">
                <h3 className="text-sm font-bold text-foreground flex items-center justify-between">
                  Documentation Generator
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/30 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Create PRDs, README files, API documentation, and technical docs with clean Markdown exports.
                </p>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-2xl -z-10 group-hover:bg-accent/10 transition-colors" />
            </div>

            {/* Tool 3 */}
            <div className="group p-6 rounded-[2rem] border border-border/10 bg-card/40 hover:bg-card/75 hover:border-primary/30 transition-all duration-300 flex flex-col gap-4 relative overflow-hidden shadow-sm hover:shadow-md hover:shadow-primary/5">
              <div className="p-3.5 rounded-2xl bg-primary/15 border border-primary/20 w-fit text-primary transition-transform group-hover:scale-105 group-hover:rotate-3 duration-300">
                <Bug className="h-5 w-5" />
              </div>
              <div className="space-y-2 text-left">
                <h3 className="text-sm font-bold text-foreground flex items-center justify-between">
                  Debug Assistant
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/30 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Analyze runtime errors, decode stack traces, and discover corrective code patches faster.
                </p>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -z-10 group-hover:bg-primary/10 transition-colors" />
            </div>

            {/* Tool 4 */}
            <div className="group p-6 rounded-[2rem] border border-border/10 bg-card/40 hover:bg-card/75 hover:border-accent/30 transition-all duration-300 flex flex-col gap-4 relative overflow-hidden shadow-sm hover:shadow-md hover:shadow-accent/5">
              <div className="p-3.5 rounded-2xl bg-accent/15 border border-accent/20 w-fit text-accent transition-transform group-hover:scale-105 group-hover:rotate-3 duration-300">
                <Layers className="h-5 w-5" />
              </div>
              <div className="space-y-2 text-left">
                <h3 className="text-sm font-bold text-foreground flex items-center justify-between">
                  Architecture Planner
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/30 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Design database models, map schemas, and plan modular software system architectures.
                </p>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-2xl -z-10 group-hover:bg-accent/10 transition-colors" />
            </div>

            {/* Tool 5 */}
            <div className="group p-6 rounded-[2rem] border border-border/10 bg-card/40 hover:bg-card/75 hover:border-primary/30 transition-all duration-300 flex flex-col gap-4 relative overflow-hidden shadow-sm hover:shadow-md hover:shadow-primary/5">
              <div className="p-3.5 rounded-2xl bg-primary/15 border border-primary/20 w-fit text-primary transition-transform group-hover:scale-105 group-hover:rotate-3 duration-300">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div className="space-y-2 text-left">
                <h3 className="text-sm font-bold text-foreground flex items-center justify-between">
                  Developer Chat
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground/30 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Collaborate with AI to solve technical problems in an organized side-by-side workspace.
                </p>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -z-10 group-hover:bg-primary/10 transition-colors" />
            </div>

            {/* Tool 6 - Coming Soon Placeholder */}
            <div className="p-6 rounded-[2rem] border border-dashed border-border/25 bg-muted/5 flex flex-col justify-center items-center text-center py-10 relative overflow-hidden">
              <Activity className="h-7 w-7 text-muted-foreground/30 mb-2.5 animate-pulse" />
              <h3 className="text-xs font-bold text-muted-foreground/70">Continuous Evolution</h3>
              <p className="text-[10px] text-muted-foreground/45 max-w-[180px] leading-relaxed mt-1">
                We are actively developing new modules to accelerate coding tasks.
              </p>
            </div>
          </div>
        </section>

        {/* 4. HOW IT WORKS */}
        <section className="w-full max-w-5xl mx-auto px-6 py-20 sm:py-28 border-t border-border/5 space-y-16 relative">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent text-[9px] font-black uppercase tracking-wider border border-accent/20">
              <Zap className="h-3.5 w-3.5" />
              <span>Timeline Guide</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight">How it Works</h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
              A smooth workspace lifecycle mapping from prompt ideas to deployed code results.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-4 text-left">
            {/* Step 1 */}
            <div className="p-6 rounded-[2rem] border border-border/10 bg-card/25 flex flex-col gap-4 relative overflow-hidden group hover:border-primary/20 transition-colors">
              <span className="absolute top-4 right-6 text-4xl font-black text-primary/10 font-mono tracking-tighter group-hover:scale-105 duration-200">01</span>
              <div className="text-primary font-bold text-xs">Step 1</div>
              <h3 className="text-sm font-bold text-foreground">Describe your task</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Describe your project scope, paste error stacks, or prompt specific features to build.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-[2rem] border border-border/10 bg-card/25 flex flex-col gap-4 relative overflow-hidden group hover:border-accent/20 transition-colors">
              <span className="absolute top-4 right-6 text-4xl font-black text-accent/10 font-mono tracking-tighter group-hover:scale-105 duration-200">02</span>
              <div className="text-accent font-bold text-xs">Step 2</div>
              <h3 className="text-sm font-bold text-foreground">Choose an AI tool</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Toggle your target workspace module (Code, Docs, Debug, Schema) to invoke dedicated AI personas.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-[2rem] border border-border/10 bg-card/25 flex flex-col gap-4 relative overflow-hidden group hover:border-primary/20 transition-colors">
              <span className="absolute top-4 right-6 text-4xl font-black text-primary/10 font-mono tracking-tighter group-hover:scale-105 duration-200">03</span>
              <div className="text-primary font-bold text-xs">Step 3</div>
              <h3 className="text-sm font-bold text-foreground">Generate results</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Watch generated documents or code stream directly into the interactive canvas workspace panel.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-[2rem] border border-border/10 bg-card/25 flex flex-col gap-4 relative overflow-hidden group hover:border-accent/20 transition-colors">
              <span className="absolute top-4 right-6 text-4xl font-black text-accent/10 font-mono tracking-tighter group-hover:scale-105 duration-200">04</span>
              <div className="text-accent font-bold text-xs">Step 4</div>
              <h3 className="text-sm font-bold text-foreground">Build faster</h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Instantly sync your files, copy clean formatted code, or export documentation to Markdown.
              </p>
            </div>
          </div>
        </section>

        {/* 5. SCREENSHOT SECTION */}
        <section className="w-full max-w-6xl mx-auto px-6 py-20 sm:py-28 border-t border-border/5 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[9px] font-black uppercase tracking-wider border border-primary/20">
              <Globe className="h-3.5 w-3.5" />
              <span>Interactive Screenshot Gallery</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
              A Deep Look inside the Platform
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
              Explore the key user interface segments of Nexus AI. Use the selector controls to cycle layouts.
            </p>
          </div>

          <div className="space-y-8 max-w-5xl mx-auto">
            {/* Interactive Selectors */}
            <div className="flex flex-wrap justify-center gap-2">
              {(Object.keys(showcaseContent) as Array<keyof typeof showcaseContent>).map((key) => (
                <button
                  key={key}
                  onClick={() => setShowcaseTab(key)}
                  className={cn(
                    "px-4 py-2.5 rounded-xl text-xs font-bold transition-all border duration-300 cursor-pointer",
                    showcaseTab === key
                      ? "bg-secondary border-border/30 text-foreground shadow-lg shadow-black/10 scale-[1.02]"
                      : "bg-transparent border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/20"
                  )}
                  role="tab"
                  aria-selected={showcaseTab === key}
                >
                  {showcaseContent[key].title}
                </button>
              ))}
            </div>

            {/* Showcase Output Box */}
            <AnimatePresence mode="wait">
              <motion.div
                key={showcaseTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="rounded-3xl border border-border/10 bg-card/35 backdrop-blur-md p-3 sm:p-5 shadow-2xl relative overflow-hidden text-left"
              >
                <div className="grid md:grid-cols-12 gap-5">
                  {/* Left Column: UI Description and prompt detail */}
                  <div className="md:col-span-5 flex flex-col justify-between space-y-6 p-2">
                    <div className="space-y-3.5">
                      <h3 className="text-lg font-black text-foreground">{showcaseContent[showcaseTab].title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {showcaseContent[showcaseTab].desc}
                      </p>
                    </div>

                    <div className="space-y-3">
                      {/* Prompts list */}
                      <div className="p-3.5 rounded-2xl bg-background border border-border/5 space-y-1.5 shadow-sm">
                        <div className="flex items-center gap-1.5 text-primary text-[8px] font-black uppercase tracking-wider">
                          <MessageSquare className="w-3 h-3" /> User Prompt Input
                        </div>
                        <p className="text-[11px] font-bold text-foreground leading-relaxed">
                          &ldquo;{showcaseContent[showcaseTab].prompt}&rdquo;
                        </p>
                      </div>

                      {/* AI Explain list */}
                      <div className="p-3.5 rounded-2xl bg-primary/5 border border-primary/10 space-y-1.5 shadow-sm">
                        <div className="flex items-center gap-1.5 text-accent text-[8px] font-black uppercase tracking-wider">
                          <Sparkles className="w-3 h-3 animate-spin-slow" /> AI Explanation
                        </div>
                        <p className="text-[10px] text-muted-foreground leading-relaxed">
                          {showcaseContent[showcaseTab].aiResponse}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Code Canvas Placeholder Mockup */}
                  <div className="md:col-span-7 flex flex-col bg-black/45 border border-border/5 rounded-2xl overflow-hidden min-h-[320px] max-h-[420px]">
                    <div className="px-4 py-2.5 border-b border-border/5 bg-secondary/15 flex items-center justify-between font-mono text-[9px] shrink-0 text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-cyan-400" />
                        <span className="font-bold">{showcaseContent[showcaseTab].fileName}</span>
                      </div>
                      <span className="uppercase text-[8px] font-bold">Active Canvas</span>
                    </div>

                    <div className="flex-1 p-4 overflow-y-auto font-mono text-[10px] leading-relaxed text-emerald-300">
                      <pre className="whitespace-pre-wrap">
                        <code>{showcaseContent[showcaseTab].code}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        {/* 6. BENEFITS SECTION */}
        <section className="w-full max-w-5xl mx-auto px-6 py-20 sm:py-28 border-t border-border/5 space-y-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-[9px] font-black uppercase tracking-wider border border-primary/20">
                <CheckCircle className="h-3.5 w-3.5" />
                <span>Value Comparison</span>
              </div>
              <h2 className="text-3xl sm:text-6xl font-black tracking-tight leading-[1.05]">
                Everything Developers Need in One Place
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Stop switching between generic chatbots, documentation tabs, error logs, and local text editors. Nexus AI unites your active tech context so you spend less time switching and more time shipping.
              </p>
            </div>

            <div className="rounded-3xl border border-border/10 bg-card/45 p-6 sm:p-8 space-y-6 text-left shadow-lg">
              <ul className="space-y-4 text-xs leading-relaxed text-muted-foreground">
                <li className="flex items-start gap-3.5">
                  <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-foreground font-black">Faster development:</strong> Automate boilerplate setups, code logic refactorings, and file declarations in real-time.
                  </div>
                </li>
                <li className="flex items-start gap-3.5">
                  <CheckCircle className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-foreground font-black">Better documentation:</strong> Maintain active database schemas, README specs, and requirements sheets side-by-side with chats.
                  </div>
                </li>
                <li className="flex items-start gap-3.5">
                  <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-foreground font-black">Reduced debugging time:</strong> Find structural errors and decode stack traces directly through the Debug assistant.
                  </div>
                </li>
                <li className="flex items-start gap-3.5">
                  <CheckCircle className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-foreground font-black">Unified workflow:</strong> Write code, plan architectures, run chat logic, and maintain documents inside a unified pane.
                  </div>
                </li>
                <li className="flex items-start gap-3.5">
                  <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-foreground font-black">Improved productivity:</strong> Erase tab-swapping and let your mind focus entirely on designing the product algorithms.
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* 7. FAQ */}
        <section id="faq" className="w-full max-w-3xl mx-auto px-6 py-20 sm:py-28 border-t border-border/5 space-y-16">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent text-[9px] font-black uppercase tracking-wider border border-accent/20">
              <HelpCircle className="h-3.5 w-3.5" />
              <span>Questions Answered</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight">Frequently Asked Questions</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Learn how Nexus AI can assist you in building products.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="rounded-2xl border border-border/10 bg-card/30 overflow-hidden transition-all duration-300">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-4.5 flex items-center justify-between text-left text-xs font-bold text-foreground hover:bg-secondary/15 transition-colors gap-4 cursor-pointer"
                  aria-expanded={!!faqOpen[index]}
                >
                  <span className="flex items-center gap-2.5">
                    <HelpCircle className="h-4.5 w-4.5 text-primary shrink-0" />
                    {faq.q}
                  </span>
                  <ChevronDown className={cn(
                    "h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-300",
                    faqOpen[index] ? "rotate-180 text-foreground" : ""
                  )} />
                </button>
                
                <AnimatePresence initial={false}>
                  {faqOpen[index] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-5 pt-1 text-xs text-muted-foreground leading-relaxed border-t border-border/5">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>

        {/* 8. FINAL CTA */}
        <section className="w-full max-w-5xl mx-auto px-6 py-16 sm:py-24 text-center">
          <div className="rounded-[2.5rem] bg-gradient-to-br from-primary/15 via-background to-accent/20 border border-border/15 p-8 sm:p-20 space-y-8 relative overflow-hidden shadow-2xl">
            <div className="space-y-4 max-w-2xl mx-auto relative z-10">
              <h2 className="text-3xl sm:text-6xl font-black tracking-tight leading-none text-foreground">
                Build Better Software with AI
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-lg mx-auto">
                Unify your coding, debugging, planning, and documentation tools. Get started with the next-gen AI workspace.
              </p>
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link href={getStartedHref}>
                <Button size="lg" className="rounded-xl text-xs font-bold gap-2 px-8 h-12 bg-primary hover:bg-primary/95 text-primary-foreground shadow-lg shadow-primary/25 hover:scale-[1.04] active:scale-[0.98] transition-all focus:ring-2 focus:ring-primary/20" aria-label="Start Building Today">
                  Start Building Today
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="absolute -inset-4 bg-primary/5 rounded-3xl blur-3xl -z-10" />
          </div>
        </section>

      </main>

      {/* Footer Section */}
      <footer className="relative z-10 w-full max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between border-t border-border/5 text-[10px] text-muted-foreground shrink-0 gap-4">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span>Secure Authentication (NextAuth v5)</span>
          </div>
          <span className="opacity-25">|</span>
          <span className="font-mono text-muted-foreground/60">Next.js • Prisma • MariaDB</span>
        </div>
        <div>
          &copy; 2026 Nexus AI. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
