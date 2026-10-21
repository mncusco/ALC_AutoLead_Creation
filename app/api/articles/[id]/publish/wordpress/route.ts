import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db";
import { publishToWordPress } from "@/lib/publishers/wordpress";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  const organizationId = (session as any).organizationId as string;

  const [article] = await sql`
    SELECT id, title, content FROM articles
    WHERE id = ${params.id} AND organization_id = ${organizationId}
    LIMIT 1
  `;
  if (!article) return NextResponse.json({ error: "Articolo non trovato" }, { status: 404 });

  const [account] = await sql`
    SELECT config FROM social_accounts
    WHERE organization_id = ${organizationId} AND platform = 'wordpress'
    LIMIT 1
  `;
  if (!account) {
    return NextResponse.json({ error: "WordPress non collegato. Vai in Impostazioni." }, { status: 400 });
  }

  const cfg = account.config as { url: string; username: string; appPassword: string };
  const content = article.content as any;
  const result = await publishToWordPress(
    { url: cfg.url, username: cfg.username, appPassword: cfg.appPassword },
    { title: article.title, lead: content.lead, sections: content.sections, cta: content.cta, hashtags: content.hashtags }
  );

  await sql`
    INSERT INTO publish_events (organization_id, article_id, platform, status, published_at, error_message)
    VALUES (
      ${organizationId}, ${article.id}, 'wordpress',
      ${result.ok ? "success" : "failed"},
      ${result.ok ? new Date().toISOString() : null},
      ${result.ok ? null : result.message}
    )
  `;

  return NextResponse.json({ ok: result.ok, message: result.message });
}
