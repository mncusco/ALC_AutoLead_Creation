type PinConfig = { boardId: string; accessToken: string };
type ArticleData = { title: string; lead: string; imageUrl?: string | null };

export async function publishToPinterest(cfg: PinConfig, article: ArticleData): Promise<{ ok: boolean; message: string }> {
  if (!article.imageUrl) {
    return { ok: false, message: "Nessuna immagine disponibile per questo articolo: Pinterest richiede un'immagine." };
  }

  try {
    const res = await fetch("https://api.pinterest.com/v5/pins", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cfg.accessToken}`,
      },
      body: JSON.stringify({
        board_id: cfg.boardId,
        title: article.title,
        description: article.lead,
        media_source: { source_type: "image_url", url: article.imageUrl },
      }),
    });
    if (res.ok) {
      const data = await res.json();
      return { ok: true, message: `OK (pin ${data.id})` };
    }
    const text = await res.text();
    return { ok: false, message: `Pinterest error ${res.status}: ${text.slice(0, 200)}` };
  } catch (e: any) {
    return { ok: false, message: e.message || "Errore di rete" };
  }
}
