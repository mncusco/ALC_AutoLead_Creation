import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function DELETE(_req: Request, { params }: { params: { platform: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  const organizationId = (session as any).organizationId as string;

  await sql`DELETE FROM social_accounts WHERE organization_id = ${organizationId} AND platform = ${params.platform}`;
  return NextResponse.json({ ok: true });
}
