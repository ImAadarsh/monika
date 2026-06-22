"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  BarChart3,
  Brain,
  Layers,
  QrCode,
  Share2,
  Sparkles,
  Zap,
} from "lucide-react";

const FEATURES = [
  {
    title: "Smart Form Builder",
    tag: "BUILD",
    desc: "13+ field types — text, dropdowns, ratings, scales, checkboxes and more. Drag, reorder, publish.",
    icon: Sparkles,
    color: "from-indigo-500/20 to-purple-500/10",
    border: "hover:border-indigo-300/50",
    span: "md:col-span-2 md:row-span-2",
    index: "01",
  },
  {
    title: "QR & Share Links",
    tag: "SHARE",
    desc: "Auto-generated QR codes and unique URLs for every form.",
    icon: QrCode,
    color: "from-cyan-500/20 to-blue-500/10",
    border: "hover:border-cyan-300/50",
    span: "md:col-span-1 md:row-span-1",
    index: "02",
  },
  {
    title: "AI Analytics",
    tag: "INSIGHTS",
    desc: "Timeline charts, field breakdowns, device stats, hourly heatmaps.",
    icon: Brain,
    color: "from-purple-500/20 to-pink-500/10",
    border: "hover:border-purple-300/50",
    span: "md:col-span-1 md:row-span-1",
    index: "03",
  },
  {
    title: "Real-time Responses",
    tag: "LIVE",
    desc: "Watch submissions roll in with instant validation and confirmation screens.",
    icon: Zap,
    color: "from-amber-500/20 to-orange-500/10",
    border: "hover:border-amber-300/50",
    span: "md:col-span-1 md:row-span-1",
    index: "04",
  },
  {
    title: "Deep Analytics Dashboard",
    tag: "DATA",
    desc: "Every stat you need — today, this week, this month, per-field analysis.",
    icon: BarChart3,
    color: "from-emerald-500/20 to-teal-500/10",
    border: "hover:border-emerald-300/50",
    span: "md:col-span-2 md:row-span-1",
    index: "05",
  },
  {
    title: "Multi-Form System",
    tag: "SCALE",
    desc: "Create unlimited forms. Manage, edit, publish, and delete from one dashboard.",
    icon: Layers,
    color: "from-violet-500/20 to-indigo-500/10",
    border: "hover:border-violet-300/50",
    span: "md:col-span-1 md:row-span-1",
    index: "06",
  },
];

export function BentoFeatures() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="mx-auto max-w-6xl px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="mb-12 text-center"
      >
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-600">
          Capabilities
        </span>
        <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
          Everything you need,{" "}
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            beautifully built
          </span>
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:auto-rows-[minmax(160px,auto)]">
        {FEATURES.map((feature, i) => (
          <BentoCard key={feature.title} feature={feature} index={i} isInView={isInView} />
        ))}
      </div>
    </section>
  );
}

function BentoCard({
  feature,
  index,
  isInView,
}: {
  feature: (typeof FEATURES)[0];
  index: number;
  isInView: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const Icon = feature.icon;

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--x", `${e.clientX - rect.left}px`);
    el.style.setProperty("--y", `${e.clientY - rect.top}px`);
  }

  return (
    <motion.article
      ref={cardRef}
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0, y: 30, scale: 0.96 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ delay: index * 0.08, duration: 0.5, type: "spring", stiffness: 100 }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/60 bg-white/60 p-6 shadow-sm backdrop-blur-md transition-shadow hover:shadow-xl ${feature.border} ${feature.span}`}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-60 transition-opacity group-hover:opacity-100`}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(300px circle at var(--x, 50%) var(--y, 50%), rgba(99,102,241,0.12), transparent 60%)",
        }}
      />

      <div className="relative z-10">
        <div className="mb-4 flex items-center justify-between">
          <span className="font-mono text-xs font-bold text-muted-foreground">{feature.index}</span>
          <span className="rounded-full border border-indigo-200/60 bg-white/80 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-indigo-600">
            {feature.tag}
          </span>
        </div>
        <motion.div
          className="mb-4 inline-flex rounded-xl bg-white/80 p-3 shadow-sm"
          whileHover={{ rotate: [0, -5, 5, 0], transition: { duration: 0.4 } }}
        >
          <Icon className="h-6 w-6 text-indigo-600" />
        </motion.div>
        <h3 className="text-lg font-semibold">{feature.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.desc}</p>
      </div>
    </motion.article>
  );
}

export function StatsSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const stats = [
    { value: 13, suffix: "+", label: "Field Types" },
    { value: 100, suffix: "%", label: "Free to Use" },
    { value: 0, suffix: "", label: "Setup Time", prefix: "<1 min" },
    { value: 24, suffix: "/7", label: "Always Online" },
  ];

  return (
    <section ref={ref} className="mx-auto max-w-6xl px-6 py-16">
      <div className="rounded-2xl border border-border/60 bg-gradient-to-r from-indigo-600/5 via-purple-600/5 to-pink-600/5 p-8 backdrop-blur-md sm:p-12">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: i * 0.1, type: "spring" }}
              className="text-center"
            >
              <p className="text-3xl font-bold sm:text-4xl">
                {stat.prefix ? (
                  stat.prefix
                ) : (
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} active={isInView} />
                )}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AnimatedCounter({
  target,
  suffix,
  active,
}: {
  target: number;
  suffix: string;
  active: boolean;
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) return;
    let start = 0;
    const duration = 1500;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [active, target]);

  return (
    <>
      {count}
      {suffix}
    </>
  );
}

export function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  const steps = [
    { icon: Sparkles, title: "Build", desc: "Design your form with our visual builder" },
    { icon: Share2, title: "Share", desc: "Get a QR code and link instantly" },
    { icon: BarChart3, title: "Analyze", desc: "Track every response in real-time" },
  ];

  return (
    <section ref={ref} className="mx-auto max-w-6xl px-6 py-24">
      <motion.h2
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        className="mb-16 text-center text-3xl font-bold"
      >
        Three steps to{" "}
        <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          form mastery
        </span>
      </motion.h2>

      <div className="relative grid gap-8 md:grid-cols-3">
        <div className="absolute left-0 right-0 top-12 hidden h-0.5 bg-gradient-to-r from-transparent via-indigo-300 to-transparent md:block" />
        {steps.map((step, i) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.2 }}
              className="relative flex flex-col items-center text-center"
            >
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="relative z-10 mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30"
              >
                <Icon className="h-7 w-7" />
                <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold text-indigo-600 shadow">
                  {i + 1}
                </span>
              </motion.div>
              <h3 className="text-xl font-semibold">{step.title}</h3>
              <p className="mt-2 max-w-xs text-sm text-muted-foreground">{step.desc}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

export function CTASection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="mx-auto max-w-6xl px-6 pb-32 pt-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-12 text-center text-white shadow-2xl shadow-indigo-500/30"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -right-20 -top-20 h-60 w-60 rounded-full border border-white/10"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full border border-white/10"
        />

        <div className="relative z-10">
          <h2 className="text-3xl font-bold sm:text-4xl">Ready to build your first form?</h2>
          <p className="mx-auto mt-4 max-w-lg text-indigo-100">
            Join FormFlow — the smart form platform built for your MCA project.
          </p>
          <motion.a
            href="/admin/login"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-indigo-600 shadow-lg"
          >
            Get Started Free <Share2 className="h-4 w-4" />
          </motion.a>
        </div>
      </motion.div>
    </section>
  );
}
