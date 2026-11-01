// Porting di publishers/wordpress.py

import { generateCoverArt } from "@/lib/coverArt";
import { escapeHtml, safeImageUrl } from "@/lib/html";

type WpConfig = { url: string; username: string; appPassword: string; defaultStatus?: string };
type ArticleWithImage = { imageUrl?: string | null };
type WordPressArticle = {
  title: string; lead: string; sections: { heading: string; body: string }[];
  cta: string; hashtags: string[];
} & ArticleWithImage;

function apiBase(cfg: WpConfig) {
  const url = cfg.url.replace(/\/$/, "");
  if (url.includes("public-api.wordpress.com")) return url;
  return `${url}/wp-json/wp/v2`;
}

function authHeader(cfg: WpConfig) {
  const token = Buffer.from(`${cfg.username}:${cfg.appPassword}`).toString("base64");
  return `Basic ${token}`;
}

export async function publishToWordPress(
  cfg: WpConfig,
  article: WordPressArticle
): Promise<{ ok: boolean; message: string }> {
  const imageUrl = safeImageUrl(article.imageUrl);
  const cover = imageUrl
    ? `<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(article.title)}" style="width:100%;height:auto;border-radius:6px;" />`
    : generateCoverArt(article.title);
  const bodyParts = [cover, `<p>${escapeHtml(article.lead)}</p>`];
  for (const section of article.sections || []) {
    bodyParts.push(`<h2>${escapeHtml(section.heading)}</h2>`);
    bodyParts.push(`<p>${escapeHtml(section.body)}</p>`);
  }
  bodyParts.push(`<p>${escapeHtml(article.cta)}</p>`);

  try {
    const res = await fetch(`${apiBase(cfg)}/posts`, {
      method: "POST",
      signal: AbortSignal.timeout(20000),
      headers: { "Content-Type": "application/json", Authorization: authHeader(cfg) },
      body: JSON.stringify({
        title: article.title,
        content: bodyParts.join("\n"),
        status: cfg.defaultStatus || "draft",
      }),
    });
    if (res.ok) {
      const data = await res.json();
      return { ok: true, message: `OK (ID ${data.id})` };
    }
    return { ok: false, message: `WordPress error ${res.status}: verifica URL, utente e Application Password.` };
  } catch {
    return { ok: false, message: "Errore di rete durante la pubblicazione su WordPress." };
  }
}
