"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AuroraBackground,
  FloatingParticles,
  MouseGlow,
} from "./aurora-background";
import { HeroSection } from "./hero-section";
import {
  BentoFeatures,
  StatsSection,
  HowItWorks,
  CTASection,
} from "./bento-features";

export function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <AuroraBackground />
      <MouseGlow />
      <FloatingParticles />

      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 border-b border-white/20 glass"
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="group flex items-center gap-2.5 font-semibold text-lg">
            <motion.div
              whileHover={{ rotate: 180, scale: 1.1 }}
              transition={{ duration: 0.4 }}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30"
            >
              <Sparkles className="h-5 w-5" />
            </motion.div>
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              FormFlow
            </span>
          </Link>
          <nav className="flex items-center gap-3">
            <Link href="/admin/forms/new" className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:block">
              Create Form
            </Link>
            <Link href="/admin/login">
              <Button variant="outline" className="border-indigo-200/60 bg-white/60 backdrop-blur-md hover:bg-white">
                Admin Login
              </Button>
            </Link>
          </nav>
        </div>
      </motion.header>

      <main>
        <HeroSection />
        <StatsSection />
        <BentoFeatures />
        <HowItWorks />
        <CTASection />
      </main>

      <footer className="border-t border-border/40 py-8 text-center text-sm text-muted-foreground">
        <p>FormFlow — Smart Form Builder & Analytics Platform</p>
        <p className="mt-1 text-xs">Built for MCA Project · Powered by Next.js & AI</p>
      </footer>
    </div>
  );
}
