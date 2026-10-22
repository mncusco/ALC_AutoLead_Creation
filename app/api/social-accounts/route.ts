import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db";
import { INTEGRATIONS } from "@/lib/integrations";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  const organizationId = (session as any).organizationId as string;

  const rows = await sql`
    SELECT platform FROM social_accounts WHERE organization_id = ${organizationId}
  `;
  return NextResponse.json({ connected: rows.map((r: any) => r.platform) });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  const organizationId = (session as any).organizationId as string;

  const { platform, fields } = await req.json();
  const def = INTEGRATIONS[platform];
  if (!def) return NextResponse.json({ error: "Piattaforma sconosciuta" }, { status: 400 });

  for (const f of def.fields) {
    if (!fields?.[f.key]) {
      return NextResponse.json({ error: `Campo mancante: ${f.label}` }, { status: 400 });
    }
  }

  await sql`DELETE FROM social_accounts WHERE organization_id = ${organizationId} AND platform = ${platform}`;
  await sql`
    INSERT INTO social_accounts (organization_id, platform, access_token_encrypted, config)
    VALUES (${organizationId}, ${platform}, '', ${JSON.stringify(fields)}::jsonb)
  `;

  return NextResponse.json({ ok: true });
}
