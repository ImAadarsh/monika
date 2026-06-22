import { redirect } from "next/navigation";
import Link from "next/link";
import { BarChart3, Edit, ExternalLink, Plus, QrCode, Trash2 } from "lucide-react";
import { getSession } from "@/lib/auth";
import { listForms } from "@/lib/forms";
import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { DeleteFormButton } from "@/components/admin/delete-form-button";

export default async function FormsListPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const forms = await listForms();

  return (
    <AdminShell>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Forms</h1>
          <p className="text-muted-foreground">{forms.length} form{forms.length !== 1 && "s"}</p>
        </div>
        <Link href="/admin/forms/new">
          <Button><Plus className="h-4 w-4" /> New Form</Button>
        </Link>
      </div>

      {forms.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center py-16">
            <p className="text-muted-foreground">No forms created yet</p>
            <Link href="/admin/forms/new">
              <Button className="mt-4">Create your first form</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {forms.map((form) => (
            <Card key={form.id} className="group transition-all hover:shadow-md hover:border-primary/20">
              <CardContent className="p-6">
                <div className="mb-3 flex items-start justify-between">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    form.isPublished ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"
                  }`}>
                    {form.isPublished ? "Live" : "Draft"}
                  </span>
                  <DeleteFormButton formId={form.id} />
                </div>
                <h3 className="font-semibold line-clamp-2">{form.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {form.description || "No description"}
                </p>
                <p className="mt-3 text-xs text-muted-foreground">
                  {form.submissionCount} responses · Updated {formatDistanceToNow(new Date(form.updatedAt), { addSuffix: true })}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link href={`/admin/forms/${form.id}/edit`}>
                    <Button variant="outline" size="sm"><Edit className="h-3.5 w-3.5" /> Edit</Button>
                  </Link>
                  <Link href={`/admin/forms/${form.id}/share`}>
                    <Button variant="outline" size="sm"><QrCode className="h-3.5 w-3.5" /> Share</Button>
                  </Link>
                  <Link href={`/admin/forms/${form.id}/analytics`}>
                    <Button variant="outline" size="sm"><BarChart3 className="h-3.5 w-3.5" /> Analytics</Button>
                  </Link>
                  {form.isPublished && (
                    <Link href={`/f/${form.slug}`} target="_blank">
                      <Button variant="ghost" size="sm"><ExternalLink className="h-3.5 w-3.5" /></Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AdminShell>
  );
}
