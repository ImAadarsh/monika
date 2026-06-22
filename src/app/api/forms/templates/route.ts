import { NextResponse } from "next/server";
import { FORM_TEMPLATES } from "@/lib/form-templates";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ templates: FORM_TEMPLATES });
}
