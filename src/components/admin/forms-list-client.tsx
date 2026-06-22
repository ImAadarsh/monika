"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BarChart3, Copy, Edit, ExternalLink, Inbox, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DeleteFormButton } from "@/components/admin/delete-form-button";
import { DuplicateFormButton } from "@/components/admin/duplicate-form-button";
import type { FormListItem } from "@/types/form";
import { formatDistanceToNow } from "date-fns";

type SortKey = "updated" | "title" | "responses";
type FilterKey = "all" | "published" | "draft";

export function FormsListClient({ forms }: { forms: FormListItem[] }) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("updated");
  const [filter, setFilter] = useState<FilterKey>("all");

  const filtered = useMemo(() => {
    let list = [...forms];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((f) => f.title.toLowerCase().includes(q) || f.description.toLowerCase().includes(q));
    }
    if (filter === "published") list = list.filter((f) => f.isPublished);
    if (filter === "draft") list = list.filter((f) => !f.isPublished);
    list.sort((a, b) => {
      if (sort === "title") return a.title.localeCompare(b.title);
      if (sort === "responses") return b.submissionCount - a.submissionCount;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
    return list;
  }, [forms, search, sort, filter]);

  return (
    <>
      <div className="mb-6 flex flex-wrap gap-3">
        <Input placeholder="Search forms..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
        <select className="rounded-lg border px-3 py-2 text-sm" value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
          <option value="updated">Sort: Recently updated</option>
          <option value="title">Sort: Title A-Z</option>
          <option value="responses">Sort: Most responses</option>
        </select>
        <select className="rounded-lg border px-3 py-2 text-sm" value={filter} onChange={(e) => setFilter(e.target.value as FilterKey)}>
          <option value="all">All forms</option>
          <option value="published">Published only</option>
          <option value="draft">Drafts only</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center text-muted-foreground">No forms match your filters</CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((form) => (
            <Card key={form.id} className="group transition-all hover:shadow-md hover:border-primary/20">
              <CardContent className="p-6">
                <div className="mb-3 flex items-start justify-between">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${form.isPublished ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"}`}>
                    {form.isPublished ? "Live" : "Draft"}
                  </span>
                  <div className="flex gap-1">
                    <DuplicateFormButton formId={form.id} />
                    <DeleteFormButton formId={form.id} />
                  </div>
                </div>
                <h3 className="font-semibold line-clamp-2">{form.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{form.description || "No description"}</p>
                <p className="mt-3 text-xs text-muted-foreground">
                  {form.submissionCount} responses · Updated {formatDistanceToNow(new Date(form.updatedAt), { addSuffix: true })}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link href={`/admin/forms/${form.id}/edit`}><Button variant="outline" size="sm"><Edit className="h-3.5 w-3.5" /> Edit</Button></Link>
                  <Link href={`/admin/forms/${form.id}/responses`}><Button variant="outline" size="sm"><Inbox className="h-3.5 w-3.5" /> Responses</Button></Link>
                  <Link href={`/admin/forms/${form.id}/share`}><Button variant="outline" size="sm"><QrCode className="h-3.5 w-3.5" /> Share</Button></Link>
                  <Link href={`/admin/forms/${form.id}/analytics`}><Button variant="outline" size="sm"><BarChart3 className="h-3.5 w-3.5" /> Analytics</Button></Link>
                  {form.isPublished && (
                    <Link href={`/f/${form.slug}`} target="_blank"><Button variant="ghost" size="sm"><ExternalLink className="h-3.5 w-3.5" /></Button></Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
