import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { getSession } from "@/lib/auth";
import { listForms } from "@/lib/forms";
import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { FormsListClient } from "@/components/admin/forms-list-client";

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
        <div className="flex gap-2">
          <Link href="/admin/templates">
            <Button variant="outline">Templates</Button>
          </Link>
          <Link href="/admin/forms/new">
            <Button><Plus className="h-4 w-4" /> New Form</Button>
          </Link>
        </div>
      </div>

      {forms.length === 0 ? (
        <div className="rounded-xl border border-dashed py-16 text-center">
          <p className="text-muted-foreground">No forms created yet</p>
          <Link href="/admin/forms/new">
            <Button className="mt-4">Create your first form</Button>
          </Link>
        </div>
      ) : (
        <FormsListClient forms={forms} />
      )}
    </AdminShell>
  );
}
