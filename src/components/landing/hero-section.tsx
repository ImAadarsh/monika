"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Bot, Sparkles, Zap } from "lucide-react";
import { GlowButton } from "./glow-button";

const WORDS = ["Surveys", "Feedback", "Registrations", "Applications", "Polls"];
const LONGEST_WORD = "Registrations";

export function HeroSection() {
  return (
    <section className="relative mx-auto max-w-6xl px-6 pb-24 pt-16 sm:pt-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mx-auto max-w-4xl text-center"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-indigo-200/60 bg-white/60 px-4 py-2 text-sm font-medium text-indigo-700 shadow-sm backdrop-blur-md"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500" />
          </span>
          <Bot className="h-4 w-4" />
          AI-Powered Form Intelligence
          <Sparkles className="h-4 w-4 text-purple-500" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl"
        >
          Create stunning{" "}
          <RotatingWords words={WORDS} />
          {" "}in seconds.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl"
        >
          FormFlow is your MCA-ready platform to build, share via QR codes, and analyze
          every response with real-time AI-driven insights.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <Link href="/admin/login">
            <GlowButton>
              Launch Dashboard <ArrowRight className="h-4 w-4" />
            </GlowButton>
          </Link>
          <Link href="/admin/forms/new">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-white/70 px-6 py-3 text-sm font-medium shadow-sm backdrop-blur-md transition-colors hover:bg-white"
            >
              <Zap className="h-4 w-4 text-amber-500" />
              Create a Form
            </motion.button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground"
        >
          {["13+ Field Types", "Instant QR Codes", "Live Analytics", "Unlimited Forms"].map(
            (item, i) => (
              <motion.span
                key={item}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + i * 0.1 }}
                className="flex items-center gap-2"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                {item}
              </motion.span>
            )
          )}
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.8 }}
        className="relative mx-auto mt-20 max-w-4xl"
      >
        <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-2xl" />
        <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/70 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-2 border-b border-border/50 bg-slate-50/80 px-4 py-3">
            <div className="flex gap-1.5">
              <span className="h-3 w-3 rounded-full bg-red-400" />
              <span className="h-3 w-3 rounded-full bg-amber-400" />
              <span className="h-3 w-3 rounded-full bg-emerald-400" />
            </div>
            <span className="ml-2 text-xs text-muted-foreground">formflow.app/builder</span>
          </div>
          <div className="grid gap-4 p-6 sm:grid-cols-2">
            <PreviewField label="Full Name" type="text" delay={0} />
            <PreviewField label="Email Address" type="email" delay={0.1} />
            <PreviewField label="Department" type="select" delay={0.2} />
            <PreviewField label="Rating" type="stars" delay={0.3} />
          </div>
          <motion.div
            className="mx-6 mb-6 h-10 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600"
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
}

function RotatingWords({ words }: { words: string[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % words.length);
    }, 2800);
    return () => clearInterval(timer);
  }, [words.length]);

  return (
    <span className="relative inline-block align-baseline">
      <span className="invisible inline-block" aria-hidden="true">
        {LONGEST_WORD}
      </span>
      <span className="absolute left-0 top-0 inline-flex h-full items-center">
        <AnimatePresence mode="wait">
          <motion.span
            key={words[index]}
            initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -20, filter: "blur(6px)" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent"
          >
            {words[index]}
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  );
}

function PreviewField({
  label,
  type,
  delay,
}: {
  label: string;
  type: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1.2 + delay }}
      className="space-y-2"
    >
      <p className="text-xs font-medium text-slate-600">{label}</p>
      {type === "stars" ? (
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <motion.span
              key={s}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.5 + s * 0.1 }}
              className="text-lg text-amber-400"
            >
              ★
            </motion.span>
          ))}
        </div>
      ) : (
        <div className="h-9 rounded-lg border border-border/60 bg-white/80 px-3 flex items-center text-xs text-muted-foreground">
          {type === "select" ? "Select an option ▾" : `Enter your ${label.toLowerCase()}...`}
        </div>
      )}
    </motion.div>
  );
}
