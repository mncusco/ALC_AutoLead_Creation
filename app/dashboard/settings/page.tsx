"use client";

import { useEffect, useState } from "react";
import { AppNav } from "@/components/AppNav";

export default function SettingsPage() {
  const [url, setUrl] = useState("");
  const [username, setUsername] = useState("");
  const [appPassword, setAppPassword] = useState("");
  const [wpMessage, setWpMessage] = useState<string | null>(null);
  const [wpSaving, setWpSaving] = useState(false);

  const [ghOwner, setGhOwner] = useState("");
  const [ghRepo, setGhRepo] = useState("");
  const [ghBranch, setGhBranch] = useState("main");
  const [ghPostsPath, setGhPostsPath] = useState("posts");
  const [ghToken, setGhToken] = useState("");
  const [ghMessage, setGhMessage] = useState<string | null>(null);
  const [ghSaving, setGhSaving] = useState(false);

  const [brandVoice, setBrandVoice] = useState("");
  const [bvMessage, setBvMessage] = useState<string | null>(null);
  const [bvSaving, setBvSaving] = useState(false);

  useEffect(() => {
    fetch("/api/organization").then((r) => r.json()).then((d) => setBrandVoice(d.brandVoice || ""));
  }, []);

  async function handleWpSubmit(e: React.FormEvent) {
    e.preventDefault();
    setWpSaving(true);
    setWpMessage(null);
    const res = await fetch("/api/social-accounts/wordpress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, username, appPassword }),
    });
    setWpSaving(false);
    setWpMessage(res.ok ? "WordPress collegato." : "Errore nel salvataggio.");
  }

  async function handleGhSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGhSaving(true);
    setGhMessage(null);
    const res = await fetch("/api/social-accounts/github", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ owner: ghOwner, repo: ghRepo, branch: ghBranch, postsPath: ghPostsPath, token: ghToken }),
    });
    setGhSaving(false);
    setGhMessage(res.ok ? "Blog GitHub collegato." : "Errore nel salvataggio.");
  }

  async function handleBvSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBvSaving(true);
    setBvMessage(null);
    const res = await fetch("/api/organization", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ brandVoice }),
    });
    setBvSaving(false);
    setBvMessage(res.ok ? "Salvato." : "Errore nel salvataggio.");
  }

  return (
    <>
      <AppNav />
      <main className="app-main" style={{ maxWidth: 560 }}>
        <h1>Impostazioni</h1>

        <div className="card">
          <h2 style={{ marginTop: 0 }}>La tua voce</h2>
          <p style={{ fontSize: 14, color: "var(--ink-dim)" }}>
            Incolla qui alcuni post reali (LinkedIn, Facebook, Instagram) o testi che rappresentano come scrivi di solito.
            Il generatore li userà come riferimento di tono e stile. Il collegamento diretto ai social per leggerli
            automaticamente non è ancora attivo — richiede l&apos;approvazione delle rispettive piattaforme.
          </p>
          <form onSubmit={handleBvSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <textarea
              placeholder="Incolla qui 2-3 tuoi post o testi rappresentativi del tuo stile..."
              value={brandVoice}
              onChange={(e) => setBrandVoice(e.target.value)}
              rows={6}
            />
            <button type="submit" className="btn btn-primary" disabled={bvSaving}>{bvSaving ? "..." : "Salva"}</button>
          </form>
          {bvMessage && <p style={{ fontSize: 14, marginTop: 10 }}>{bvMessage}</p>}
        </div>

        <h2>Collega WordPress</h2>
        <div className="card">
          <p style={{ fontSize: 14, color: "var(--ink-dim)", marginTop: 0 }}>
            Serve una Application Password WordPress (Utenti → Profilo → Application Passwords).
          </p>
          <form onSubmit={handleWpSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input placeholder="URL sito (es. https://tuosito.com)" value={url} onChange={(e) => setUrl(e.target.value)} required />
            <input placeholder="Username WordPress" value={username} onChange={(e) => setUsername(e.target.value)} required />
            <input type="password" placeholder="Application Password" value={appPassword} onChange={(e) => setAppPassword(e.target.value)} required />
            <button type="submit" className="btn btn-primary" disabled={wpSaving}>{wpSaving ? "..." : "Salva"}</button>
          </form>
          {wpMessage && <p style={{ fontSize: 14, marginTop: 10 }}>{wpMessage}</p>}
        </div>

        <h2>Collega blog su GitHub Pages</h2>
        <div className="card">
          <p style={{ fontSize: 14, color: "var(--ink-dim)", marginTop: 0 }}>
            Ogni articolo pubblicato crea una nuova pagina nella cartella indicata, senza toccare il resto del sito.
            Serve un Personal Access Token GitHub con permesso "Contents: Read and write" sul repo.
          </p>
          <form onSubmit={handleGhSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <input placeholder="Owner (es. mncusco)" value={ghOwner} onChange={(e) => setGhOwner(e.target.value)} required />
            <input placeholder="Repo (es. Blog)" value={ghRepo} onChange={(e) => setGhRepo(e.target.value)} required />
            <input placeholder="Branch" value={ghBranch} onChange={(e) => setGhBranch(e.target.value)} />
            <input placeholder="Cartella articoli (es. posts)" value={ghPostsPath} onChange={(e) => setGhPostsPath(e.target.value)} />
            <input type="password" placeholder="GitHub Personal Access Token" value={ghToken} onChange={(e) => setGhToken(e.target.value)} required />
            <button type="submit" className="btn btn-primary" disabled={ghSaving}>{ghSaving ? "..." : "Salva"}</button>
          </form>
          {ghMessage && <p style={{ fontSize: 14, marginTop: 10 }}>{ghMessage}</p>}
        </div>

        <h2>LinkedIn / Facebook / Instagram / X</h2>
        <p className="empty-note">
          In arrivo — richiedono il collegamento OAuth con ciascuna piattaforma (serve approvazione app).
        </p>
      </main>
    </>
  );
}
