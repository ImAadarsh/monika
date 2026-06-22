import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { listForms, createForm, getDashboardStats } from "@/lib/forms";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const [forms, stats] = await Promise.all([listForms(), getDashboardStats()]);
    return NextResponse.json({ forms, stats });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch forms" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const form = await createForm({
      title: body.title || "Untitled Form",
      description: body.description,
      settings: body.settings,
      fields: body.fields,
    });
    return NextResponse.json({ form }, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to create form" }, { status: 500 });
  }
}
