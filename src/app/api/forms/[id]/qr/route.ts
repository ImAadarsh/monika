import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { getSession } from "@/lib/auth";
import { getFormById } from "@/lib/forms";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const form = await getFormById(id);
  if (!form) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const sp = req.nextUrl.searchParams;
  const utmParts: string[] = [];
  const utmSource = sp.get("utm_source") || form.settings.utmSource;
  const utmMedium = sp.get("utm_medium") || form.settings.utmMedium;
  const utmCampaign = sp.get("utm_campaign") || form.settings.utmCampaign;
  if (utmSource) utmParts.push(`utm_source=${encodeURIComponent(utmSource)}`);
  if (utmMedium) utmParts.push(`utm_medium=${encodeURIComponent(utmMedium)}`);
  if (utmCampaign) utmParts.push(`utm_campaign=${encodeURIComponent(utmCampaign)}`);
  const qs = utmParts.length ? `?${utmParts.join("&")}` : "";
  const url = `${baseUrl}/f/${form.slug}${qs}`;

  const dark = sp.get("dark") || form.settings.themeColor?.replace("#", "") || "4338ca";
  const light = sp.get("light") || "ffffff";
  const size = Number(sp.get("size") || 400);
  const format = sp.get("format") || "png";

  const qrOptions = {
    width: size,
    margin: 2,
    color: { dark: `#${dark.replace("#", "")}`, light: `#${light.replace("#", "")}` },
  };

  if (format === "svg") {
    const svg = await QRCode.toString(url, { ...qrOptions, type: "svg" });
    return new NextResponse(svg, {
      headers: { "Content-Type": "image/svg+xml" },
    });
  }

  const qrDataUrl = await QRCode.toDataURL(url, qrOptions);
  return NextResponse.json({ url, qrDataUrl, slug: form.slug, embedUrl: url });
}
