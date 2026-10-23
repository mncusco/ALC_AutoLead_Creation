import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  const organizationId = (session as any).organizationId as string;

  const articles = await sql`
    SELECT a.id, a.title, a.language, a.template, a.content, a.created_at, a.image_url,
           (SELECT status FROM publish_events pe WHERE pe.article_id = a.id ORDER BY pe.created_at DESC LIMIT 1) AS last_status
    FROM articles a
    WHERE a.organization_id = ${organizationId}
    ORDER BY a.created_at DESC
    LIMIT 30
  `;
  return NextResponse.json({ articles });
}
