"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BarChart3, ExternalLink, EyeOff, Globe, Inbox, Loader2, QrCode, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { FormBuilder } from "@/components/admin/form-builder";
import { FormSettingsPanel, FormImportExport } from "@/components/admin/form-settings-panel";
import { AdminShell } from "@/components/admin/admin-shell";
import { useEditorDraft } from "@/hooks/use-form-draft";
import type { Form, FormField, FormSettings } from "@/types/form";
import { toast } from "sonner";

export default function EditFormPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [formId, setFormId] = useState("");
  const [form, setForm] = useState<Form | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [slug, setSlug] = useState("");
  const [fields, setFields] = useState<FormField[]>([]);
  const [settings, setSettings] = useState<FormSettings>({});
  const [isPublished, setIsPublished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"fields" | "settings">("fields");

  const editorState = { title, description, fields, settings, isPublished };
  useEditorDraft(formId, editorState);

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
            setSlug(data.form.slug);
            setFields(data.form.fields);
            setSettings(data.form.settings || {});
            setIsPublished(data.form.isPublished);
          }
        })
        .finally(() => setLoading(false));
    });
  }, [params]);

  async function save(overrides?: { isPublished?: boolean }) {
    const nextPublished = overrides?.isPublished ?? isPublished;
    setSaving(true);
    try {
      const res = await fetch(`/api/forms/${formId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, fields, settings, isPublished: nextPublished }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (slug !== form?.slug) {
        const slugRes = await fetch(`/api/forms/${formId}/slug`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug }),
        });
        if (!slugRes.ok) {
          const slugData = await slugRes.json();
          throw new Error(slugData.error || "Slug update failed");
        }
      }

      setForm(data.form);
      setIsPublished(nextPublished);
      if (overrides?.isPublished === true) {
        toast.success("Form published! It is now live at /f/" + slug);
      } else if (overrides?.isPublished === false) {
        toast.success("Form unpublished — it is no longer publicly accessible.");
      } else {
        toast.success("Form saved!");
      }
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
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold">Edit Form</h1>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                isPublished
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {isPublished ? "Published" : "Draft"}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            {isPublished ? (
              <>Live at /f/{slug}</>
            ) : (
              <>Not public yet — publish to make /f/{slug} accessible</>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/admin/forms/${formId}/responses`}>
            <Button variant="outline" size="sm"><Inbox className="h-4 w-4" /> Responses</Button>
          </Link>
          <Link href={`/admin/forms/${formId}/share`}>
            <Button variant="outline" size="sm"><QrCode className="h-4 w-4" /> Share</Button>
          </Link>
          <Link href={`/admin/forms/${formId}/analytics`}>
            <Button variant="outline" size="sm"><BarChart3 className="h-4 w-4" /> Analytics</Button>
          </Link>
          {isPublished && (
            <Link href={`/f/${slug}`} target="_blank">
              <Button variant="outline" size="sm"><ExternalLink className="h-4 w-4" /> Preview</Button>
            </Link>
          )}
          <Button variant="outline" onClick={() => save()} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save
          </Button>
          {isPublished ? (
            <Button variant="outline" onClick={() => save({ isPublished: false })} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <EyeOff className="h-4 w-4" />}
              Unpublish
            </Button>
          ) : (
            <Button onClick={() => save({ isPublished: true })} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
              Publish
            </Button>
          )}
        </div>
      </div>

      <div className="mb-6 flex gap-2 border-b border-border">
        {(["fields", "settings"] as const).map((tab) => (
          <button key={tab} type="button" onClick={() => setActiveTab(tab)} className={`px-4 py-2 text-sm font-medium capitalize ${activeTab === tab ? "border-b-2 border-primary text-primary" : "text-muted-foreground"}`}>
            {tab}
          </button>
        ))}
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
        <FormImportExport
          title={title}
          description={description}
          fields={fields}
          settings={settings}
          onImport={(data) => {
            if (data.title) setTitle(data.title);
            if (data.description) setDescription(data.description);
            if (data.fields) setFields(data.fields as FormField[]);
            if (data.settings) setSettings(data.settings);
            toast.success("Form imported!");
          }}
        />
      </div>

      {activeTab === "fields" ? (
        <FormBuilder fields={fields} onChange={setFields} allFields={fields} />
      ) : (
        <FormSettingsPanel settings={settings} onChange={setSettings} slug={slug} onSlugChange={setSlug} />
      )}
    </AdminShell>
  );
}
