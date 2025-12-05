"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { ParticleCanvas } from "@/components/ui/ParticleCanvas";

export default function Home() {
  return (
    <>
      {/* Background Effects */}
      <div className="gradient-orb orb-1" />
      <div className="gradient-orb orb-2" />
      <div className="gradient-orb orb-3" />
      <div className="mouse-glow" id="mouse-glow" />
      <div className="grid-overlay" />

      {/* Particle Canvas */}
      <div className="canvas-container">
        <ParticleCanvas />
      </div>

      {/* Main Content */}
      <div className="page-wrapper">
        {/* Navigation */}
        <nav className="sticky top-0 z-[100] border-b border-white/5 bg-pixel-bg-primary/80 backdrop-blur-[10px]">
          <div className="container mx-auto max-w-[1400px] px-lg">
            <div className="flex items-center justify-between py-md">
              <div className="flex items-center gap-sm">
                <div className="relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-pixel-neon-pink to-pixel-neon-purple font-pixel text-2xl shadow-[0_0_20px_rgba(255,45,149,0.3),0_0_40px_rgba(191,95,255,0.2)]">
                  <span className="relative z-10">P</span>
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent to-white/10 -translate-x-full transition-transform duration-600 hover:translate-x-full" />
                </div>
                <div className="font-display text-2xl uppercase tracking-wider">
                  PIXEL<span className="text-pixel-neon-pink">BOXX</span>
                </div>
              </div>
              <div className="flex gap-sm">
                <Link href="/editor">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/editor">
                  <Button variant="primary">Get Started</Button>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative flex min-h-[calc(100vh-100px)] items-center justify-center py-3xl">
          <div className="container mx-auto max-w-[1400px] px-lg">
            <div className="mx-auto max-w-[1000px] text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm text-pixel-text-secondary backdrop-blur-sm animate-float">
                <div className="h-2 w-2 animate-pulse rounded-full bg-pixel-neon-lime shadow-[0_0_10px_var(--neon-lime)]" />
                <span>Now in early access</span>
              </div>

              {/* Title */}
              <h1 className="mt-lg font-display text-[clamp(3rem,12vw,8rem)] uppercase leading-none tracking-tight">
                <span className="block text-pixel-text-primary animate-fadeInUp">
                  YOUR SPACE.
                </span>
                <span
                  className="block text-gradient animate-fadeInUp [animation-delay:0.2s] [filter:drop-shadow(0_0_30px_rgba(255,45,149,0.5))]"
                  style={{ animationDelay: "0.2s" }}
                >
                  YOUR RULES.
                </span>
              </h1>

              {/* Subtitle */}
              <p
                className="mx-auto mt-xl max-w-[700px] text-[clamp(1.1rem,3vw,1.5rem)] font-light leading-relaxed text-pixel-text-secondary animate-fadeInUp"
                style={{ animationDelay: "0.4s" }}
              >
                The nostalgia of MySpace meets the power of modern chat. Create
                your <span className="font-semibold text-pixel-neon-cyan">PixelPage</span>,
                join <span className="font-semibold text-pixel-neon-pink">communities</span>,
                and express yourself like it&apos;s 2006 — but better.
              </p>

              {/* CTA Buttons */}
              <div
                className="mt-xl flex flex-wrap justify-center gap-md animate-fadeInUp"
                style={{ animationDelay: "0.6s" }}
              >
                <Link href="/editor">
                  <Button variant="primary" size="large">
                    Create Your PixelPage
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Button>
                </Link>
                <a href="#features">
                  <Button variant="ghost" size="large">
                    Explore Features
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="relative py-3xl">
          <div className="container mx-auto max-w-[1400px] px-lg">
            <div className="mt-2xl grid grid-cols-1 gap-lg md:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon="🎨"
                title="PixelPages"
                description="Fully customizable profile pages with CSS injection. Express yourself your way—no limits, no paywalls."
                accentColor="pink"
              />
              <FeatureCard
                icon="💬"
                title="Real-time Chat"
                description="Servers, channels, and DMs. All the community features you love, modernized and lightning-fast."
                accentColor="cyan"
              />
              <FeatureCard
                icon="✨"
                title="Top Friends"
                description="Show off your squad. Because some connections deserve the spotlight. Classic MySpace vibes."
                accentColor="purple"
              />
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-auto border-t border-white/5 py-xl backdrop-blur-sm">
          <div className="container mx-auto max-w-[1400px] px-lg">
            <div className="flex flex-wrap items-center justify-between gap-md">
              <p className="font-pixel text-sm text-pixel-text-muted">
                © 2024 PixelBoxx. Relive the magic.
              </p>
              <div className="flex gap-lg">
                <a
                  href="#"
                  className="text-sm text-pixel-text-muted transition-colors hover:text-pixel-neon-pink"
                >
                  About
                </a>
                <a
                  href="#"
                  className="text-sm text-pixel-text-muted transition-colors hover:text-pixel-neon-pink"
                >
                  Privacy
                </a>
                <a
                  href="#"
                  className="text-sm text-pixel-text-muted transition-colors hover:text-pixel-neon-pink"
                >
                  Terms
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
