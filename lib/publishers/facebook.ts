type FbConfig = { pageId: string; pageAccessToken: string };
type ArticleData = { title: string; lead: string; cta: string; hashtags: string[] };

export async function publishToFacebook(cfg: FbConfig, article: ArticleData): Promise<{ ok: boolean; message: string }> {
  const message = [article.title, "", article.lead, "", article.cta, "", (article.hashtags || []).join(" ")]
    .join("\n")
    .trim();

  try {
    const res = await fetch(`https://graph.facebook.com/v19.0/${cfg.pageId}/feed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, access_token: cfg.pageAccessToken }),
    });
    if (res.ok) {
      const data = await res.json();
      return { ok: true, message: `OK (post ${data.id})` };
    }
    const text = await res.text();
    return { ok: false, message: `Facebook error ${res.status}: ${text.slice(0, 200)}` };
  } catch (e: any) {
    return { ok: false, message: e.message || "Errore di rete" };
  }
}
