import { redirect } from "next/navigation";
import Link from "next/link";
import { FileText, Plus, TrendingUp, Users } from "lucide-react";
import { getSession } from "@/lib/auth";
import { listForms, getDashboardStats } from "@/lib/forms";
import { AdminShell } from "@/components/admin/admin-shell";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

export default async function AdminDashboardPage() {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const [forms, stats] = await Promise.all([listForms(), getDashboardStats()]);

  return (
    <AdminShell>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {session.name}</p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Forms" value={formatNumber(stats.totalForms)} icon={FileText} />
        <StatCard title="Published" value={formatNumber(stats.publishedForms)} icon={TrendingUp} />
        <StatCard title="Total Responses" value={formatNumber(stats.totalSubmissions)} icon={Users} />
        <StatCard title="Responses Today" value={formatNumber(stats.submissionsToday)} icon={Users} change="Last 24h" />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Forms</CardTitle>
          <Link href="/admin/forms/new">
            <Button size="sm"><Plus className="h-4 w-4" /> New Form</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {forms.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <p>No forms yet. Create your first form!</p>
              <Link href="/admin/forms/new">
                <Button className="mt-4">Create Form</Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {forms.slice(0, 5).map((form) => (
                <Link
                  key={form.id}
                  href={`/admin/forms/${form.id}/edit`}
                  className="flex items-center justify-between py-4 transition-colors hover:bg-muted/30 -mx-2 px-2 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{form.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {form.submissionCount} responses · {form.fieldCount} fields ·{" "}
                      {formatDistanceToNow(new Date(form.updatedAt), { addSuffix: true })}
                    </p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    form.isPublished
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {form.isPublished ? "Live" : "Draft"}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </AdminShell>
  );
}
