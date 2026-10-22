// Porting di generator/engine.py: genera un articolo via Groq a partire da un template.

const TONES_IT = ["professionale", "ispiratore", "mistico", "informativo", "narrativo"];
const TONES_EN = ["professional", "inspiring", "mystical", "informative", "narrative"];

function extractJson(text: string): any {
  const cleaned = text.replace(/```(?:json)?\s*/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    // fallback: prova a isolare il primo oggetto { ... }
  }
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (match) {
    return JSON.parse(match[0]);
  }
  throw new Error(`Nessun JSON valido nella risposta del modello:\n${text.slice(0, 300)}`);
}

export async function generateArticle(opts: {
  template: { name: string; prompt: string; language: string };
  tone?: string;
  instructions?: string;
  brandVoice?: string;
}) {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY non impostata");

  const language = opts.template.language || "IT";
  const tones = language === "EN" ? TONES_EN : TONES_IT;
  const tone = opts.tone || tones[Math.floor(Math.random() * tones.length)];

  let prompt = opts.template.prompt
    .replaceAll("{language}", language)
    .replaceAll("{tone}", tone)
    .replaceAll("{instructions}", opts.instructions || "Nessuna istruzione speciale.");

  if (opts.brandVoice && opts.brandVoice.trim()) {
    prompt +=
      `\n\nScrivi imitando lo stile e il tono dei seguenti esempi reali tratti dai social di questa attività ` +
      `(stessa voce, stesso registro, stesse espressioni ricorrenti se coerenti col contesto):\n"""\n${opts.brandVoice.trim()}\n"""`;
  }

  prompt +=
    '\n\nRispondi STRETTAMENTE in formato JSON con questa struttura (nessun testo prima o dopo):\n' +
    '{"title": "...", "meta_description": "...", "lead": "...", ' +
    '"sections": [{"heading": "...", "body": "..."}], ' +
    '"cta": "...", "hashtags": ["...", "..."]}';

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: "openai/gpt-oss-120b",
      temperature: 0.7,
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq error ${res.status}: ${errText.slice(0, 300)}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content ?? "";
  const parsed = extractJson(content);

  return {
    title: parsed.title as string,
    meta_description: parsed.meta_description as string,
    lead: parsed.lead as string,
    sections: parsed.sections as { heading: string; body: string }[],
    cta: parsed.cta as string,
    hashtags: (parsed.hashtags as string[]) || [],
    tone,
    language,
  };
}
