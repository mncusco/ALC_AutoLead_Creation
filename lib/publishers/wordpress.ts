// Porting di publishers/wordpress.py

import { generateCoverArt } from "@/lib/coverArt";

type WpConfig = { url: string; username: string; appPassword: string; defaultStatus?: string };
type ArticleWithImage = { imageUrl?: string | null };

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
  article: { title: string; lead: string; sections: { heading: string; body: string }[]; cta: string; hashtags: string[] } & ArticleWithImage
): Promise<{ ok: boolean; message: string }> {
  const cover = article.imageUrl
    ? `<img src="${article.imageUrl}" alt="${article.title}" style="width:100%;height:auto;border-radius:6px;" />`
    : generateCoverArt(article.title);
  const bodyParts = [cover, `<p>${article.lead || ""}</p>`];
  for (const sec of article.sections || []) {
    bodyParts.push(`<h2>${sec.heading || ""}</h2>`);
    bodyParts.push(`<p>${sec.body || ""}</p>`);
  }
  bodyParts.push(`<p>${article.cta || ""}</p>`);

  try {
    const res = await fetch(`${apiBase(cfg)}/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader(cfg),
      },
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
    const text = await res.text();
    return { ok: false, message: `WP error ${res.status}: ${text.slice(0, 200)}` };
  } catch (e: any) {
    return { ok: false, message: e.message || "Errore di rete" };
  }
}
