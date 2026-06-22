"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, ChevronLeft, ChevronRight, Clock, Loader2, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea, Select } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Form, FormField } from "@/types/form";
import { validateAnswers } from "@/lib/form-validation";
import { getFormPages, getVisibleFields, isFieldVisible } from "@/lib/conditional-logic";
import { useFormDraft } from "@/hooks/use-form-draft";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function FieldRenderer({
  field,
  value,
  onChange,
  error,
  themeColor,
}: {
  field: FormField;
  value: string | string[];
  onChange: (val: string | string[]) => void;
  error?: string;
  themeColor: string;
}) {
  const strVal = typeof value === "string" ? value : "";
  const options = field.settings?.randomizeOptions && field.options
    ? shuffle(field.options)
    : field.options;

  switch (field.type) {
    case "heading":
      return <h3 className="text-xl font-bold">{field.label}</h3>;
    case "paragraph":
      return <p className="text-muted-foreground whitespace-pre-wrap">{field.label}</p>;
    case "long_text":
      return (
        <div>
          <Textarea value={strVal} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} aria-invalid={!!error} aria-describedby={error ? `${field.id}-err` : undefined} maxLength={field.settings?.maxLength} />
          {field.settings?.maxLength && (
            <p className="mt-1 text-xs text-muted-foreground">{strVal.length}/{field.settings.maxLength}</p>
          )}
        </div>
      );
    case "single_choice":
      return (
        <div className="space-y-2" role="radiogroup" aria-label={field.label}>
          {options?.map((opt) => (
            <label key={opt.id} className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-accent has-[:checked]:border-primary has-[:checked]:bg-primary/5">
              <input type="radio" name={field.id} value={opt.label} checked={strVal === opt.label} onChange={() => onChange(opt.label)} className="text-primary" />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      );
    case "multiple_choice":
      return (
        <div className="space-y-2">
          {options?.map((opt) => {
            const arr = Array.isArray(value) ? value : [];
            return (
              <label key={opt.id} className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-accent has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                <input type="checkbox" checked={arr.includes(opt.label)} onChange={(e) => {
                  if (e.target.checked) onChange([...arr, opt.label]);
                  else onChange(arr.filter((v) => v !== opt.label));
                }} className="rounded text-primary" />
                <span>{opt.label}</span>
              </label>
            );
          })}
        </div>
      );
    case "dropdown":
      return (
        <Select value={strVal} onChange={(e) => onChange(e.target.value)}>
          <option value="">Select an option</option>
          {options?.map((opt) => <option key={opt.id} value={opt.label}>{opt.label}</option>)}
        </Select>
      );
    case "checkbox":
      return (
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={strVal === "yes"} onChange={(e) => onChange(e.target.checked ? "yes" : "no")} className="rounded" />
          <span>Yes</span>
        </label>
      );
    case "nps": {
      return (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground"><span>Not likely</span><span>Very likely</span></div>
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: 11 }, (_, i) => i).map((n) => (
              <button key={n} type="button" onClick={() => onChange(String(n))} aria-label={`Score ${n}`} className={`h-9 min-w-[2.25rem] rounded-lg border text-sm font-medium transition-all ${strVal === String(n) ? "border-primary text-primary-foreground" : "border-border hover:border-primary/50"}`} style={strVal === String(n) ? { background: themeColor, borderColor: themeColor } : undefined}>{n}</button>
            ))}
          </div>
        </div>
      );
    }
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
              <button key={n} type="button" onClick={() => onChange(String(n))} className={`h-10 w-10 rounded-lg border text-sm font-medium transition-all ${strVal === String(n) ? "text-primary-foreground" : "border-border hover:border-primary/50"}`} style={strVal === String(n) ? { background: themeColor, borderColor: themeColor } : undefined}>{n}</button>
            ))}
          </div>
        </div>
      );
    }
    case "rating": {
      const max = field.settings?.maxRating ?? 5;
      return (
        <div className="flex gap-1" role="group" aria-label={`Rating out of ${max}`}>
          {Array.from({ length: max }, (_, i) => i + 1).map((n) => (
            <button key={n} type="button" onClick={() => onChange(String(n))} aria-label={`${n} stars`} className={`text-2xl transition-transform hover:scale-110 ${Number(strVal) >= n ? "text-amber-400" : "text-muted-foreground/30"}`}>★</button>
          ))}
        </div>
      );
    }
    case "file_upload":
      return (
        <Input type="file" accept={field.settings?.accept} onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const maxMb = field.settings?.maxFileSizeMB ?? 5;
          if (file.size > maxMb * 1024 * 1024) {
            alert(`File must be under ${maxMb}MB`);
            return;
          }
          const reader = new FileReader();
          reader.onload = () => onChange(reader.result as string);
          reader.readAsDataURL(file);
        }} />
      );
    case "url":
      return <Input type="url" value={strVal} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder || "https://"} />;
    case "date":
      return <Input type="date" value={strVal} onChange={(e) => onChange(e.target.value)} />;
    case "time":
      return <Input type="time" value={strVal} onChange={(e) => onChange(e.target.value)} />;
    case "number":
      return <Input type="number" value={strVal} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} min={field.settings?.min} max={field.settings?.max} />;
    case "email":
      return <Input type="email" value={strVal} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} autoComplete="email" />;
    case "phone":
      return <Input type="tel" value={strVal} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} autoComplete="tel" />;
    default:
      return (
        <div>
          <Input value={strVal} onChange={(e) => onChange(e.target.value)} placeholder={field.placeholder} maxLength={field.settings?.maxLength} />
          {field.settings?.maxLength && <p className="mt-1 text-xs text-muted-foreground">{strVal.length}/{field.settings.maxLength}</p>}
        </div>
      );
  }
}

