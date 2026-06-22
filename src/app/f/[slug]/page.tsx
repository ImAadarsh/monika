"use client";

import { useEffect, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { PublicFormView } from "@/components/forms/public-form-view";
import type { Form } from "@/types/form";

export default function PublicFormPage({ params }: { params: Promise<{ slug: string }> }) {
  const [form, setForm] = useState<Form | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then(({ slug }) => {
      fetch(`/api/forms/public/${slug}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.form) setForm(data.form);
          else setError("This form is not available.");
        })
        .catch(() => setError("Failed to load form"))
        .finally(() => setLoading(false));
    });
  }, [params]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center gradient-bg">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gradient-bg px-4 text-center">
        <Sparkles className="mb-4 h-12 w-12 text-muted-foreground" />
        <h1 className="text-xl font-semibold">{error || "Form not found"}</h1>
        <p className="mt-2 text-muted-foreground">The form may have been removed or is not published yet.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-bg grid-pattern py-12 px-4">
      <PublicFormView form={form} />
      <p className="mt-8 text-center text-xs text-muted-foreground">
        Powered by FormFlow
      </p>
    </div>
  );
}
