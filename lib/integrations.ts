// Registro unico delle piattaforme collegabili: definisce i campi richiesti
// per ciascuna, usato sia dall'interfaccia di connessione sia dalla validazione lato server.

export type FieldDef = { key: string; label: string; type: "text" | "password"; placeholder?: string };

export type IntegrationDef = {
  key: string;
  label: string;
  fields: FieldDef[];
  help: string;
  publishSupported: boolean;
  limitation?: string;
};

export const INTEGRATIONS: Record<string, IntegrationDef> = {
  wordpress: {
    key: "wordpress",
    label: "WordPress",
    publishSupported: true,
    fields: [
      { key: "url", label: "URL sito", type: "text", placeholder: "https://tuosito.com" },
      { key: "username", label: "Username", type: "text" },
      { key: "appPassword", label: "Application Password", type: "password" },
    ],
    help: "WordPress → Utenti → Profilo → Application Passwords.",
  },
  github_pages: {
    key: "github_pages",
    label: "Blog GitHub Pages",
    publishSupported: true,
    fields: [
      { key: "owner", label: "Owner", type: "text", placeholder: "es. mncusco" },
      { key: "repo", label: "Repo", type: "text", placeholder: "es. Blog" },
      { key: "branch", label: "Branch", type: "text", placeholder: "main" },
      { key: "postsPath", label: "Cartella articoli", type: "text", placeholder: "posts" },
      { key: "token", label: "Personal Access Token", type: "password" },
    ],
    help: "Token GitHub con permesso Contents: Read and write sul repo.",
  },
  facebook: {
    key: "facebook",
    label: "Facebook",
    publishSupported: true,
    fields: [
      { key: "pageId", label: "ID Pagina", type: "text" },
      { key: "pageAccessToken", label: "Page Access Token", type: "password" },
    ],
    help: "Meta for Developers → la tua app → Graph API Explorer: genera un Page Access Token di lunga durata per la pagina.",
  },
  linkedin: {
    key: "linkedin",
    label: "LinkedIn",
    publishSupported: true,
    fields: [
      { key: "organizationUrn", label: "Organization URN", type: "text", placeholder: "urn:li:organization:12345678" },
      { key: "accessToken", label: "Access Token", type: "password" },
    ],
    help: "LinkedIn Developer Portal → la tua app → token con permesso w_organization_social.",
  },
  instagram: {
    key: "instagram",
    label: "Instagram",
    publishSupported: true,
    limitation: "Richiede che l'articolo abbia trovato una foto (via Pexels) al momento della generazione — altrimenti la pubblicazione fallisce.",
    fields: [
      { key: "igUserId", label: "Instagram Business Account ID", type: "text" },
      { key: "accessToken", label: "Access Token", type: "password" },
    ],
    help: "Richiede un account Instagram Business collegato a una Pagina Facebook e un token della stessa app Meta.",
  },
  pinterest: {
    key: "pinterest",
    label: "Pinterest",
    publishSupported: true,
    limitation: "Richiede che l'articolo abbia trovato una foto (via Pexels) al momento della generazione — altrimenti la pubblicazione fallisce.",
    fields: [
      { key: "boardId", label: "ID Board", type: "text" },
      { key: "accessToken", label: "Access Token", type: "password" },
    ],
    help: "Pinterest Developers → la tua app → Access Token con scope pins:write.",
  },
};

export const INTEGRATION_ORDER = ["wordpress", "github_pages", "facebook", "linkedin", "instagram", "pinterest"];
