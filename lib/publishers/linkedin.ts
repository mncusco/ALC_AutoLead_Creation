type LiConfig = { organizationUrn: string; accessToken: string };
type ArticleData = { title: string; lead: string; cta: string; hashtags: string[] };

export async function publishToLinkedIn(cfg: LiConfig, article: ArticleData): Promise<{ ok: boolean; message: string }> {
  const text = [article.title, "", article.lead, "", article.cta, "", (article.hashtags || []).join(" ")]
    .join("\n")
    .trim();

  const body = {
    author: cfg.organizationUrn,
    lifecycleState: "PUBLISHED",
    specificContent: {
      "com.linkedin.ugc.ShareContent": {
        shareCommentary: { text },
        shareMediaCategory: "NONE",
      },
    },
    visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
  };

  try {
    const res = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cfg.accessToken}`,
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const id = res.headers.get("x-restli-id") || "ok";
      return { ok: true, message: `OK (${id})` };
    }
    const text2 = await res.text();
    return { ok: false, message: `LinkedIn error ${res.status}: ${text2.slice(0, 200)}` };
  } catch (e: any) {
    return { ok: false, message: e.message || "Errore di rete" };
  }
}
