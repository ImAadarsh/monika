import { NextResponse } from "next/server";
import { getFormBySlug } from "@/lib/forms";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const form = await getFormBySlug(slug);
  if (!form || !form.isPublished) {
    return NextResponse.json({ error: "Form not found" }, { status: 404 });
  }
  return NextResponse.json({ form });
}
