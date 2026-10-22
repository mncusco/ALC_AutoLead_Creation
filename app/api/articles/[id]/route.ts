import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  const organizationId = (session as any).organizationId as string;

  const result = await sql`
    DELETE FROM articles WHERE id = ${params.id} AND organization_id = ${organizationId}
    RETURNING id
  `;
  if (result.length === 0) {
    return NextResponse.json({ error: "Articolo non trovato" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
