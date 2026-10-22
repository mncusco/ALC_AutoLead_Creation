"use client";

import { useState } from "react";
import { AppNav } from "@/components/AppNav";

export default function SettingsPage() {
  const [url, setUrl] = useState("");
  const [username, setUsername] = useState("");
  const [appPassword, setAppPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const res = await fetch("/api/social-accounts/wordpress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, username, appPassword }),
    });
    setSaving(false);
    setMessage(res.ok ? "WordPress collegato." : "Errore nel salvataggio.");
  }

  return (
    <>
      <AppNav />
      <main className="app-main" style={{ maxWidth: 520 }}>
        <h1>Impostazioni</h1>

        <div className="card">
          <h2 style={{ marginTop: 0 }}>Collega WordPress</h2>
          <p style={{ fontSize: 14, color: "var(--ink-dim)" }}>
            Serve una Application Password WordPress (Utenti → Profilo → Application Passwords). Senza questo collegamento puoi comunque generare articoli e copiarne il testo.
          </p>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input placeholder="URL sito (es. https://tuosito.com)" value={url} onChange={(e) => setUrl(e.target.value)} required />
            <input placeholder="Username WordPress" value={username} onChange={(e) => setUsername(e.target.value)} required />
            <input type="password" placeholder="Application Password" value={appPassword} onChange={(e) => setAppPassword(e.target.value)} required />
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "..." : "Salva"}</button>
          </form>
          {message && <p style={{ fontSize: 14, marginTop: 10 }}>{message}</p>}
        </div>

        <h2>LinkedIn / Facebook / Instagram</h2>
        <p className="empty-note">
          In arrivo — richiedono il collegamento OAuth con ciascuna piattaforma (serve approvazione app da parte di Meta/LinkedIn).
        </p>
      </main>
    </>
  );
}
