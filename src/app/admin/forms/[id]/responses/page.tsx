"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, Loader2, Search, Trash2 } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Submission } from "@/types/form";
import { format } from "date-fns";
import { toast } from "sonner";

export default function ResponsesPage({ params }: { params: Promise<{ id: string }> }) {
  const [formId, setFormId] = useState("");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selected, setSelected] = useState<Submission | null>(null);

  function load() {
    if (!formId) return;
    setLoading(true);
    const qs = new URLSearchParams();
    if (search) qs.set("search", search);
    if (from) qs.set("from", from);
    if (to) qs.set("to", to);
    fetch(`/api/forms/${formId}/submissions?${qs}`)
      .then((r) => r.json())
      .then((data) => {
        setSubmissions(data.submissions || []);
        setTotal(data.total || 0);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    params.then(({ id }) => setFormId(id));
  }, [params]);

  useEffect(() => { load(); }, [formId, search, from, to]);

  async function deleteSubmission(submissionId: string) {
    if (!confirm("Delete this response?")) return;
    const res = await fetch(`/api/forms/${formId}/submissions`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ submissionId }),
    });
    if (res.ok) {
      toast.success("Response deleted");
      setSelected(null);
      load();
    }
  }

  return (
    <AdminShell>
      <Link href={`/admin/forms/${formId}/edit`} className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to editor
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Responses</h1>
          <p className="text-muted-foreground">{total} total responses</p>
        </div>
        <div className="flex gap-2">
          <a href={`/api/forms/${formId}/export?format=csv`} download>
            <Button variant="outline" size="sm"><Download className="h-4 w-4" /> CSV</Button>
          </a>
          <a href={`/api/forms/${formId}/export?format=json`} download>
            <Button variant="outline" size="sm"><Download className="h-4 w-4" /> JSON</Button>
          </a>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="flex flex-wrap gap-3 p-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search responses..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8" />
          </div>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-auto" />
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-auto" />
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            {submissions.length === 0 ? (
              <p className="text-center py-12 text-muted-foreground">No responses yet</p>
            ) : submissions.map((sub) => (
              <button
                key={sub.id}
                type="button"
                onClick={() => setSelected(sub)}
                className={`w-full rounded-lg border p-4 text-left transition-colors hover:bg-accent ${selected?.id === sub.id ? "border-primary bg-primary/5" : "border-border"}`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{format(new Date(sub.submittedAt), "MMM d, yyyy · h:mm a")}</p>
                  {sub.completionTimeMs && (
                    <span className="text-xs text-muted-foreground">{Math.round(sub.completionTimeMs / 1000)}s</span>
                  )}
                </div>
                <p className="mt-1 truncate text-sm text-muted-foreground">
                  {sub.answers.slice(0, 2).map((a) => Array.isArray(a.value) ? a.value.join(", ") : a.value).join(" · ")}
                </p>
              </button>
            ))}
          </div>

          {selected && (
            <Card className="h-fit lg:sticky lg:top-24">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Response Detail</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => deleteSubmission(selected.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-muted-foreground">
                  {format(new Date(selected.submittedAt), "PPpp")}
                  {selected.completionTimeMs && ` · ${Math.round(selected.completionTimeMs / 1000)}s completion`}
                  {selected.referrer && ` · Ref: ${selected.referrer}`}
                </p>
                {selected.answers.map((a) => (
                  <div key={a.fieldId}>
                    <p className="text-xs font-medium text-muted-foreground">{a.fieldLabel}</p>
                    <p className="text-sm">{Array.isArray(a.value) ? a.value.join(", ") : a.value}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </AdminShell>
  );
}
