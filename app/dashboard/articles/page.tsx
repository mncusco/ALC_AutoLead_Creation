"use client";

import { useEffect, useState } from "react";

type Template = { id: string; name: string; label: string; language: string };
type Article = { id: string; title: string; language: string; template: string; created_at: string };

export default function ArticlesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [templateId, setTemplateId] = useState("");
  const [instructions, setInstructions] = useState("");
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function loadTemplates() {
    const res = await fetch("/api/templates");
    const data = await res.json();
    setTemplates(data.templates || []);
    if (data.templates?.[0]) setTemplateId(data.templates[0].id);
  }

  useEffect(() => {
    loadTemplates();
  }, []);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const res = await fetch("/api/articles/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ templateId, instructions }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setMessage(`Errore: ${data.error}`);
      return;
    }
    setArticles((prev) => [data.article, ...prev]);
    setMessage(`Generato: "${data.article.title}"`);
  }

  async function handlePublish(articleId: string) {
    setPublishing(articleId);
    setMessage(null);
    const res = await fetch(`/api/articles/${articleId}/publish/wordpress`, { method: "POST" });
    const data = await res.json();
    setPublishing(null);
    setMessage(data.ok ? `Pubblicato su WordPress: ${data.message}` : `Errore pubblicazione: ${data.error || data.message}`);
  }

  return (
    <main style={{ maxWidth: 720, margin: "2rem auto", fontFamily: "system-ui", padding: "0 1rem" }}>
      <h1>Articoli</h1>
      <p><a href="/dashboard">← Dashboard</a> · <a href="/dashboard/templates">Template</a> · <a href="/dashboard/settings">Impostazioni</a></p>

      <form onSubmit={handleGenerate} style={{ display: "flex", flexDirection: "column", gap: 8, margin: "1rem 0" }}>
        <select value={templateId} onChange={(e) => setTemplateId(e.target.value)} required>
          {templates.map((t) => (
            <option key={t.id} value={t.id}>{t.label}</option>
          ))}
        </select>
        <textarea
          placeholder="Istruzioni opzionali (es. argomento specifico, lunghezza, focus)"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          rows={3}
        />
        <button type="submit" disabled={loading || !templateId}>{loading ? "Generazione in corso..." : "Genera articolo"}</button>
      </form>

      {message && <p>{message}</p>}

      <h2>Articoli generati in questa sessione</h2>
      <ul>
        {articles.map((a) => (
          <li key={a.id} style={{ marginBottom: 8 }}>
            {a.title} ({a.language})
            {" "}
            <button onClick={() => handlePublish(a.id)} disabled={publishing === a.id}>
              {publishing === a.id ? "..." : "Pubblica su WordPress"}
            </button>
          </li>
        ))}
      </ul>
    </main>
  );
}
