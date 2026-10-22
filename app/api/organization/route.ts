import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  const organizationId = (session as any).organizationId as string;

  const [org] = await sql`SELECT brand_voice FROM organizations WHERE id = ${organizationId}`;
  return NextResponse.json({ brandVoice: org?.brand_voice || "" });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  const organizationId = (session as any).organizationId as string;

  const { brandVoice } = await req.json();
  await sql`UPDATE organizations SET brand_voice = ${brandVoice || null} WHERE id = ${organizationId}`;
  return NextResponse.json({ ok: true });
}
