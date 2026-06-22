import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getSubmissionById } from "@/lib/forms";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string; submissionId: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id, submissionId } = await params;
  const submission = await getSubmissionById(submissionId, id);
  if (!submission) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ submission });
}
