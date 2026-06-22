import { NextRequest, NextResponse } from "next/server";
import { getFormBySlug, recordFormView } from "@/lib/forms";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const form = await getFormBySlug(slug);
  if (!form || !form.isPublished) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    req.headers.get("x-real-ip") ||
    undefined;
  const userAgent = req.headers.get("user-agent") || undefined;
  await recordFormView(form.id, { ip, userAgent });

  const { password, webhookUrl, notifyEmail, ...safeSettings } = form.settings;
  return NextResponse.json({
    form: {
      ...form,
      settings: {
        ...safeSettings,
        hasPassword: Boolean(password),
      },
    },
  });
}
