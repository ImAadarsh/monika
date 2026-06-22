"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Copy, Download, ExternalLink, Loader2, Mail, Share2 } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { toast } from "sonner";

export default function ShareFormPage({ params }: { params: Promise<{ id: string }> }) {
  const [formId, setFormId] = useState("");
  const [url, setUrl] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(true);
  const [qrDark, setQrDark] = useState("4338ca");
  const [qrLight, setQrLight] = useState("ffffff");
  const [qrSize, setQrSize] = useState(400);
  const [utmSource, setUtmSource] = useState("");
  const [utmMedium, setUtmMedium] = useState("");
  const [utmCampaign, setUtmCampaign] = useState("");

  function loadQr() {
    const qs = new URLSearchParams();
    if (qrDark) qs.set("dark", qrDark);
    if (qrLight) qs.set("light", qrLight);
    qs.set("size", String(qrSize));
    if (utmSource) qs.set("utm_source", utmSource);
    if (utmMedium) qs.set("utm_medium", utmMedium);
    if (utmCampaign) qs.set("utm_campaign", utmCampaign);
    fetch(`/api/forms/${formId}/qr?${qs}`)
      .then((r) => r.json())
      .then((data) => {
        setUrl(data.url);
        setQrDataUrl(data.qrDataUrl);
        setSlug(data.slug);
      });
  }

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

  useEffect(() => {
    if (formId) loadQr();
  }, [formId, qrDark, qrLight, qrSize, utmSource, utmMedium, utmCampaign]);

  function copyLink() {
    navigator.clipboard.writeText(url);
    toast.success("Link copied!");
  }

  function copyEmbed() {
    const code = `<iframe src="${url}" width="100%" height="600" frameborder="0" style="border:none;max-width:640px;"></iframe>`;
    navigator.clipboard.writeText(code);
    toast.success("Embed code copied!");
  }

  function downloadQR() {
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `form-${slug}-qr.png`;
    a.click();
  }

  async function downloadSvg() {
    const qs = new URLSearchParams({ format: "svg", dark: qrDark, light: qrLight, size: String(qrSize) });
    const res = await fetch(`/api/forms/${formId}/qr?${qs}`);
    const svg = await res.text();
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `form-${slug}-qr.svg`;
    a.click();
  }

  const shareText = encodeURIComponent("Fill out this form");
  const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${shareText}`;
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  const whatsappUrl = `https://wa.me/?text=${shareText}%20${encodeURIComponent(url)}`;
  const mailtoUrl = `mailto:?subject=${shareText}&body=${encodeURIComponent(url)}`;

  if (loading) {
    return (
      <AdminShell>
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
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
        <p className="text-muted-foreground">Share via link, QR code, embed, or social</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Form Link</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input value={url} readOnly className="font-mono text-sm" />
              <Button variant="outline" onClick={copyLink}><Copy className="h-4 w-4" /></Button>
            </div>
            <Link href={`/f/${slug}`} target="_blank">
              <Button variant="outline" className="w-full"><ExternalLink className="h-4 w-4" /> Open Form</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>QR Code</CardTitle></CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            {qrDataUrl && (
              <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
                <Image src={qrDataUrl} alt="Form QR Code" width={280} height={280} />
                <p className="mt-2 text-center text-sm font-medium">{slug}</p>
              </div>
            )}
            <div className="grid w-full gap-3 sm:grid-cols-2">
              <div><Label>Dark color</Label><Input value={qrDark} onChange={(e) => setQrDark(e.target.value)} className="mt-1 font-mono" /></div>
              <div><Label>Light color</Label><Input value={qrLight} onChange={(e) => setQrLight(e.target.value)} className="mt-1 font-mono" /></div>
              <div className="sm:col-span-2"><Label>Size (px)</Label><Input type="number" value={qrSize} onChange={(e) => setQrSize(Number(e.target.value))} className="mt-1" min={200} max={800} /></div>
            </div>
            <div className="flex w-full gap-2">
              <Button onClick={downloadQR} className="flex-1"><Download className="h-4 w-4" /> PNG</Button>
              <Button variant="outline" onClick={downloadSvg} className="flex-1"><Download className="h-4 w-4" /> SVG</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Embed Code</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs">{`<iframe src="${url}" width="100%" height="600" ...></iframe>`}</pre>
            <Button variant="outline" className="w-full" onClick={copyEmbed}><Copy className="h-4 w-4" /> Copy Embed Code</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>UTM Parameters</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><Label>Source</Label><Input value={utmSource} onChange={(e) => setUtmSource(e.target.value)} className="mt-1" placeholder="newsletter" /></div>
            <div><Label>Medium</Label><Input value={utmMedium} onChange={(e) => setUtmMedium(e.target.value)} className="mt-1" placeholder="email" /></div>
            <div><Label>Campaign</Label><Input value={utmCampaign} onChange={(e) => setUtmCampaign(e.target.value)} className="mt-1" placeholder="spring2026" /></div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="flex items-center gap-2"><Share2 className="h-5 w-5" /> Social Share</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <a href={twitterUrl} target="_blank" rel="noopener noreferrer"><Button variant="outline" size="sm">Twitter / X</Button></a>
            <a href={linkedInUrl} target="_blank" rel="noopener noreferrer"><Button variant="outline" size="sm">LinkedIn</Button></a>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"><Button variant="outline" size="sm">WhatsApp</Button></a>
            <a href={mailtoUrl}><Button variant="outline" size="sm"><Mail className="h-4 w-4" /> Email</Button></a>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
