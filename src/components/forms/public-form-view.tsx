"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea, Select } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Form, FormField } from "@/types/form";

function FieldRenderer({
  field,
  value,
  onChange,
}: {
  field: FormField;
  value: string | string[];
  onChange: (val: string | string[]) => void;
}) {
  const strVal = typeof value === "string" ? value : "";

  switch (field.type) {
    case "long_text":
      return (
        <Textarea
          value={strVal}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          required={field.required}
        />
      );
    case "single_choice":
      return (
        <div className="space-y-2">
          {field.options?.map((opt) => (
            <label key={opt.id} className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-accent has-[:checked]:border-primary has-[:checked]:bg-primary/5">
              <input
                type="radio"
                name={field.id}
                value={opt.label}
                checked={strVal === opt.label}
                onChange={() => onChange(opt.label)}
                required={field.required}
                className="text-primary"
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      );
    case "multiple_choice":
      return (
        <div className="space-y-2">
          {field.options?.map((opt) => {
            const arr = Array.isArray(value) ? value : [];
            return (
              <label key={opt.id} className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-accent has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                <input
                  type="checkbox"
                  checked={arr.includes(opt.label)}
                  onChange={(e) => {
                    if (e.target.checked) onChange([...arr, opt.label]);
                    else onChange(arr.filter((v) => v !== opt.label));
                  }}
                  className="rounded text-primary"
                />
                <span>{opt.label}</span>
              </label>
            );
          })}
        </div>
      );
    case "dropdown":
      return (
        <Select
          value={strVal}
          onChange={(e) => onChange(e.target.value)}
          required={field.required}
        >
          <option value="">Select an option</option>
          {field.options?.map((opt) => (
            <option key={opt.id} value={opt.label}>{opt.label}</option>
          ))}
        </Select>
      );
    case "checkbox":
      return (
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={strVal === "yes"}
            onChange={(e) => onChange(e.target.checked ? "yes" : "no")}
            className="rounded"
          />
          <span>Yes</span>
        </label>
      );
    case "scale": {
      const min = field.settings?.min ?? 1;
      const max = field.settings?.max ?? 5;
      return (
        <div className="space-y-3">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{field.settings?.minLabel || min}</span>
            <span>{field.settings?.maxLabel || max}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: max - min + 1 }, (_, i) => min + i).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => onChange(String(n))}
                className={`h-10 w-10 rounded-lg border text-sm font-medium transition-all ${
                  strVal === String(n)
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      );
    }
    case "rating": {
      const max = field.settings?.maxRating ?? 5;
      return (
        <div className="flex gap-1">
          {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange(String(n))}
              className={`text-2xl transition-transform hover:scale-110 ${
                Number(strVal) >= n ? "text-amber-400" : "text-muted-foreground/30"
              }`}
            >
              ★
            </button>
          ))}
        </div>
      );
    }
    case "date":
      return <Input type="date" value={strVal} onChange={(e) => onChange(e.target.value)} required={field.required} />;
    case "time":
      return <Input type="time" value={strVal} onChange={(e) => onChange(e.target.value)} required={field.required} />;
    case "number":
      return <Input type="number" value={strVal} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} required={field.required} />;
    case "email":
      return <Input type="email" value={strVal} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} required={field.required} />;
    case "phone":
      return <Input type="tel" value={strVal} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} required={field.required} />;
    default:
      return <Input value={strVal} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} required={field.required} />;
  }
}

export function PublicFormView({ form }: { form: Form }) {
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/forms/public/${form.slug}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mx-auto max-w-lg text-center"
      >
        <div className="rounded-2xl border border-border bg-card p-10 shadow-lg">
          <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-500" />
          <h2 className="mt-4 text-2xl font-bold">Thank you!</h2>
          <p className="mt-2 text-muted-foreground">
            {form.settings.confirmationMessage || "Your response has been recorded."}
          </p>
        </div>
      </motion.div>
    );
  }

  const themeColor = form.settings.themeColor || "#6366f1";

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-6">
      <Card className="overflow-hidden border-0 shadow-xl">
        <div className="h-2" style={{ background: themeColor }} />
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl sm:text-3xl">{form.title}</CardTitle>
          {form.description && (
            <p className="text-muted-foreground">{form.description}</p>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {form.fields.map((field, i) => (
            <motion.div
              key={field.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="space-y-2"
            >
              <Label>
                {field.label}
                {field.required && <span className="ml-1 text-destructive">*</span>}
              </Label>
              <FieldRenderer
                field={field}
                value={answers[field.id] ?? (field.type === "multiple_choice" ? [] : "")}
                onChange={(val) => setAnswers((prev) => ({ ...prev, [field.id]: val }))}
              />
            </motion.div>
          ))}
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button
            type="submit"
            disabled={submitting}
            className="w-full"
            size="lg"
            style={{ background: themeColor }}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
              </>
            ) : (
              "Submit"
            )}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
