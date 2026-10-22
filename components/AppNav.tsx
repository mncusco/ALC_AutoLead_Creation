"use client";

import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import Link from "next/link";

const LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/articles", label: "Articoli" },
  { href: "/dashboard/templates", label: "Template" },
  { href: "/dashboard/settings", label: "Impostazioni" },
];

export function AppNav() {
  const pathname = usePathname();
  return (
    <nav className="app-nav">
      <div className="wordmark">ALC AutoLead Creation</div>
      <div className="links">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} className={pathname === l.href ? "active" : ""}>
            {l.label}
          </Link>
        ))}
        <button className="signout" onClick={() => signOut({ callbackUrl: "/login" })}>Esci</button>
      </div>
    </nav>
  );
}
