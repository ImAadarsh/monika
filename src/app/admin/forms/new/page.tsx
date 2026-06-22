"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { FormBuilder } from "@/components/admin/form-builder";
import { AdminShell } from "@/components/admin/admin-shell";
import type { FormField, FormSettings } from "@/types/form";
import { toast } from "sonner";

export default function NewFormPage() {
  const router = useRouter();
  const [title, setTitle] = useState("Untitled Form");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState<FormField[]>([]);
  const [settings, setSettings] = useState<FormSettings>({
    themeColor: "#6366f1",
    confirmationMessage: "Thank you for your response!",
    showProgressBar: true,
  });
  const [saving, setSaving] = useState(false);

  async function save(publish = false) {
    setSaving(true);
    try {
      const res = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, fields, settings }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (publish) {
        await fetch(`/api/forms/${data.form.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isPublished: true }),
        });
      }

      toast.success(publish ? "Form published!" : "Form saved!");
      router.push(`/admin/forms/${data.form.id}/edit`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Create Form</h1>
          <p className="text-sm text-muted-foreground">Build your form with drag-and-drop fields</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => save(false)} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Draft
          </Button>
          <Button onClick={() => save(true)} disabled={saving}>
            Save & Publish
          </Button>
        </div>
      </div>

      <div className="mb-6 space-y-4 rounded-xl border border-border bg-card p-6">
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
              <input type="color" value={settings.themeColor} onChange={(e) => setSettings({ ...settings, themeColor: e.target.value })} className="h-10 w-14 cursor-pointer rounded-lg border" />
              <Input value={settings.themeColor} onChange={(e) => setSettings({ ...settings, themeColor: e.target.value })} />
            </div>
          </div>
          <div>
            <Label>Confirmation Message</Label>
            <Input value={settings.confirmationMessage} onChange={(e) => setSettings({ ...settings, confirmationMessage: e.target.value })} className="mt-1.5" />
          </div>
        </div>
      </div>

      <FormBuilder fields={fields} onChange={setFields} />
    </AdminShell>
  );
}
