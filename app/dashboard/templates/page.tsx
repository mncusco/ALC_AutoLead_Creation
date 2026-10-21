"use client";

import { useEffect, useState } from "react";

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
    <main style={{ maxWidth: 720, margin: "2rem auto", fontFamily: "system-ui", padding: "0 1rem" }}>
      <h1>Template</h1>
      <p><a href="/dashboard">← Dashboard</a> · <a href="/dashboard/articles">Articoli</a></p>

      {!editing ? (
        <ul>
          {templates.map((t) => (
            <li key={t.id} style={{ marginBottom: 8 }}>
              <strong>{t.label}</strong> ({t.language}){" "}
              <button onClick={() => setEditing(t)}>Modifica</button>
            </li>
          ))}
        </ul>
      ) : (
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <input value={editing.label} onChange={(e) => setEditing({ ...editing, label: e.target.value })} placeholder="Etichetta" />
          <textarea
            value={editing.prompt}
            onChange={(e) => setEditing({ ...editing, prompt: e.target.value })}
            rows={14}
          />
          <div>
            <button type="submit" disabled={saving}>{saving ? "Salvataggio..." : "Salva"}</button>{" "}
            <button type="button" onClick={() => setEditing(null)}>Annulla</button>
          </div>
        </form>
      )}
    </main>
  );
}
