"use client";

import { Input, Label, Textarea } from "@/components/ui/input";
import type { FormSettings } from "@/types/form";
import { FONT_PRESETS, THEME_PRESETS } from "@/types/form";

export function FormSettingsPanel({
  settings,
  onChange,
  slug,
  onSlugChange,
}: {
  settings: FormSettings;
  onChange: (s: FormSettings) => void;
  slug?: string;
  onSlugChange?: (slug: string) => void;
}) {
  const set = (key: keyof FormSettings, value: unknown) => onChange({ ...settings, [key]: value });

  return (
    <div className="space-y-6 rounded-xl border border-border bg-card p-6">
      <h3 className="font-semibold">Form Settings</h3>

      {slug !== undefined && onSlugChange && (
        <div>
          <Label>Custom URL slug</Label>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="text-sm text-muted-foreground">/f/</span>
            <Input value={slug} onChange={(e) => onSlugChange(e.target.value)} className="font-mono" />
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Theme color</Label>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {THEME_PRESETS.map((p) => (
              <button key={p.color} type="button" title={p.name} onClick={() => set("themeColor", p.color)} className="h-8 w-8 rounded-full border-2 transition-transform hover:scale-110" style={{ background: p.color, borderColor: settings.themeColor === p.color ? "#000" : "transparent" }} />
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            <input type="color" value={settings.themeColor || "#6366f1"} onChange={(e) => set("themeColor", e.target.value)} className="h-10 w-14 cursor-pointer rounded-lg border" />
            <Input value={settings.themeColor || "#6366f1"} onChange={(e) => set("themeColor", e.target.value)} />
          </div>
        </div>
        <div>
          <Label>Background color</Label>
          <Input type="color" value={settings.backgroundColor || "#ffffff"} onChange={(e) => set("backgroundColor", e.target.value)} className="mt-1.5 h-10 w-full cursor-pointer" />
        </div>
      </div>

      <div>
        <Label>Font family</Label>
        <select className="mt-1.5 flex h-10 w-full rounded-lg border border-input bg-card px-3 py-2 text-sm" value={settings.fontFamily || ""} onChange={(e) => set("fontFamily", e.target.value)}>
          <option value="">Default</option>
          {FONT_PRESETS.map((f) => <option key={f.value} value={f.value}>{f.name}</option>)}
        </select>
      </div>

      <div>
        <Label>Logo URL</Label>
        <Input value={settings.logoUrl || ""} onChange={(e) => set("logoUrl", e.target.value)} className="mt-1.5" placeholder="https://..." />
      </div>

      <div>
        <Label>Submit button text</Label>
        <Input value={settings.submitButtonText || ""} onChange={(e) => set("submitButtonText", e.target.value)} className="mt-1.5" placeholder="Submit" />
      </div>

      <div>
        <Label>Confirmation message</Label>
        <Input value={settings.confirmationMessage || ""} onChange={(e) => set("confirmationMessage", e.target.value)} className="mt-1.5" />
      </div>

      <div>
        <Label>Redirect URL after submit</Label>
        <Input value={settings.redirectUrl || ""} onChange={(e) => set("redirectUrl", e.target.value)} className="mt-1.5" placeholder="https://..." />
      </div>

      <div>
        <Label>Form password</Label>
        <Input type="password" value={settings.password || ""} onChange={(e) => set("password", e.target.value)} className="mt-1.5" placeholder="Leave empty for public access" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Open date</Label>
          <Input type="datetime-local" value={settings.openDate?.slice(0, 16) || ""} onChange={(e) => set("openDate", e.target.value ? new Date(e.target.value).toISOString() : undefined)} className="mt-1.5" />
        </div>
        <div>
          <Label>Close date</Label>
          <Input type="datetime-local" value={settings.closeDate?.slice(0, 16) || ""} onChange={(e) => set("closeDate", e.target.value ? new Date(e.target.value).toISOString() : undefined)} className="mt-1.5" />
        </div>
      </div>

      <div>
        <Label>Max submissions</Label>
        <Input type="number" min={1} value={settings.maxSubmissions ?? ""} onChange={(e) => set("maxSubmissions", e.target.value ? Number(e.target.value) : undefined)} className="mt-1.5 w-32" />
      </div>

      <div>
        <Label>Webhook URL</Label>
        <Input value={settings.webhookUrl || ""} onChange={(e) => set("webhookUrl", e.target.value)} className="mt-1.5" placeholder="https://your-server.com/webhook" />
      </div>

      <div>
        <Label>Notification email</Label>
        <Input type="email" value={settings.notifyEmail || ""} onChange={(e) => set("notifyEmail", e.target.value)} className="mt-1.5" placeholder="admin@example.com" />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div><Label>UTM Source</Label><Input value={settings.utmSource || ""} onChange={(e) => set("utmSource", e.target.value)} className="mt-1.5" /></div>
        <div><Label>UTM Medium</Label><Input value={settings.utmMedium || ""} onChange={(e) => set("utmMedium", e.target.value)} className="mt-1.5" /></div>
        <div><Label>UTM Campaign</Label><Input value={settings.utmCampaign || ""} onChange={(e) => set("utmCampaign", e.target.value)} className="mt-1.5" /></div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {[
          ["showProgressBar", "Show progress bar"],
          ["oneQuestionAtATime", "One question at a time"],
          ["showEstimatedTime", "Show estimated time"],
          ["allowMultipleSubmissions", "Allow multiple submissions"],
          ["requireConfirmation", "Confirm before submit"],
          ["enableHoneypot", "Spam honeypot"],
          ["enableDarkMode", "Dark mode toggle"],
          ["hideBranding", "Hide FormFlow branding"],
        ].map(([key, label]) => (
          <label key={key} className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={Boolean(settings[key as keyof FormSettings])} onChange={(e) => set(key as keyof FormSettings, e.target.checked)} className="rounded" />
            {label}
          </label>
        ))}
      </div>
    </div>
  );
}

export function FormImportExport({
  fields,
  settings,
  title,
  description,
  onImport,
}: {
  fields: unknown[];
  settings: FormSettings;
  title: string;
  description: string;
  onImport: (data: { title?: string; description?: string; fields?: unknown[]; settings?: FormSettings }) => void;
}) {
  function exportJson() {
    const blob = new Blob([JSON.stringify({ title, description, fields, settings }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${title.replace(/\s+/g, "-").toLowerCase()}.json`;
    a.click();
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={exportJson} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-accent">Export JSON</button>
      <label className="cursor-pointer rounded-lg border px-3 py-1.5 text-sm hover:bg-accent">
        Import JSON
        <input type="file" accept=".json" className="hidden" onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = () => {
            try {
              const data = JSON.parse(reader.result as string);
              onImport(data);
            } catch {
              alert("Invalid JSON file");
            }
          };
          reader.readAsText(file);
        }} />
      </label>
    </div>
  );
}
