// Publisher dedicato al sito statico HTML di mncusco/Blog.
// Crea la pagina nella root, aggiunge una scheda in articoli.html e aggiorna sitemap.xml.

import { escapeHtml, safeImageUrl } from "@/lib/html";
import { generateCoverArt } from "@/lib/coverArt";

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

const SITE_BASE = "https://mncusco.github.io/Blog";
const SITE_OWNER = "Marcello Buglione";

function slugify(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "articolo";
}

function readingMinutes(article: ArticleData) {
  const words = [article.title, article.lead, article.cta, ...(article.sections || []).flatMap(s => [s.heading, s.body])]
    .join(" ").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function jsonForHtml(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");
}

function renderHtml(article: ArticleData, slug: string, publishedDate: string) {
  const title = escapeHtml(article.title);
  const description = escapeHtml(article.metaDescription || article.lead);
  const lang = article.language === "EN" ? "en" : article.language === "ES" ? "es" : "it";
  const canonical = `${SITE_BASE}/${slug}.html`;
  const imageUrl = safeImageUrl(article.imageUrl);
  const image = imageUrl
    ? `<div class="cover"><img src="${escapeHtml(imageUrl)}" alt="${title}" style="width:100%;height:auto;display:block;border:1px solid var(--line)" loading="lazy"></div>`
    : `<div class="cover-placeholder"><span>${title}</span></div>`;
  const sections = (article.sections || []).map(section =>
    `<h2>${escapeHtml(section.heading)}</h2>\n<p>${escapeHtml(section.body).replace(/\n/g, "<br>")}</p>`
  ).join("\n");
  const hashtags = (article.hashtags || []).map(tag => escapeHtml(tag)).join(" · ");
  const structuredData = jsonForHtml({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_BASE}/#organization`,
        name: SITE_OWNER,
        url: `${SITE_BASE}/`,
        logo: { "@type": "ImageObject", url: `${SITE_BASE}/images/logo-mb-stamp.png` }
      },
      {
        "@type": "Article",
        headline: article.title,
        description: article.metaDescription || article.lead,
        mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
        url: canonical,
        datePublished: publishedDate,
        inLanguage: lang,
        author: { "@id": `${SITE_BASE}/#organization` },
        publisher: { "@id": `${SITE_BASE}/#organization` }
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_BASE}/` },
          { "@type": "ListItem", position: 2, name: "Tutti gli articoli", item: `${SITE_BASE}/articoli.html` },
          { "@type": "ListItem", position: 3, name: article.title, item: canonical }
        ]
      }
    ]
  });

  return `<!doctype html>
<html lang="${lang}">
<head>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-R0G5204TH7"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-R0G5204TH7');</script>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="description" content="${description}">
<title>${title} — ${SITE_OWNER}</title>
<link rel="canonical" href="${canonical}">
<meta property="og:locale" content="${lang === "en" ? "en_US" : lang === "es" ? "es_ES" : "it_IT"}">
<meta property="og:site_name" content="${SITE_OWNER}">
<meta property="og:title" content="${title} — ${SITE_OWNER}">
<meta property="og:description" content="${description}">
<meta property="og:type" content="article">
<meta property="og:url" content="${canonical}">
${imageUrl ? `<meta property="og:image" content="${escapeHtml(imageUrl)}">` : ""}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
${imageUrl ? `<meta name="twitter:image" content="${escapeHtml(imageUrl)}">` : ""}
<link rel="icon" href="images/favicon.png"><link rel="apple-touch-icon" href="images/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Playfair+Display:wght@500;600&display=swap" rel="stylesheet">
<style>
:root{--ink:#171714;--muted:#706f68;--paper:#f5f1e8;--card:#fbfaf6;--line:#d9d4c9;--accent:#8b5d3b;--max:1180px}
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--paper);color:var(--ink);font-family:'DM Sans',sans-serif;line-height:1.7}a{color:var(--accent);text-decoration:none}a:hover{text-decoration:underline}
.header{position:sticky;top:0;z-index:20;background:rgba(245,241,232,.94);backdrop-filter:blur(12px);border-bottom:1px solid var(--line)}.nav{max-width:var(--max);margin:auto;height:76px;display:flex;align-items:center;justify-content:space-between;padding:0 28px}.brand{font-family:'Playfair Display',serif;font-size:22px;color:var(--ink);display:flex;align-items:center;gap:9px}.links{display:flex;gap:25px;font-size:13px}.links a{color:#484740}.links a:hover{color:var(--accent)}.menu{display:none;border:0;background:none;font-size:22px}
.article{max-width:780px;margin:auto;padding:64px 28px 40px}.eyebrow{text-transform:uppercase;letter-spacing:.18em;font-size:11px;color:var(--accent);font-weight:600;margin:0 0 18px}.article h1{font:600 clamp(34px,5vw,52px)/1.08 'Playfair Display',serif;margin:0 0 18px}.dek{font-size:19px;line-height:1.6;color:#4f4e48;margin:0 0 26px}.byline{font-size:12px;color:#858279;letter-spacing:.04em;padding-bottom:26px;border-bottom:1px solid var(--line);margin-bottom:34px}
.article h2{font:500 29px/1.2 'Playfair Display',serif;margin:52px 0 16px;scroll-margin-top:100px}.article p{margin:0 0 18px;color:#2b2a26}blockquote{border-left:3px solid var(--accent);background:var(--card);border:1px solid var(--line);border-left-color:var(--accent);margin:24px 0;padding:18px 22px;font-family:'Playfair Display',serif;font-size:18px;line-height:1.55;color:#3c3a35}
.cover{margin-bottom:8px}.cover-placeholder{min-height:180px;background:linear-gradient(135deg,#cfc6b5,#827568);display:flex;align-items:center;justify-content:center;margin-bottom:8px;border:1px solid var(--line);padding:24px}.cover-placeholder span{font-family:'Playfair Display',serif;color:#fff;font-size:18px;text-align:center}
.cta-box{margin-top:56px;padding:32px;background:var(--card);border:1px solid var(--line);border-left:3px solid var(--accent)}.cta-box h2{margin:0 0 14px;font-size:22px}.cta-box p{margin:0 0 14px}.back{margin-top:44px}
.footer{max-width:var(--max);margin:auto;padding:38px 28px 55px;display:flex;justify-content:space-between;color:#77736a;font-size:12px;border-top:1px solid var(--line)}
@media(max-width:700px){.links{display:none}.links.open{display:flex;position:absolute;top:76px;left:0;right:0;flex-direction:column;gap:0;background:var(--card);border-bottom:1px solid var(--line);padding:10px 28px}.links.open a{padding:12px 0;border-bottom:1px solid var(--line)}.menu{display:block}.footer{display:block}.footer div+div{margin-top:10px}}
</style>
<script type="application/ld+json">${structuredData}</script>
</head>
<body>
<header class="header"><nav class="nav">
<a class="brand" href="index.html"><svg width="30" height="30" viewBox="0 0 100 100" aria-hidden="true" style="flex-shrink:0"><circle cx="50" cy="50" r="46" fill="none" stroke="#8b5d3b" stroke-width="2.5"/><g opacity=".28"><text x="35" y="66" text-anchor="middle" font-family="'Playfair Display',serif" font-size="48" font-weight="700" fill="#8b5d3b">N</text><text x="50" y="66" text-anchor="middle" font-family="'Playfair Display',serif" font-size="48" font-weight="700" fill="#8b5d3b">L</text><text x="65" y="66" text-anchor="middle" font-family="'Playfair Display',serif" font-size="48" font-weight="700" fill="#8b5d3b">P</text></g><text x="50" y="64" text-anchor="middle" font-family="'Playfair Display',serif" font-size="36" font-weight="500" fill="#171714">MB</text></svg><span>${SITE_OWNER}</span></a>
<div class="links"><a href="index.html#articoli">Articoli</a><a href="index.html#pensiero">Pensiero</a><a href="index.html#esperienze">Esperienze</a><a href="coaching-one-to-one.html">Coaching</a><a href="index.html#chi-sono">Chi sono</a><a href="index.html#contatti">Contatti</a><a href="https://shamanictravels.com" target="_blank" rel="noopener">Shamanic Travels ↗</a></div>
<button class="menu" aria-label="Menu">☰</button></nav></header>
<main class="article"><article>
${image}
<p class="eyebrow">Dal quaderno</p>
<h1>${title}</h1>
<p class="dek">${escapeHtml(article.lead)}</p>
<div class="byline">${SITE_OWNER} · ${publishedDate} · ${readingMinutes(article)} min</div>
${sections}
<div class="cta-box"><h2>In conclusione</h2><p>${escapeHtml(article.cta)}</p></div>
${hashtags ? `<p class="back">${hashtags}</p>` : ""}
<p class="back"><a href="articoli.html">← Torna a tutti gli articoli</a></p>
</article></main>
<footer class="footer"><div>© ${new Date().getFullYear()} ${SITE_OWNER}</div><div><a href="index.html">Home</a> · <a href="articoli.html">Articoli</a> · <a href="index.html#contatti">Contatti</a></div></footer>
<script>document.querySelector('.menu')?.addEventListener('click',()=>document.querySelector('.links')?.classList.toggle('open'));</script>
<script src="dark-mode.js"></script>
</body></html>`;
}

async function githubRequest(url: string, token: string, init?: RequestInit) {
  return fetch(url, {
    ...init,
    signal: AbortSignal.timeout(20000),
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init?.headers || {}),
    },
  });
}

async function getTextFile(owner: string, repo: string, path: string, branch: string, token: string) {
  const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${path.split("/").map(encodeURIComponent).join("/")}?ref=${encodeURIComponent(branch)}`;
  const res = await githubRequest(url, token);
  if (!res.ok) throw new Error(`Impossibile leggere ${path} da GitHub (HTTP ${res.status}).`);
  const data = await res.json();
  if (!data.content || data.encoding !== "base64") throw new Error(`Contenuto GitHub non leggibile: ${path}.`);
  return { content: Buffer.from(data.content.replace(/\n/g, ""), "base64").toString("utf8"), sha: data.sha };
}

async function putTextFile(owner: string, repo: string, path: string, branch: string, token: string, content: string, sha: string | undefined, message: string) {
  const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${path.split("/").map(encodeURIComponent).join("/")}`;
  const res = await githubRequest(url, token, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: message.slice(0, 120),
      content: Buffer.from(content, "utf8").toString("base64"),
      branch,
      ...(sha ? { sha } : {}),
    }),
  });
  if (!res.ok) throw new Error(`GitHub non ha salvato ${path} (HTTP ${res.status}).`);
  return res.json();
}

function addArticleCard(html: string, article: ArticleData, slug: string, description: string) {
  const href = `${slug}.html`;
  if (html.includes(`href="${href}"`)) return html;
  const start = html.indexOf('<section class="category" id="pensiero">');
  if (start < 0) throw new Error("Sezione Pensiero non trovata in articoli.html.");
  const end = html.indexOf("\n</div>\n</section>", start);
  if (end < 0) throw new Error("Griglia della sezione Pensiero non riconosciuta.");
  const card = `\n<article class="card"><div class="tag">Dal quaderno</div><h3>${escapeHtml(article.title)}</h3><p>${escapeHtml(description)}</p><a class="read" href="${href}">Leggi l'articolo →</a><div class="meta">Articolo · ${readingMinutes(article)} min</div></article>`;
  return html.slice(0, end) + card + html.slice(end);
}

function addSitemapUrl(xml: string, slug: string) {
  const url = `${SITE_BASE}/${slug}.html`;
  if (xml.includes(`<loc>${url}</loc>`)) return xml;
  if (!xml.includes("</urlset>")) throw new Error("Formato sitemap.xml non riconosciuto.");
  return xml.replace("</urlset>", `  <url><loc>${url}</loc></url>\n</urlset>`);
}

async function publishGenericGitHubPages(cfg: GhConfig, article: ArticleData): Promise<{ ok: boolean; message: string }> {
  const branch = cfg.branch || "main";
  const segments = (cfg.postsPath || "posts").split("/").filter(Boolean);
  if (!cfg.owner || !cfg.repo || !cfg.token || !segments.length ||
      segments.some(part => part === "." || part === ".." || !/^[a-zA-Z0-9_.-]+$/.test(part))) {
    return { ok: false, message: "Configurazione GitHub Pages non valida." };
  }
  const slug = `${slugify(article.title)}-${Date.now().toString(36)}`;
  const path = `${segments.join("/")}/${slug}.html`;
  const imageUrl = safeImageUrl(article.imageUrl);
  const cover = imageUrl
    ? `<img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(article.title)}" style="width:100%;height:auto">`
    : generateCoverArt(article.title);
  const body = (article.sections || []).map(s =>
    `<h2>${escapeHtml(s.heading)}</h2><p>${escapeHtml(s.body).replace(/\\n/g, "<br>")}</p>`
  ).join("\\n");
  const html = `<!doctype html><html lang="${article.language === "EN" ? "en" : "it"}"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(article.title)}</title><meta name="description" content="${escapeHtml(article.metaDescription || article.lead)}">
<meta property="og:title" content="${escapeHtml(article.title)}"><meta property="og:description" content="${escapeHtml(article.metaDescription || article.lead)}"><meta property="og:type" content="article">
${imageUrl ? `<meta property="og:image" content="${escapeHtml(imageUrl)}">` : ""}
</head><body><main style="max-width:760px;margin:40px auto;padding:0 20px;font:17px/1.7 system-ui,sans-serif">
<div>${cover}</div><h1>${escapeHtml(article.title)}</h1><p>${escapeHtml(article.lead)}</p>${body}
<p><strong>${escapeHtml(article.cta)}</strong></p></main></body></html>`;
  try {
    const res = await githubRequest(
      `https://api.github.com/repos/${encodeURIComponent(cfg.owner)}/${encodeURIComponent(cfg.repo)}/contents/${path.split("/").map(encodeURIComponent).join("/")}`,
      cfg.token,
      { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
        message: `Nuovo articolo: ${article.title.slice(0, 90)}`,
        content: Buffer.from(html, "utf8").toString("base64"),
        branch
      }) }
    );
    if (!res.ok) return { ok: false, message: `GitHub non ha pubblicato il file (HTTP ${res.status}).` };
    return { ok: true, message: `File HTML creato nel repository: ${path}` };
  } catch {
    return { ok: false, message: "Errore di rete durante la pubblicazione su GitHub." };
  }
}

export async function publishToGitHubPages(
  cfg: GhConfig,
  article: ArticleData
): Promise<{ ok: boolean; message: string }> {
  const branch = cfg.branch || "main";
  if (cfg.owner !== "mncusco" || cfg.repo !== "Blog") {
    return publishGenericGitHubPages(cfg, article);
  }
  if (!cfg.token) return { ok: false, message: "Token GitHub mancante." };
  if (!article.title?.trim() || !article.lead?.trim() || !Array.isArray(article.sections)) {
    return { ok: false, message: "Contenuto articolo incompleto." };
  }

  const slug = slugify(article.title);
  const path = `${slug}.html`;
  const publishedDate = new Intl.DateTimeFormat("it-IT", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date());
  const description = article.metaDescription?.trim() || article.lead;
  const page = renderHtml(article, slug, publishedDate);

  try {
    const existing = await githubRequest(
      `https://api.github.com/repos/mncusco/Blog/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(branch)}`,
      cfg.token
    );
    if (existing.ok) {
      return { ok: false, message: `Esiste già un articolo con questo titolo (${path}). Modifica il titolo prima di ripubblicare, per evitare sovrascritture.` };
    }
    if (existing.status !== 404) return { ok: false, message: `GitHub non ha potuto verificare il nome file (HTTP ${existing.status}).` };

    await putTextFile(cfg.owner, cfg.repo, path, branch, cfg.token, page, undefined, `Nuovo articolo: ${article.title}`);

    const catalogue = await getTextFile(cfg.owner, cfg.repo, "articoli.html", branch, cfg.token);
    const updatedCatalogue = addArticleCard(catalogue.content, article, slug, description);
    await putTextFile(cfg.owner, cfg.repo, "articoli.html", branch, cfg.token, updatedCatalogue, catalogue.sha, `Aggiungi articolo al catalogo: ${article.title}`);

    const sitemap = await getTextFile(cfg.owner, cfg.repo, "sitemap.xml", branch, cfg.token);
    const updatedSitemap = addSitemapUrl(sitemap.content, slug);
    await putTextFile(cfg.owner, cfg.repo, "sitemap.xml", branch, cfg.token, updatedSitemap, sitemap.sha, `Aggiorna sitemap: ${article.title}`);

    return { ok: true, message: `Articolo creato e inserito in articoli.html e sitemap.xml: ${SITE_BASE}/${path}` };
  } catch (e: any) {
    return { ok: false, message: e?.message || "Errore durante la pubblicazione sul blog GitHub Pages." };
  }
}
