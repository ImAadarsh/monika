"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Copy, Download, ExternalLink, Loader2 } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function ShareFormPage({ params }: { params: Promise<{ id: string }> }) {
  const [formId, setFormId] = useState("");
  const [url, setUrl] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then(({ id }) => {
      setFormId(id);
      fetch(`/api/forms/${id}/qr`)
        .then((r) => r.json())
        .then((data) => {
          setUrl(data.url);
          setQrDataUrl(data.qrDataUrl);
          setSlug(data.slug);
        })
        .finally(() => setLoading(false));
    });
  }, [params]);

  function copyLink() {
    navigator.clipboard.writeText(url);
    toast.success("Link copied!");
  }

  function downloadQR() {
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `form-${slug}-qr.png`;
    a.click();
  }

  if (loading) {
    return (
      <AdminShell>
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <Link href={`/admin/forms/${formId}/edit`} className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to editor
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Share Form</h1>
        <p className="text-muted-foreground">Share via link or QR code</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Form Link</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input value={url} readOnly className="font-mono text-sm" />
              <Button variant="outline" onClick={copyLink}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <Link href={`/f/${slug}`} target="_blank">
              <Button variant="outline" className="w-full">
                <ExternalLink className="h-4 w-4" /> Open Form
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>QR Code</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            {qrDataUrl && (
              <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
                <Image src={qrDataUrl} alt="Form QR Code" width={280} height={280} />
              </div>
            )}
            <Button onClick={downloadQR} className="w-full">
              <Download className="h-4 w-4" /> Download QR Code
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Scan this QR code to open the form on any device
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
