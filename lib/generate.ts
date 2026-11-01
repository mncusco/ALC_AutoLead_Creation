// Porting di generator/engine.py: genera un articolo via Groq a partire da un template.

const TONES_IT = ["professionale", "ispiratore", "mistico", "informativo", "narrativo"];
const TONES_EN = ["professional", "inspiring", "mystical", "informative", "narrative"];

type GeneratedArticle = {
  title: string;
  meta_description: string;
  lead: string;
  sections: { heading: string; body: string }[];
  cta: string;
  hashtags: string[];
};

function extractJson(text: string): unknown {
  const cleaned = text
    .replace(/^\uFEFF/, "")
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    // Recover one balanced JSON object without greedily consuming later braces.
  }

  const start = cleaned.indexOf("{");
  if (start < 0) throw new Error("La risposta AI non contiene un oggetto JSON.");
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < cleaned.length; i++) {
    const char = cleaned[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === '"') inString = false;
      continue;
    }
    if (char === '"') inString = true;
    else if (char === "{") depth++;
    else if (char === "}") {
      depth--;
      if (depth === 0) return JSON.parse(cleaned.slice(start, i + 1));
    }
  }
  throw new Error("JSON incompleto o troncato nella risposta AI.");
}

function validateArticle(value: unknown): GeneratedArticle {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("La risposta AI non ha la struttura di un articolo.");
  }
  const item = value as Record<string, unknown>;
  const requiredText = ["title", "meta_description", "lead", "cta"] as const;
  for (const key of requiredText) {
    if (typeof item[key] !== "string" || !(item[key] as string).trim()) {
      throw new Error(`Campo AI mancante o non valido: ${key}`);
    }
  }
  if (!Array.isArray(item.sections) || item.sections.length === 0 ||
      !item.sections.every((section) =>
        !!section && typeof section === "object" &&
        typeof (section as any).heading === "string" &&
        typeof (section as any).body === "string"
      )) {
    throw new Error("La risposta AI non contiene sezioni valide.");
  }
  if (item.hashtags !== undefined &&
      (!Array.isArray(item.hashtags) || !item.hashtags.every((tag) => typeof tag === "string"))) {
    throw new Error("Il campo hashtags della risposta AI non è valido.");
  }

  return {
    title: (item.title as string).trim(),
    meta_description: (item.meta_description as string).trim().slice(0, 320),
    lead: (item.lead as string).trim(),
    sections: (item.sections as { heading: string; body: string }[]).map((section) => ({
      heading: section.heading.trim(),
      body: section.body.trim(),
    })),
    cta: (item.cta as string).trim(),
    hashtags: ((item.hashtags as string[]) || []).slice(0, 20),
  };
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

  if (opts.brandVoice?.trim()) {
    prompt +=
      `\n\nUsa questa voce del brand come riferimento stilistico, senza copiare affermazioni fattuali non verificate:\n"""${opts.brandVoice.trim()}\n"""`;
  }

  prompt +=
    '\n\nRispondi esclusivamente con JSON valido, senza Markdown o testo aggiuntivo. ' +
    'Non inventare dati, prezzi, disponibilità, orari o caratteristiche non presenti nel prompt. ' +
    'Struttura obbligatoria: ' +
    '{"title":"...","meta_description":"...","lead":"...","sections":[{"heading":"...","body":"..."}],"cta":"...","hashtags":["..."]}';

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    signal: AbortSignal.timeout(60000),
    body: JSON.stringify({
      model: "openai/gpt-oss-120b",
      temperature: 0.7,
      max_tokens: 3500,
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq error ${res.status}: ${errText.slice(0, 300)}`);
  }

  const data = await res.json();
  const content = data.choices?.[0]?.message?.content ?? "";
  if (typeof content !== "string" || !content.trim()) {
    throw new Error("Groq ha restituito una risposta vuota.");
  }
  const parsed = validateArticle(extractJson(content));

  return { ...parsed, tone, language };
}
