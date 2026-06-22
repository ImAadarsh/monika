import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAnalytics } from "@/lib/forms";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  try {
    const analytics = await getAnalytics(id);
    if (!analytics) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ analytics });
  } catch (e) {
    console.error("Failed to load analytics:", e);
    return NextResponse.json({ error: "Failed to load analytics" }, { status: 500 });
  }
}
