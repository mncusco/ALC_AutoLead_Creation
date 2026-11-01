import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db";
import { INTEGRATIONS } from "@/lib/integrations";
import { encryptIntegrationConfig, readIntegrationConfig } from "@/lib/integrationCrypto";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  const organizationId = (session as any).organizationId as string;

  const rows = await sql`
    SELECT platform FROM social_accounts WHERE organization_id = ${organizationId}
  `;
  return NextResponse.json({ connected: [...new Set(rows.map((r: any) => r.platform))] });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  const organizationId = (session as any).organizationId as string;

  try {
    const body = await req.json();
    const platform = body?.platform;
    const fields = body?.fields;
    const def = INTEGRATIONS[platform];
    if (!def) return NextResponse.json({ error: "Piattaforma sconosciuta" }, { status: 400 });
    if (!fields || typeof fields !== "object" || Array.isArray(fields)) {
      return NextResponse.json({ error: "Configurazione non valida" }, { status: 400 });
    }

    const [existing] = await sql`
      SELECT id, access_token_encrypted, config
      FROM social_accounts
      WHERE organization_id = ${organizationId} AND platform = ${platform}
      ORDER BY connected_at DESC
      LIMIT 1
    `;

    let merged: Record<string, string> = {};
    if (existing) {
      merged = readIntegrationConfig(existing.access_token_encrypted, existing.config);
    }

    for (const field of def.fields) {
      const incoming = typeof fields[field.key] === "string" ? fields[field.key].trim() : "";
      if (incoming) merged[field.key] = incoming;
    }

    for (const field of def.fields) {
      if (!merged[field.key]) {
        return NextResponse.json({ error: `Campo mancante: ${field.label}` }, { status: 400 });
      }
    }

    const encrypted = encryptIntegrationConfig(merged);
    // Insert first, then remove older duplicates: a failed insert never destroys a working connection.
    const [saved] = await sql`
      INSERT INTO social_accounts (organization_id, platform, access_token_encrypted, config)
      VALUES (${organizationId}, ${platform}, ${encrypted}, NULL)
      RETURNING id
    `;
    await sql`
      DELETE FROM social_accounts
      WHERE organization_id = ${organizationId}
        AND platform = ${platform}
        AND id <> ${saved.id}
    `;

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    const message = e?.message === "INTEGRATION_ENCRYPTION_KEY non configurata" ||
      e?.message?.includes("INTEGRATION_ENCRYPTION_KEY")
      ? "Configurazione di sicurezza incompleta sul server: contatta l'amministratore."
      : "Impossibile salvare la connessione. Verifica la configurazione del database.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
