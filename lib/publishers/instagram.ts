type IgConfig = { igUserId: string; accessToken: string };
type ArticleData = { title: string; lead: string; cta: string; hashtags: string[]; imageUrl?: string | null };

export async function publishToInstagram(cfg: IgConfig, article: ArticleData): Promise<{ ok: boolean; message: string }> {
  if (!article.imageUrl) {
    return { ok: false, message: "Nessuna immagine disponibile per questo articolo: Instagram richiede un'immagine." };
  }

  const caption = [article.title, "", article.lead, "", article.cta, "", (article.hashtags || []).join(" ")]
    .join("\n")
    .trim();

  try {
    const createRes = await fetch(`https://graph.facebook.com/v19.0/${cfg.igUserId}/media`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image_url: article.imageUrl, caption, access_token: cfg.accessToken }),
    });
    if (!createRes.ok) {
      const text = await createRes.text();
      return { ok: false, message: `Instagram error (creazione) ${createRes.status}: ${text.slice(0, 200)}` };
    }
    const created = await createRes.json();

    const publishRes = await fetch(`https://graph.facebook.com/v19.0/${cfg.igUserId}/media_publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ creation_id: created.id, access_token: cfg.accessToken }),
    });
    if (!publishRes.ok) {
      const text = await publishRes.text();
      return { ok: false, message: `Instagram error (pubblicazione) ${publishRes.status}: ${text.slice(0, 200)}` };
    }
    const published = await publishRes.json();
    return { ok: true, message: `OK (post ${published.id})` };
  } catch (e: any) {
    return { ok: false, message: e.message || "Errore di rete" };
  }
}
