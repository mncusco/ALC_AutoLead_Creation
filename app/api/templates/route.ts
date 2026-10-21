import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  const organizationId = (session as any).organizationId as string;

  const templates = await sql`
    SELECT id, name, label, language, prompt FROM content_templates
    WHERE organization_id = ${organizationId}
    ORDER BY label
  `;
  return NextResponse.json({ templates });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  const organizationId = (session as any).organizationId as string;

  const { name, label, language, prompt } = await req.json();
  if (!name || !label || !prompt) {
    return NextResponse.json({ error: "Campi mancanti" }, { status: 400 });
  }

  const [template] = await sql`
    INSERT INTO content_templates (organization_id, name, label, language, prompt)
    VALUES (${organizationId}, ${name}, ${label}, ${language || "IT"}, ${prompt})
    ON CONFLICT (organization_id, name) DO UPDATE
      SET label = EXCLUDED.label, language = EXCLUDED.language, prompt = EXCLUDED.prompt
    RETURNING id, name, label, language, prompt
  `;
  return NextResponse.json({ template });
}
