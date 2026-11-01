import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db";
import { readIntegrationConfig } from "@/lib/integrationCrypto";
import { fetchWebsiteText, fetchFacebookPostsText, analyzeVoice } from "@/lib/brandVoiceAnalysis";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });
  const organizationId = (session as any).organizationId as string;

  try {
    const { source, url } = await req.json();
    let sourceText: string;

    if (source === "website") {
      if (!url) return NextResponse.json({ error: "URL mancante" }, { status: 400 });
      sourceText = await fetchWebsiteText(url);
    } else if (source === "facebook") {
      const [account] = await sql`
        SELECT access_token_encrypted, config FROM social_accounts
        WHERE organization_id = ${organizationId} AND platform = 'facebook'
        ORDER BY connected_at DESC LIMIT 1
      `;
      if (!account) return NextResponse.json({ error: "Facebook non collegato. Vai in Impostazioni e collegalo prima." }, { status: 400 });
      const cfg = readIntegrationConfig(account.access_token_encrypted, account.config);
      sourceText = await fetchFacebookPostsText(cfg.pageId, cfg.pageAccessToken);
    } else {
      return NextResponse.json({ error: "Sorgente sconosciuta" }, { status: 400 });
    }

    const brandVoice = await analyzeVoice(sourceText);
    return NextResponse.json({ brandVoice });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Errore durante l'analisi" }, { status: 502 });
  }
}
