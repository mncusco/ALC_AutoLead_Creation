"use client";

import { useState } from "react";

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
    <main style={{ maxWidth: 480, margin: "2rem auto", fontFamily: "system-ui", padding: "0 1rem" }}>
      <h1>Impostazioni</h1>
      <p><a href="/dashboard">← Dashboard</a></p>

      <h2>Collega WordPress</h2>
      <p style={{ fontSize: 14, color: "#555" }}>
        Serve una Application Password WordPress (Utenti → Profilo → Application Passwords).
      </p>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <input placeholder="URL sito (es. https://tuosito.com)" value={url} onChange={(e) => setUrl(e.target.value)} required />
        <input placeholder="Username WordPress" value={username} onChange={(e) => setUsername(e.target.value)} required />
        <input type="password" placeholder="Application Password" value={appPassword} onChange={(e) => setAppPassword(e.target.value)} required />
        <button type="submit" disabled={saving}>{saving ? "..." : "Salva"}</button>
      </form>
      {message && <p>{message}</p>}

      <h2 style={{ marginTop: 32 }}>LinkedIn / Facebook / Instagram</h2>
      <p style={{ fontSize: 14, color: "#555" }}>
        In arrivo — richiedono il collegamento OAuth con ciascuna piattaforma (serve approvazione app da parte di Meta/LinkedIn).
      </p>
    </main>
  );
}
