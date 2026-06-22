import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  QrCode,
  Sparkles,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen gradient-bg grid-pattern">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2 font-semibold text-lg">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </div>
          FormFlow
        </div>
        <Link href="/admin/login">
          <Button variant="outline">Admin Login</Button>
        </Link>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-20 pt-12">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary">
            <Zap className="h-4 w-4" /> Next-gen form platform
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            Build forms.{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Share instantly.
            </span>{" "}
            Analyze everything.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Create Google Forms-style surveys with a stunning builder, auto-generated QR codes,
            shareable links, and a comprehensive analytics dashboard.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/admin/login">
              <Button size="lg" className="gap-2">
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-24 grid gap-6 sm:grid-cols-3">
          {[
            {
              icon: Sparkles,
              title: "Form Builder",
              desc: "Text, dropdowns, checkboxes, ratings, scales — every field type you need.",
            },
            {
              icon: QrCode,
              title: "QR & Links",
              desc: "Every form gets a unique link and scannable QR code for instant sharing.",
            },
            {
              icon: BarChart3,
              title: "Deep Analytics",
              desc: "Timeline charts, field breakdowns, device stats, and live submissions.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group rounded-2xl border border-border bg-card p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg hover:border-primary/20"
            >
              <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
