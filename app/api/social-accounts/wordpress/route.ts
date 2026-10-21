import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  const organizationId = (session as any).organizationId as string;

  const { url, username, appPassword } = await req.json();
  if (!url || !username || !appPassword) {
    return NextResponse.json({ error: "Campi mancanti" }, { status: 400 });
  }

  await sql`DELETE FROM social_accounts WHERE organization_id = ${organizationId} AND platform = 'wordpress'`;
  await sql`
    INSERT INTO social_accounts (organization_id, platform, access_token_encrypted, config)
    VALUES (${organizationId}, 'wordpress', '', ${JSON.stringify({ url, username, appPassword })}::jsonb)
  `;

  return NextResponse.json({ ok: true });
}
