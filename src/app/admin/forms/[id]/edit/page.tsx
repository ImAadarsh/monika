"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BarChart3, ExternalLink, Loader2, QrCode, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { FormBuilder } from "@/components/admin/form-builder";
import { AdminShell } from "@/components/admin/admin-shell";
import type { Form, FormField, FormSettings } from "@/types/form";
import { toast } from "sonner";

export default function EditFormPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [formId, setFormId] = useState("");
  const [form, setForm] = useState<Form | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState<FormField[]>([]);
  const [settings, setSettings] = useState<FormSettings>({});
  const [isPublished, setIsPublished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    params.then(({ id }) => {
      setFormId(id);
      fetch(`/api/forms/${id}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.form) {
            setForm(data.form);
            setTitle(data.form.title);
            setDescription(data.form.description);
            setFields(data.form.fields);
            setSettings(data.form.settings || {});
            setIsPublished(data.form.isPublished);
          }
        })
        .finally(() => setLoading(false));
    });
  }, [params]);

  async function save() {
    setSaving(true);
    try {
      const res = await fetch(`/api/forms/${formId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, fields, settings, isPublished }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setForm(data.form);
      toast.success("Form saved!");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <AdminShell>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminShell>
    );
  }

  if (!form) {
    return (
      <AdminShell>
        <p className="text-center py-20 text-muted-foreground">Form not found</p>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Edit Form</h1>
          <p className="text-sm text-muted-foreground">/{form.slug}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/admin/forms/${formId}/share`}>
            <Button variant="outline" size="sm"><QrCode className="h-4 w-4" /> Share</Button>
          </Link>
          <Link href={`/admin/forms/${formId}/analytics`}>
            <Button variant="outline" size="sm"><BarChart3 className="h-4 w-4" /> Analytics</Button>
          </Link>
          {isPublished && (
            <Link href={`/f/${form.slug}`} target="_blank">
              <Button variant="outline" size="sm"><ExternalLink className="h-4 w-4" /> Preview</Button>
            </Link>
          )}
          <Button onClick={save} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save
          </Button>
        </div>
      </div>

      <div className="mb-6 space-y-4 rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <Label className="text-base">Published</Label>
          <button
            type="button"
            onClick={() => setIsPublished(!isPublished)}
            className={`relative h-7 w-12 rounded-full transition-colors ${isPublished ? "bg-primary" : "bg-muted"}`}
          >
            <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform ${isPublished ? "left-5" : "left-0.5"}`} />
          </button>
        </div>
        <div>
          <Label>Form Title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1.5 text-lg font-medium" />
        </div>
        <div>
          <Label>Description</Label>
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1.5" rows={2} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Theme Color</Label>
            <div className="mt-1.5 flex gap-2">
              <input type="color" value={settings.themeColor || "#6366f1"} onChange={(e) => setSettings({ ...settings, themeColor: e.target.value })} className="h-10 w-14 cursor-pointer rounded-lg border" />
              <Input value={settings.themeColor || "#6366f1"} onChange={(e) => setSettings({ ...settings, themeColor: e.target.value })} />
            </div>
          </div>
          <div>
            <Label>Confirmation Message</Label>
            <Input value={settings.confirmationMessage || ""} onChange={(e) => setSettings({ ...settings, confirmationMessage: e.target.value })} className="mt-1.5" />
          </div>
        </div>
      </div>

      <FormBuilder fields={fields} onChange={setFields} />
    </AdminShell>
  );
}
