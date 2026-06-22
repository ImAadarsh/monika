"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, Calendar, GraduationCap, Loader2, Mail, Newspaper, Star } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { templateToFields, type FormTemplate } from "@/lib/form-templates";
import { toast } from "sonner";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Mail, Star, Calendar, Briefcase, GraduationCap, Newspaper,
};

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/forms/templates")
      .then((r) => r.json())
      .then((data) => setTemplates(data.templates || []))
      .finally(() => setLoading(false));
  }, []);

  async function useTemplate(template: FormTemplate) {
    setCreating(template.id);
    try {
      const res = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: template.name,
          description: template.description,
          settings: template.settings,
          fields: templateToFields(template),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("Form created from template!");
      router.push(`/admin/forms/${data.form.id}/edit`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed");
    } finally {
      setCreating(null);
    }
  }

  return (
    <AdminShell>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Form Templates</h1>
        <p className="text-muted-foreground">Start with a pre-built template</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((t) => {
            const Icon = ICONS[t.icon] || Mail;
            return (
              <Card key={t.id} className="transition-all hover:shadow-md hover:border-primary/20">
                <CardContent className="p-6">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">{t.category}</span>
                  <h3 className="font-semibold">{t.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{t.description}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{t.fields.length} fields</p>
                  <Button className="mt-4 w-full" size="sm" disabled={creating === t.id} onClick={() => useTemplate(t)}>
                    {creating === t.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Use Template"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </AdminShell>
  );
}
