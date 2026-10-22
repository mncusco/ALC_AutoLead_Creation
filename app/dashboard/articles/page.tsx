"use client";

import { useEffect, useState } from "react";
import { AppNav } from "@/components/AppNav";
import { generateCoverArt } from "@/lib/coverArt";

type Template = { id: string; name: string; label: string; language: string };
type ArticleContent = {
  lead: string;
  sections: { heading: string; body: string }[];
  cta: string;
  hashtags: string[];
};
type Article = {
  id: string;
  title: string;
  language: string;
  template: string;
  created_at: string;
  content: ArticleContent | string;
  last_status?: string | null;
};

function parseContent(c: Article["content"]): ArticleContent | null {
  if (!c) return null;
  if (typeof c === "string") {
    try { return JSON.parse(c); } catch { return null; }
  }
  return c;
}

function articleToText(title: string, content: ArticleContent) {
  const parts = [title, "", content.lead, ""];
  for (const s of content.sections || []) {
    parts.push(s.heading, s.body, "");
  }
  parts.push(content.cta, "", (content.hashtags || []).join(" "));
  return parts.join("\n");
}

export default function ArticlesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [templateId, setTemplateId] = useState("");
  const [instructions, setInstructions] = useState("");
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [publishing, setPublishing] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function loadTemplates() {
    const res = await fetch("/api/templates");
    const data = await res.json();
    setTemplates(data.templates || []);
    if (data.templates?.[0]) setTemplateId(data.templates[0].id);
  }

  async function loadArticles() {
    setListLoading(true);
    const res = await fetch("/api/articles");
    const data = await res.json();
    setArticles(data.articles || []);
    setListLoading(false);
  }

  useEffect(() => {
    loadTemplates();
    loadArticles();
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
    await loadArticles();
    setExpanded(data.article.id);
    setMessage(null);
  }

  async function handlePublish(articleId: string, platform: "wordpress" | "github") {
    setPublishing(articleId + platform);
    setMessage(null);
    const res = await fetch(`/api/articles/${articleId}/publish/${platform}`, { method: "POST" });
    const data = await res.json();
    setPublishing(null);
    const label = platform === "wordpress" ? "WordPress" : "GitHub";
    setMessage(data.ok ? `Pubblicato su ${label}: ${data.message}` : `Errore pubblicazione ${label}: ${data.error || data.message}`);
    loadArticles();
  }

  async function handleDelete(articleId: string) {
    if (!confirm("Eliminare questo articolo? L'azione non è reversibile.")) return;
    setDeleting(articleId);
    const res = await fetch(`/api/articles/${articleId}`, { method: "DELETE" });
    setDeleting(null);
    if (res.ok) {
      setArticles((prev) => prev.filter((a) => a.id !== articleId));
    } else {
      setMessage("Errore durante l'eliminazione.");
    }
  }

  async function handleCopy(article: Article, content: ArticleContent) {
    await navigator.clipboard.writeText(articleToText(article.title, content));
    setCopiedId(article.id);
    setTimeout(() => setCopiedId(null), 1800);
  }

  return (
    <>
      <AppNav />
      <main className="app-main">
        <h1>Articoli</h1>

        <div className="card">
          <form onSubmit={handleGenerate} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
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
            <button type="submit" className="btn btn-primary btn-block" disabled={loading || !templateId}>
              {loading ? "Generazione in corso..." : "Genera articolo"}
            </button>
          </form>
          {message && <p style={{ marginTop: 12, fontSize: 14 }}>{message}</p>}
        </div>

        <h2>Articoli generati</h2>

        {listLoading && <p style={{ color: "var(--ink-dim)" }}>Caricamento...</p>}
        {!listLoading && articles.length === 0 && (
          <p className="empty-note">Nessun articolo ancora. Generane uno con il modulo qui sopra.</p>
        )}

        {articles.map((a) => {
          const content = parseContent(a.content);
          const isOpen = expanded === a.id;
          return (
            <div className="article-card" key={a.id}>
              <div
                style={{ width: "100%", height: 90, borderRadius: 4, overflow: "hidden", marginBottom: 14 }}
                dangerouslySetInnerHTML={{ __html: generateCoverArt(a.title) }}
              />
              <div className="head">
                <div>
                  <p className="title">{a.title}</p>
                  <p className="meta">
                    {a.language} · {new Date(a.created_at).toLocaleString()}
                    {a.last_status && (
                      <> · <span className={`status-pill ${a.last_status}`}>{a.last_status === "success" ? "pubblicato" : "errore pubblicazione"}</span></>
                    )}
                  </p>
                </div>
                <div className="actions">
                  <button onClick={() => setExpanded(isOpen ? null : a.id)}>{isOpen ? "Chiudi" : "Leggi"}</button>
                  {content && (
                    <button onClick={() => handleCopy(a, content)}>{copiedId === a.id ? "Copiato ✓" : "Copia testo"}</button>
                  )}
                  <button onClick={() => handlePublish(a.id, "wordpress")} disabled={publishing === a.id + "wordpress"}>
                    {publishing === a.id + "wordpress" ? "..." : "Pubblica su WordPress"}
                  </button>
                  <button onClick={() => handlePublish(a.id, "github")} disabled={publishing === a.id + "github"}>
                    {publishing === a.id + "github" ? "..." : "Pubblica su GitHub"}
                  </button>
                  <button onClick={() => handleDelete(a.id)} disabled={deleting === a.id} style={{ color: "#e08a8a" }}>
                    {deleting === a.id ? "..." : "Elimina"}
                  </button>
                </div>
              </div>

              {isOpen && content && (
                <div className="body">
                  <p>{content.lead}</p>
                  {(content.sections || []).map((s, i) => (
                    <div key={i}>
                      <h3>{s.heading}</h3>
                      <p>{s.body}</p>
                    </div>
                  ))}
                  <p><strong style={{ color: "var(--ink)" }}>{content.cta}</strong></p>
                  {content.hashtags?.length > 0 && (
                    <p className="hashtags">{content.hashtags.join("  ")}</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </main>
    </>
  );
}
