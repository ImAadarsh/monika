import { NextRequest, NextResponse } from "next/server";
import { submitForm } from "@/lib/forms";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  try {
    const body = await req.json();
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("x-real-ip") ||
      undefined;
    const userAgent = req.headers.get("user-agent") || undefined;
    const referrer = req.headers.get("referer") || body.referrer || undefined;
    const result = await submitForm(slug, body.answers || {}, {
      ip,
      userAgent,
      referrer,
      completionTimeMs: body.completionTimeMs,
      honeypot: body._hp,
      password: body.password,
    });
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }
    return NextResponse.json({ success: true, redirectUrl: result.redirectUrl });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Submission failed" }, { status: 500 });
  }
}
