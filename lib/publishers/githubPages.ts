// Pubblica un articolo come pagina statica su un repo GitHub Pages,
// aggiungendo un nuovo file in una cartella dedicata (non tocca index o altre pagine esistenti).

import { generateCoverArt } from "@/lib/coverArt";

type GhConfig = { owner: string; repo: string; branch?: string; postsPath?: string; token: string };
type ArticleData = {
  title: string;
  lead: string;
  sections: { heading: string; body: string }[];
  cta: string;
  hashtags: string[];
};

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function renderHtml(article: ArticleData, cover: string) {
  const body = (article.sections || [])
    .map((s) => `<h2>${s.heading}</h2>\n<p>${s.body}</p>`)
    .join("\n");
  return `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${article.title}</title>
<style>
  body { font-family: -apple-system, system-ui, sans-serif; max-width: 680px; margin: 40px auto; padding: 0 20px; line-height: 1.65; color: #222; }
  .cover { margin-bottom: 24px; border-radius: 6px; overflow: hidden; }
  h1 { font-size: 30px; }
  .cta { font-weight: 600; margin-top: 24px; }
  .hashtags { color: #888; font-size: 14px; margin-top: 16px; }
</style>
</head>
<body>
  <div class="cover">${cover}</div>
  <h1>${article.title}</h1>
  <p>${article.lead}</p>
  ${body}
  <p class="cta">${article.cta}</p>
  <p class="hashtags">${(article.hashtags || []).join("  ")}</p>
</body>
</html>`;
}

export async function publishToGitHubPages(
  cfg: GhConfig,
  article: ArticleData
): Promise<{ ok: boolean; message: string }> {
  const branch = cfg.branch || "main";
  const postsPath = (cfg.postsPath || "posts").replace(/^\/|\/$/g, "");
  const slug = `${slugify(article.title)}-${Date.now().toString(36)}`;
  const path = `${postsPath}/${slug}.html`;

  const cover = generateCoverArt(article.title);
  const html = renderHtml(article, cover);
  const contentB64 = Buffer.from(html, "utf-8").toString("base64");

  try {
    const res = await fetch(
      `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${path}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${cfg.token}`,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `Nuovo articolo: ${article.title}`,
          content: contentB64,
          branch,
        }),
      }
    );

    if (res.ok) {
      const data = await res.json();
      return { ok: true, message: `Pubblicato: ${data.content?.html_url || path}` };
    }
    const text = await res.text();
    return { ok: false, message: `GitHub error ${res.status}: ${text.slice(0, 200)}` };
  } catch (e: any) {
    return { ok: false, message: e.message || "Errore di rete" };
  }
}
