import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { getSession } from "@/lib/auth";
import { getFormById } from "@/lib/forms";

export async function GET(
  _req: Request,
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
  const url = `${baseUrl}/f/${form.slug}`;
  const qrDataUrl = await QRCode.toDataURL(url, {
    width: 400,
    margin: 2,
    color: { dark: "#4338ca", light: "#ffffff" },
  });
  return NextResponse.json({ url, qrDataUrl, slug: form.slug });
}
