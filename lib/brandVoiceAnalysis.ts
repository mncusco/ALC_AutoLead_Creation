// Analizza la "voce del brand" a partire dal sito web o dai post Facebook già collegati,
// invece di farli incollare a mano dal cliente.

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<\/(p|div|h[1-6]|li|br)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

export async function fetchWebsiteText(url: string): Promise<string> {
  const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (compatible; ALCAutoLeadBot/1.0)" } });
  if (!res.ok) throw new Error(`Impossibile leggere il sito (${res.status})`);
  const html = await res.text();
  return stripHtml(html).slice(0, 8000);
}

export async function fetchFacebookPostsText(pageId: string, accessToken: string): Promise<string> {
  const res = await fetch(
    `https://graph.facebook.com/v19.0/${pageId}/posts?fields=message&limit=15&access_token=${accessToken}`
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Impossibile leggere i post Facebook: ${text.slice(0, 200)}`);
  }
  const data = await res.json();
  const messages = (data.data || []).map((p: any) => p.message).filter(Boolean);
  if (messages.length === 0) throw new Error("Nessun post con testo trovato su questa Pagina.");
  return messages.join("\n---\n").slice(0, 8000);
}

export async function analyzeVoice(sourceText: string): Promise<string> {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY non impostata");

  const prompt = `Analizza il seguente testo, preso dal sito o dai social di un'attività, e descrivi in 150-200 parole il suo stile comunicativo: tono di voce (es. formale/informale/ispiratore/diretto), registro, espressioni o parole ricorrenti, lunghezza e struttura tipica delle frasi, uso di emoji o punteggiatura particolare. Scrivi la descrizione come un'istruzione di stile riutilizzabile per generare nuovi contenuti che suonino scritti dalla stessa persona/attività — non riassumere i contenuti, descrivi SOLO lo stile.

TESTO:
"""
${sourceText}
"""

Rispondi solo con la descrizione dello stile, in italiano, senza introduzioni.`;

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: "openai/gpt-oss-120b",
      temperature: 0.4,
      max_tokens: 500,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Groq error ${res.status}: ${text.slice(0, 200)}`);
  }
  const data = await res.json();
  return (data.choices?.[0]?.message?.content || "").trim();
}
