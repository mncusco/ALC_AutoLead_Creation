"use client";

import { useEffect, useState } from "react";
import { AppNav } from "@/components/AppNav";
import { INTEGRATIONS, INTEGRATION_ORDER } from "@/lib/integrations";

export default function SettingsPage() {
  const [connected, setConnected] = useState<string[]>([]);
  const [openPlatform, setOpenPlatform] = useState<string | null>(null);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [brandVoice, setBrandVoice] = useState("");
  const [bvMessage, setBvMessage] = useState<string | null>(null);
  const [bvSaving, setBvSaving] = useState(false);

  async function loadConnected() {
    const res = await fetch("/api/social-accounts");
    const data = await res.json();
    setConnected(data.connected || []);
  }

  useEffect(() => {
    loadConnected();
    fetch("/api/organization").then((r) => r.json()).then((d) => setBrandVoice(d.brandVoice || ""));
  }, []);

  function openForm(platform: string) {
    setOpenPlatform(openPlatform === platform ? null : platform);
    setFormValues({});
    setMessage(null);
  }

  async function handleConnect(e: React.FormEvent, platform: string) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const res = await fetch("/api/social-accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform, fields: formValues }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setMessage(`Errore: ${data.error}`);
      return;
    }
    setOpenPlatform(null);
    loadConnected();
  }

  async function handleDisconnect(platform: string) {
    await fetch(`/api/social-accounts/${platform}`, { method: "DELETE" });
    loadConnected();
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
            Incolla alcuni post reali (LinkedIn, Facebook, Instagram) o testi rappresentativi del tuo stile:
            il generatore li userà come riferimento di tono.
          </p>
          <form onSubmit={handleBvSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <textarea value={brandVoice} onChange={(e) => setBrandVoice(e.target.value)} rows={6} />
            <button type="submit" className="btn btn-primary" disabled={bvSaving}>{bvSaving ? "..." : "Salva"}</button>
          </form>
          {bvMessage && <p style={{ fontSize: 14, marginTop: 10 }}>{bvMessage}</p>}
        </div>

        <h2>Piattaforme collegate</h2>
        <div className="card" style={{ padding: 0 }}>
          {INTEGRATION_ORDER.map((key, i) => {
            const def = INTEGRATIONS[key];
            const isConnected = connected.includes(key);
            const isOpen = openPlatform === key;
            return (
              <div key={key} style={{ borderTop: i === 0 ? "none" : "1px solid var(--line)", padding: "18px 24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <strong>{def.label}</strong>
                    {!def.publishSupported && (
                      <span style={{ fontSize: 12, color: "var(--gold)", marginLeft: 8 }}>pubblicazione non ancora attiva</span>
                    )}
                    {isConnected && <span className="status-pill success" style={{ marginLeft: 10 }}>collegato</span>}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {isConnected && (
                      <button onClick={() => handleDisconnect(key)} style={{ fontSize: 13 }}>Scollega</button>
                    )}
                    <button onClick={() => openForm(key)} style={{ fontSize: 13 }}>
                      {isConnected ? "Aggiorna" : "Collega"}
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <form onSubmit={(e) => handleConnect(e, key)} style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14 }}>
                    <p style={{ fontSize: 13, color: "var(--ink-dim)", margin: 0 }}>{def.help}</p>
                    {def.limitation && <p style={{ fontSize: 13, color: "var(--gold)", margin: 0 }}>{def.limitation}</p>}
                    {def.fields.map((f) => (
                      <input
                        key={f.key}
                        type={f.type}
                        placeholder={f.placeholder || f.label}
                        value={formValues[f.key] || ""}
                        onChange={(e) => setFormValues({ ...formValues, [f.key]: e.target.value })}
                        required
                      />
                    ))}
                    <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "..." : "Salva"}</button>
                  </form>
                )}
              </div>
            );
          })}
        </div>
        {message && <p style={{ fontSize: 14, marginTop: 10 }}>{message}</p>}
      </main>
    </>
  );
}
