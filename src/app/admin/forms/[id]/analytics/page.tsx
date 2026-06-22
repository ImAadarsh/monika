"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { AnalyticsDashboard } from "@/components/admin/analytics-dashboard";
import type { AnalyticsData } from "@/types/form";

export default function AnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const [formId, setFormId] = useState("");
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then(({ id }) => {
      setFormId(id);
      fetch(`/api/forms/${id}/analytics`)
        .then((r) => r.json())
        .then((data) => setAnalytics(data.analytics))
        .finally(() => setLoading(false));
    });
  }, [params]);

  if (loading) {
    return (
      <AdminShell>
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminShell>
    );
  }

  if (!analytics) {
    return (
      <AdminShell>
        <p className="py-20 text-center text-muted-foreground">Analytics not available</p>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <Link href={`/admin/forms/${formId}/edit`} className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to editor
      </Link>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Detailed insights into form responses</p>
      </div>
      <AnalyticsDashboard data={analytics} />
    </AdminShell>
  );
}
