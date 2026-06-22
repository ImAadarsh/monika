import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getFormById, getSubmissions } from "@/lib/forms";
import { submissionsToCSV, submissionsToJSON } from "@/lib/form-export";

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

  const format = req.nextUrl.searchParams.get("format") || "csv";
  const { submissions } = await getSubmissions(id, { limit: 10000 });

  if (format === "json") {
    return new NextResponse(submissionsToJSON(submissions), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${form.slug}-responses.json"`,
      },
    });
  }

  return new NextResponse(submissionsToCSV(submissions, form.fields), {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${form.slug}-responses.csv"`,
    },
  });
}
