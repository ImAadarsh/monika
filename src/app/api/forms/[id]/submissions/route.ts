import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getSubmissions, deleteSubmission } from "@/lib/forms";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const search = req.nextUrl.searchParams.get("search") || undefined;
  const from = req.nextUrl.searchParams.get("from") || undefined;
  const to = req.nextUrl.searchParams.get("to") || undefined;
  const limit = Number(req.nextUrl.searchParams.get("limit") || 50);
  const offset = Number(req.nextUrl.searchParams.get("offset") || 0);

  try {
    const result = await getSubmissions(id, { search, from, to, limit, offset });
    return NextResponse.json(result);
  } catch (e) {
    console.error("Failed to load submissions:", e);
    return NextResponse.json({ error: "Failed to load submissions" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json();
  const deleted = await deleteSubmission(body.submissionId, id);
  if (!deleted) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
