"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [organizationName, setOrganizationName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ organizationName, email, password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Errore durante la registrazione.");
      setLoading(false);
      return;
    }

    const signInRes = await signIn("credentials", { redirect: false, email, password });
    setLoading(false);
    if (signInRes?.error) {
      router.push("/login");
      return;
    }
    router.push("/dashboard");
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h1>Crea il tuo account</h1>
        <form onSubmit={handleSubmit}>
          <input placeholder="Nome azienda" value={organizationName} onChange={(e) => setOrganizationName(e.target.value)} required />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password (min 8 caratteri)" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
          {error && <p className="error">{error}</p>}
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>{loading ? "..." : "Registrati"}</button>
        </form>
        <p className="switch">Hai già un account? <a href="/login">Accedi</a></p>
      </div>
    </div>
  );
}