export function PublicFormView({ form }: { form: Form }) {
  const startTime = useRef(Date.now());
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(!(form.settings as { hasPassword?: boolean }).hasPassword);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [showDraftBanner, setShowDraftBanner] = useState(false);
  const { loadDraft, clearDraft } = useFormDraft(form.id, answers, !submitted);

  const themeColor = form.settings.themeColor || "#6366f1";
  const settings = form.settings;

  useEffect(() => {
    const defaults: Record<string, string | string[]> = {};
    for (const f of form.fields) {
      if (f.settings?.defaultValue) defaults[f.id] = f.settings.defaultValue;
    }
    const draft = loadDraft();
    if (draft?.data && typeof draft.data === "object") {
      setShowDraftBanner(true);
    } else if (Object.keys(defaults).length) {
      setAnswers(defaults);
    }
  }, [form.id, form.fields, loadDraft]);

  useEffect(() => {
    if (settings.enableDarkMode) {
      document.documentElement.classList.toggle("dark", darkMode);
    }
  }, [darkMode, settings.enableDarkMode]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && !submitting) {
        e.preventDefault();
        handleSubmit(e as unknown as React.FormEvent);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  const visibleFields = useMemo(() => getVisibleFields(form.fields, answers), [form.fields, answers]);
  const pages = useMemo(() => getFormPages(form.fields.filter((f) => isFieldVisible(f, answers))), [form.fields, answers]);
  const currentPageFields = pages[page] || [];
  const inputFields = visibleFields.filter((f) => !["heading", "paragraph", "page_break"].includes(f.type));
  const totalSteps = settings.oneQuestionAtATime ? inputFields.length : pages.length;
  const currentStep = settings.oneQuestionAtATime ? questionIdx + 1 : page + 1;
  const progress = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 100;
  const estimatedMinutes = Math.max(1, Math.ceil(inputFields.length * 0.5));

  const restoreDraft = () => {
    const draft = loadDraft();
    if (draft?.data && typeof draft.data === "object") {
      setAnswers(draft.data as Record<string, string | string[]>);
      setShowDraftBanner(false);
    }
  };

  const validateCurrent = useCallback(() => {
    const toValidate = settings.oneQuestionAtATime
      ? [inputFields[questionIdx]].filter(Boolean)
      : currentPageFields.filter((f) => !["heading", "paragraph", "page_break"].includes(f.type));
    const visibleIds = new Set(getVisibleFields(form.fields, answers).map((f) => f.id));
    const errs = validateAnswers(toValidate, answers, visibleIds);
    const map: Record<string, string> = {};
    errs.forEach((e) => { map[e.fieldId] = e.message; });
    setErrors(map);
    return errs.length === 0;
  }, [answers, currentPageFields, form.fields, inputFields, questionIdx, settings.oneQuestionAtATime]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateCurrent()) return;
    if (settings.requireConfirmation && !confirmOpen) {
      setConfirmOpen(true);
      return;
    }
    setConfirmOpen(false);
    setSubmitting(true);
    setError("");
    try {
      const storageKey = `formflow-submitted-${form.slug}`;
      if (!settings.allowMultipleSubmissions && localStorage.getItem(storageKey)) {
        throw new Error("You have already submitted this form");
      }
      const res = await fetch(`/api/forms/public/${form.slug}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers,
          completionTimeMs: Date.now() - startTime.current,
          referrer: document.referrer,
          _hp: honeypot,
          password: password || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");
      localStorage.setItem(storageKey, Date.now().toString());
      clearDraft();
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
        return;
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  function nextStep() {
    if (!validateCurrent()) return;
    if (settings.oneQuestionAtATime) {
      if (questionIdx < inputFields.length - 1) setQuestionIdx((i) => i + 1);
    } else if (page < pages.length - 1) {
      setPage((p) => p + 1);
    }
  }

  function prevStep() {
    if (settings.oneQuestionAtATime) {
      if (questionIdx > 0) setQuestionIdx((i) => i - 1);
    } else if (page > 0) {
      setPage((p) => p - 1);
    }
  }

  const isLastStep = settings.oneQuestionAtATime
    ? questionIdx >= inputFields.length - 1
    : page >= pages.length - 1;

  const fieldsToRender = settings.oneQuestionAtATime
    ? form.fields.filter((f) => f.id === inputFields[questionIdx]?.id || (f.type === "heading" && f.orderIndex < (inputFields[questionIdx]?.orderIndex ?? 0)))
    : currentPageFields;

  const displayFields = settings.oneQuestionAtATime
    ? [inputFields[questionIdx]].filter(Boolean)
    : currentPageFields;

  if (!unlocked) {
    return (
      <div className="mx-auto max-w-md">
        <Card>
          <CardHeader><CardTitle>Password Required</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter form password" onKeyDown={(e) => e.key === "Enter" && setUnlocked(true)} />
            <Button className="w-full" style={{ background: themeColor }} onClick={() => setUnlocked(true)}>Unlock Form</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mx-auto max-w-lg text-center print:block">
        <div className="rounded-2xl border border-border bg-card p-10 shadow-lg">
          <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-500" />
          <h2 className="mt-4 text-2xl font-bold">Thank you!</h2>
          <p className="mt-2 text-muted-foreground">{settings.confirmationMessage || "Your response has been recorded."}</p>
        </div>
      </motion.div>
    );
  }

  const fontFamily = settings.fontFamily || "system-ui, sans-serif";
  const bgColor = settings.backgroundColor;

  return (
    <form onSubmit={handleSubmit} className={`mx-auto max-w-2xl space-y-4 print:shadow-none ${settings.customCssClass || ""}`} style={{ fontFamily }} aria-label={form.title}>
      {settings.enableHoneypot && (
        <input type="text" name="_hp" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} className="absolute -left-[9999px]" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      )}

      {showDraftBanner && (
        <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
          <span>You have a saved draft</span>
          <Button type="button" size="sm" variant="outline" onClick={restoreDraft}>Resume</Button>
        </div>
      )}

      <Card className="overflow-hidden border-0 shadow-xl print:border print:shadow-none" style={bgColor ? { background: bgColor } : undefined}>
        <div className="h-2" style={{ background: themeColor }} />
        {settings.logoUrl && (
          <div className="px-6 pt-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={settings.logoUrl} alt="Logo" className="h-12 object-contain" />
          </div>
        )}
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-2xl sm:text-3xl">{form.title}</CardTitle>
              {form.description && <p className="text-muted-foreground">{form.description}</p>}
            </div>
            {settings.enableDarkMode && (
              <Button type="button" variant="ghost" size="icon" onClick={() => setDarkMode(!darkMode)} aria-label="Toggle dark mode">
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            )}
          </div>
          {settings.showEstimatedTime && (
            <p className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3 w-3" /> ~{estimatedMinutes} min to complete</p>
          )}
        </CardHeader>

        {settings.showProgressBar && totalSteps > 1 && (
          <div className="px-6 pb-2">
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full transition-all duration-300" style={{ width: `${progress}%`, background: themeColor }} />
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Step {currentStep} of {totalSteps}</p>
          </div>
        )}

        <CardContent className="space-y-6">
          <AnimatePresence mode="wait">
            <motion.div key={settings.oneQuestionAtATime ? questionIdx : page} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              {(settings.oneQuestionAtATime ? displayFields : fieldsToRender).map((field, i) => {
                if (!field || !isFieldVisible(field, answers)) return null;
                if (field.type === "page_break") return null;
                const isInput = !["heading", "paragraph"].includes(field.type);
                return (
                  <div key={field.id} className={`space-y-2 ${field.settings?.width === "half" ? "sm:w-1/2" : ""}`}>
                    {isInput && (
                      <Label htmlFor={field.id}>
                        {field.label}
                        {field.required && <span className="ml-1 text-destructive" aria-hidden="true">*</span>}
                      </Label>
                    )}
                    {field.settings?.helpText && <p className="text-xs text-muted-foreground">{field.settings.helpText}</p>}
                    <FieldRenderer
                      field={field}
                      value={answers[field.id] ?? (field.type === "multiple_choice" ? [] : "")}
                      onChange={(val) => { setAnswers((prev) => ({ ...prev, [field.id]: val })); setErrors((prev) => { const n = { ...prev }; delete n[field.id]; return n; }); }}
                      error={errors[field.id]}
                      themeColor={themeColor}
                    />
                    {errors[field.id] && <p id={`${field.id}-err`} className="text-sm text-destructive animate-pulse" role="alert">{errors[field.id]}</p>}
                  </div>
                );
              })}
            </motion.div>
          </AnimatePresence>

          {error && <p className="text-sm text-destructive" role="alert">{error}</p>}

          {confirmOpen && (
            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <p className="text-sm font-medium">Ready to submit your responses?</p>
              <div className="mt-3 flex gap-2">
                <Button type="submit" disabled={submitting} style={{ background: themeColor }}>{submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Submit"}</Button>
                <Button type="button" variant="outline" onClick={() => setConfirmOpen(false)}>Go back</Button>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            {(settings.oneQuestionAtATime ? questionIdx > 0 : page > 0) && (
              <Button type="button" variant="outline" onClick={prevStep}><ChevronLeft className="h-4 w-4" /> Back</Button>
            )}
            {!isLastStep ? (
              <Button type="button" className="ml-auto" onClick={nextStep} style={{ background: themeColor }}>
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            ) : !confirmOpen && (
              <Button type="submit" disabled={submitting} className="flex-1" size="lg" style={{ background: themeColor }}>
                {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</> : (settings.submitButtonText || "Submit")}
              </Button>
            )}
          </div>
          <p className="text-center text-xs text-muted-foreground">Press Ctrl+Enter to submit</p>
        </CardContent>
      </Card>

      {!settings.hideBranding && (
        <p className="text-center text-xs text-muted-foreground print:hidden">Powered by FormFlow</p>
      )}
    </form>
  );
}
