"use client";

import { Button } from "@/components/ui/button";
import { Layout, Server, Lock, PlugZap, Zap, Terminal } from "lucide-react";
import * as React from "react";

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative">
        {/* Multi-layered background glow for depth and smoothness */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 -z-10"
        >
          {/* Large outer glow - very subtle */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-3/4 w-full max-w-6xl rounded-[50%] bg-[color-mix(in_oklch,var(--color-primary),transparent_95%)] blur-[120px]" />
          </div>
          {/* Medium inner glow */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-2/5 w-4/5 max-w-4xl rounded-[50%] bg-[color-mix(in_oklch,var(--color-primary),transparent_85%)] blur-[80px]" />
          </div>
          {/* Small core glow */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-1/4 w-3/5 max-w-2xl rounded-[50%] bg-[color-mix(in_oklch,var(--color-primary),transparent_75%)] blur-[60px]" />
          </div>
          {/* Anti-banding noise overlay */}
          <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.035] [background-image:url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZmlsdGVyIGlkPSJub2lzZSI+CiAgICA8ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iMC45IiBudW1PY3RhdmVzPSI0IiBzZWVkPSIxIi8+CiAgICA8ZmVDb2xvck1hdHJpeCBpbj0iVHVyYnVsZW5jZSIgdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPgogIDwvZmlsdGVyPgogIDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNub2lzZSkiLz4KPC9zdmc+')] [background-size:128px_128px]" />
        </div>

        <div className="mx-auto max-w-6xl px-6">
          <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center py-12 md:py-20">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs text-foreground">
                <span>Open‑source</span>
                <span className="h-1 w-1 rounded-full bg-foreground/50" />
                <span>MIT</span>
                <span className="h-1 w-1 rounded-full bg-foreground/50" />
                <span>Dockerized</span>
              </div>
              <h1 className="mt-6 text-balance text-5xl font-semibold tracking-tight sm:text-6xl">
                <span className="mr-2">Tiny</span>
                <span className="mx-1 inline-block align-[.18em] relative top-[12px] left-[3px]">
                  <img src="/mcplight.png" alt="MCP" className="inline-block h-[1em] w-auto dark:hidden" />
                  <img src="/mcp.png" alt="MCP" className="hidden h-[1em] w-auto dark:inline-block" />
                </span>
                <span className="ml-2">Client</span>
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-balance text-lg leading-relaxed text-foreground">
                Self‑hostable, private‑by‑default, and instantly extensible. A tiny, blazing‑fast
                MCP client powered by FastAPI and Supabase, with a beautiful Next.js + Tailwind + ShadCN UI.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-3">
                <Button asChild size="lg">
                  <a href="#get-started">Get Started</a>
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                  <a href="#docs">View Documentation</a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-14 md:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Built for speed and control</h2>
            <p className="mt-3 text-sm text-foreground">
              Everything you need to run MCP agents locally with a refined developer experience.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="group rounded-xl border bg-card p-6 shadow-sm transition-colors hover:bg-accent/30">
              <div className="mb-3 inline-flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Layout className="size-4" />
              </div>
              <h3 className="text-base font-semibold">Modern Frontend</h3>
              <p className="mt-2 text-sm text-foreground">
                Next.js 15, React 19, Tailwind v4, ShadCN UI, and Lucide icons for fast iteration.
              </p>
            </div>
            <div className="group rounded-xl border bg-card p-6 shadow-sm transition-colors hover:bg-accent/30">
              <div className="mb-3 inline-flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Server className="size-4" />
              </div>
              <h3 className="text-base font-semibold">Solid Backend</h3>
              <p className="mt-2 text-sm text-foreground">
                FastAPI and Supabase for auth, storage, and data—typed endpoints and crisp DX.
              </p>
            </div>
            <div className="group rounded-xl border bg-card p-6 shadow-sm transition-colors hover:bg-accent/30">
              <div className="mb-3 inline-flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Lock className="size-4" />
              </div>
              <h3 className="text-base font-semibold">Private & Self‑hostable</h3>
              <p className="mt-2 text-sm text-foreground">
                Run on your own infra. No trackers, no hidden calls. Docker images ready to ship.
              </p>
            </div>
            <div className="group rounded-xl border bg-card p-6 shadow-sm transition-colors hover:bg-accent/30">
              <div className="mb-3 inline-flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                <PlugZap className="size-4" />
              </div>
              <h3 className="text-base font-semibold">Extensible MCP</h3>
              <p className="mt-2 text-sm text-foreground">
                Add tools and providers with lightweight modules. Hack it to fit your workflow.
              </p>
            </div>
            <div className="group rounded-xl border bg-card p-6 shadow-sm transition-colors hover:bg-accent/30">
              <div className="mb-3 inline-flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Zap className="size-4" />
              </div>
              <h3 className="text-base font-semibold">Blazing Performance</h3>
              <p className="mt-2 text-sm text-foreground">
                Tiny footprint, instant reloads, and snappy UI. Optimized for local-first speed.
              </p>
            </div>
            <div className="group rounded-xl border bg-card p-6 shadow-sm transition-colors hover:bg-accent/30">
              <div className="mb-3 inline-flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Terminal className="size-4" />
              </div>
              <h3 className="text-base font-semibold">First‑class DX</h3>
              <p className="mt-2 text-sm text-foreground">
                Clean APIs, strong typing, and sensible defaults so you can move fast without mess.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="pb-20">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mx-auto mb-10 max-w-xl text-center">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">How it works</h2>
            <p className="mt-3 text-sm text-foreground">
              From zero to running agents in three quick steps.
            </p>
          </div>
          <ol className="grid gap-5 sm:grid-cols-3">
            <li className="rounded-xl border bg-card p-6 text-center">
              <div className="mx-auto mb-3 flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">1</div>
              <h3 className="text-base font-semibold">Compose your tools</h3>
              <p className="mt-2 text-sm text-foreground">Select MCP providers, connect credentials, pick capabilities.</p>
            </li>
            <li className="rounded-xl border bg-card p-6 text-center">
              <div className="mx-auto mb-3 flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">2</div>
              <h3 className="text-base font-semibold">Configure TinyClient</h3>
              <p className="mt-2 text-sm text-foreground">Tune defaults, scopes, and resources with clean config.</p>
            </li>
            <li className="rounded-xl border bg-card p-6 text-center">
              <div className="mx-auto mb-3 flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">3</div>
              <h3 className="text-base font-semibold">Run and iterate</h3>
              <p className="mt-2 text-sm text-foreground">Ship locally or in Docker. Monitor, tweak, and extend anytime.</p>
            </li>
          </ol>
          <div className="mt-10 text-center">
            <Button asChild>
              <a href="#get-started">Start in minutes</a>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
