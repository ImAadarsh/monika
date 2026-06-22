import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { updateFormSlug } from "@/lib/forms";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const { slug } = await req.json();
  const form = await updateFormSlug(id, slug);
  if (!form) {
    return NextResponse.json({ error: "Slug unavailable or invalid" }, { status: 400 });
  }
  return NextResponse.json({ form });
}
