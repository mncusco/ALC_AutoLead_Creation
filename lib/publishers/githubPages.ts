// Pubblica un file HTML statico in una cartella dedicata del repository GitHub Pages.
// Il formato del post va configurato in base al motore del blog (Jekyll, Hugo, Astro, ecc.).

import { generateCoverArt } from "@/lib/coverArt";
import { escapeHtml, safeImageUrl } from "@/lib/html";

type GhConfig = { owner: string; repo: string; branch?: string; postsPath?: string; token: string };
type ArticleData = {
  title: string;
  lead: string;
  sections: { heading: string; body: string }[];
  cta: string;
  hashtags: string[];
  imageUrl?: string | null;
  metaDescription?: string;
  language?: string;
};

function slugify(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "articolo";
}

function renderHtml(article: ArticleData, cover: string) {
  const title = escapeHtml(article.title);
  const description = escapeHtml(article.metaDescription || article.lead);
  const imageUrl = safeImageUrl(article.imageUrl);
  const coverHtml = imageUrl
    ? `<img src="${escapeHtml(imageUrl)}" alt="${title}" style="width:100%;height:auto" />`
    : cover;
  const body = (article.sections || [])
    .map((section) => `<h2>${escapeHtml(section.heading)}</h2>\n<p>${escapeHtml(section.body)}</p>`)
    .join("\n");
  const hashtags = (article.hashtags || []).map(escapeHtml).join("  ");

  return `<!DOCTYPE html>
<html lang="${article.language === "EN" ? "en" : "it"}">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title}</title>
<meta name="description" content="${description}" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />
<meta property="og:type" content="article" />
${imageUrl ? `<meta property="og:image" content="${escapeHtml(imageUrl)}" />` : ""}
<style>
  body { font-family: -apple-system, system-ui, sans-serif; max-width: 760px; margin: 40px auto; padding: 0 20px; line-height: 1.7; color: #222; }
  .cover { margin-bottom: 24px; border-radius: 6px; overflow: hidden; }
  .cover img { display:block; width:100%; height:auto; }
  h1 { font-size: 30px; line-height:1.2; }
  .cta { font-weight: 600; margin-top: 24px; }
  .hashtags { color: #888; font-size: 14px; margin-top: 16px; }
</style>
</head>
<body>
  <div class="cover">${coverHtml}</div>
  <h1>${title}</h1>
  <p>${escapeHtml(article.lead)}</p>
  ${body}
  <p class="cta">${escapeHtml(article.cta)}</p>
  <p class="hashtags">${hashtags}</p>
</body>
</html>`;
}

export async function publishToGitHubPages(
  cfg: GhConfig,
  article: ArticleData
): Promise<{ ok: boolean; message: string }> {
  const branch = cfg.branch || "main";
  const postsPath = (cfg.postsPath || "posts").replace(/^\/+|\/+$/g, "").replace(/\.\./g, "");
  if (!/^[a-zA-Z0-9_.\/-]+$/.test(postsPath) || !cfg.owner || !cfg.repo || !cfg.token) {
    return { ok: false, message: "Configurazione GitHub Pages non valida." };
  }
  const slug = `${slugify(article.title)}-${Date.now().toString(36)}`;
  const path = `${postsPath}/${slug}.html`;
  const cover = generateCoverArt(article.title);
  const html = renderHtml(article, cover);
  const contentB64 = Buffer.from(html, "utf-8").toString("base64");

  try {
    const res = await fetch(
      `https://api.github.com/repos/${encodeURIComponent(cfg.owner)}/${encodeURIComponent(cfg.repo)}/contents/${path.split("/").map(encodeURIComponent).join("/")}`,
      {
        method: "PUT",
        signal: AbortSignal.timeout(20000),
        headers: {
          Authorization: `Bearer ${cfg.token}`,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: `Nuovo articolo: ${article.title.slice(0, 100)}`, content: contentB64, branch }),
      }
    );
    if (res.ok) {
      const data = await res.json();
      return { ok: true, message: `File creato nel repository: ${data.content?.path || path}` };
    }
    return { ok: false, message: `GitHub error ${res.status}: impossibile creare il file nel repository.` };
  } catch {
    return { ok: false, message: "Errore di rete durante la pubblicazione su GitHub." };
  }
}
