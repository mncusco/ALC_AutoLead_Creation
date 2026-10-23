import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db";
import { INTEGRATIONS } from "@/lib/integrations";
import { publishToWordPress } from "@/lib/publishers/wordpress";
import { publishToGitHubPages } from "@/lib/publishers/githubPages";
import { publishToFacebook } from "@/lib/publishers/facebook";
import { publishToLinkedIn } from "@/lib/publishers/linkedin";
import { publishToInstagram } from "@/lib/publishers/instagram";
import { publishToPinterest } from "@/lib/publishers/pinterest";

export async function POST(_req: Request, { params }: { params: { id: string; platform: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  const organizationId = (session as any).organizationId as string;
  const platform = params.platform;

  const def = INTEGRATIONS[platform];
  if (!def) return NextResponse.json({ error: "Piattaforma sconosciuta" }, { status: 400 });
  if (!def.publishSupported) {
    return NextResponse.json({ error: def.limitation || "Pubblicazione non ancora disponibile per questa piattaforma." }, { status: 400 });
  }

  const [article] = await sql`
    SELECT id, title, content, image_url FROM articles
    WHERE id = ${params.id} AND organization_id = ${organizationId}
    LIMIT 1
  `;
  if (!article) return NextResponse.json({ error: "Articolo non trovato" }, { status: 404 });

  const [account] = await sql`
    SELECT config FROM social_accounts
    WHERE organization_id = ${organizationId} AND platform = ${platform}
    LIMIT 1
  `;
  if (!account) {
    return NextResponse.json({ error: `${def.label} non collegato. Vai in Impostazioni.` }, { status: 400 });
  }

  const cfg = account.config as any;
  const content = article.content as any;
  const articleData = {
    title: article.title,
    lead: content.lead,
    sections: content.sections,
    cta: content.cta,
    hashtags: content.hashtags,
    imageUrl: article.image_url as string | null,
  };

  let result: { ok: boolean; message: string };
  switch (platform) {
    case "wordpress":
      result = await publishToWordPress(cfg, articleData);
      break;
    case "github_pages":
      result = await publishToGitHubPages(cfg, articleData);
      break;
    case "facebook":
      result = await publishToFacebook(cfg, articleData);
      break;
    case "linkedin":
      result = await publishToLinkedIn(cfg, articleData);
      break;
    case "instagram":
      result = await publishToInstagram(cfg, articleData);
      break;
    case "pinterest":
      result = await publishToPinterest(cfg, articleData);
      break;
    default:
      result = { ok: false, message: "Non implementato" };
  }

  await sql`
    INSERT INTO publish_events (organization_id, article_id, platform, status, published_at, error_message)
    VALUES (
      ${organizationId}, ${article.id}, ${platform},
      ${result.ok ? "success" : "failed"},
      ${result.ok ? new Date().toISOString() : null},
      ${result.ok ? null : result.message}
    )
  `;

  return NextResponse.json({ ok: result.ok, message: result.message });
}
