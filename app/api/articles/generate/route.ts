import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sql } from "@/lib/db";
import { generateArticle } from "@/lib/generate";
import { searchPexelsImage } from "@/lib/pexels";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Non autenticato" }, { status: 401 });

  const organizationId = (session as any).organizationId as string;
  const { templateId, instructions } = await req.json();

  const [template] = await sql`
    SELECT id, name, label, language, prompt FROM content_templates
    WHERE id = ${templateId} AND organization_id = ${organizationId}
    LIMIT 1
  `;
  if (!template) return NextResponse.json({ error: "Template non trovato" }, { status: 404 });

  const [org] = await sql`SELECT brand_voice FROM organizations WHERE id = ${organizationId}`;

  let generated;
  try {
    generated = await generateArticle({
      template: { name: template.name, prompt: template.prompt, language: template.language },
      instructions,
      brandVoice: org?.brand_voice || undefined,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Errore di generazione" }, { status: 502 });
  }

  const content = JSON.stringify({
    lead: generated.lead,
    sections: generated.sections,
    cta: generated.cta,
    hashtags: generated.hashtags,
    meta_description: generated.meta_description,
    tone: generated.tone,
  });

  const imageUrl = await searchPexelsImage(`${generated.title} ${template.name}`);

  const [article] = await sql`
    INSERT INTO articles (organization_id, title, language, template, content, image_url)
    VALUES (${organizationId}, ${generated.title}, ${generated.language}, ${template.name}, ${content}, ${imageUrl})
    RETURNING id, title, language, template, created_at, image_url
  `;

  return NextResponse.json({ article });
}
