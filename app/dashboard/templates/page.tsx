"use client";

import { useEffect, useState } from "react";
import { AppNav } from "@/components/AppNav";

type Template = { id: string; name: string; label: string; language: string; prompt: string };

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [editing, setEditing] = useState<Template | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    const res = await fetch("/api/templates");
    const data = await res.json();
    setTemplates(data.templates || []);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    await fetch("/api/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    setSaving(false);
    setEditing(null);
    load();
  }

  return (
    <>
      <AppNav />
      <main className="app-main">
        <h1>Template</h1>

        {!editing ? (
          <div className="card">
            {templates.map((t, i) => (
              <div
                key={t.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "14px 0",
                  borderTop: i === 0 ? "none" : "1px solid var(--line)",
                }}
              >
                <div>
                  <strong>{t.label}</strong>
                  <span style={{ color: "var(--ink-dim)", marginLeft: 8, fontSize: 13 }}>{t.language}</span>
                </div>
                <button onClick={() => setEditing(t)}>Modifica</button>
              </div>
            ))}
          </div>
        ) : (
          <div className="card">
            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input value={editing.label} onChange={(e) => setEditing({ ...editing, label: e.target.value })} placeholder="Etichetta" />
              <textarea
                value={editing.prompt}
                onChange={(e) => setEditing({ ...editing, prompt: e.target.value })}
                rows={16}
                style={{ fontFamily: "monospace", fontSize: 13 }}
              />
              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Salvataggio..." : "Salva"}</button>
                <button type="button" className="btn btn-ghost" onClick={() => setEditing(null)}>Annulla</button>
              </div>
            </form>
          </div>
        )}
      </main>
    </>
  );
}
