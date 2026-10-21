export type Locale = "it" | "en" | "es";

export const LOCALES: Locale[] = ["it", "en", "es"];

export const dictionary = {
  it: {
    meta: {
      title: "ALC AutoLead Creation — contenuti e pubblicazioni automatiche per il travel esperienziale",
      description:
        "La piattaforma che scrive e pubblica i contenuti del tuo ritiro, viaggio o esperienza, con report chiari su cosa è uscito e dove.",
    },
    nav: { login: "Accedi", cta: "Inizia la prova" },
    hero: {
      headline: "Il tuo prossimo articolo è già scritto. Manca solo che lo pubblichi tu, o lo facciamo noi.",
      sub: "ALC AutoLead Creation genera e pubblica i contenuti della tua attività di viaggio o ritiro esperienziale, e ti mostra ogni settimana cosa è uscito, dove, e come è andata.",
      primaryCta: "Inizia la prova gratuita",
      secondaryCta: "Accedi",
      note: "Nessuna carta richiesta per iniziare.",
    },
    problem: {
      heading: "Scrivere è il lavoro che salta sempre",
      body: "Gestisci un ritiro, un'esperienza, un viaggio. I contenuti servono — per i motori di ricerca, per i social, per chi sta decidendo se partire — ma sono il primo compito che si rimanda. Finché il calendario editoriale è vuoto da un mese.",
    },
    features: {
      heading: "Cosa fa per te",
      items: [
        {
          title: "Scrive nel tuo settore",
          body: "Template pensati per esperienze di viaggio, ritiri e pratiche — non articoli generici. Li modifichi liberamente per adattarli alla tua voce.",
        },
        {
          title: "Pubblica dove conta",
          body: "Collega il tuo sito WordPress e pubblica con un click. Social in arrivo.",
        },
        {
          title: "Ti mostra cosa è successo",
          body: "Una dashboard con lo storico di ogni pubblicazione: piattaforma, esito, data. Niente sorprese a fine mese.",
        },
      ],
    },
    how: {
      heading: "Come funziona",
      steps: [
        { title: "Scegli un template", body: "Guida, presentazione di un'esperienza, o guida di destinazione." },
        { title: "Genera l'articolo", body: "Il testo è pronto in pochi secondi, nella tua lingua e nel tuo tono." },
        { title: "Pubblica e controlla", body: "Un click per pubblicare, un grafico per vedere il risultato." },
      ],
    },
    pricing: {
      heading: "Prezzi",
      note: "Indicativi — attivi un abbonamento quando sei pronto, nessun vincolo.",
      period: "/mese",
      cta: "Inizia la prova",
      tiers: [
        { name: "Starter", price: "€49", desc: "Per chi inizia a strutturare i contenuti.", features: ["20 articoli/mese", "1 sito collegato", "Dashboard pubblicazioni"] },
        { name: "Growth", price: "€149", desc: "Per chi pubblica con costanza.", features: ["100 articoli/mese", "3 siti/canali collegati", "Template illimitati", "Supporto prioritario"], highlight: true },
        { name: "Scale", price: "Su misura", desc: "Per agenzie e operatori con più brand.", features: ["Volumi personalizzati", "Più organizzazioni", "Onboarding dedicato"] },
      ],
    },
    final: {
      heading: "Il prossimo articolo può essere pronto tra cinque minuti.",
      cta: "Inizia la prova gratuita",
    },
    footer: { rights: "Tutti i diritti riservati." },
  },
  en: {
    meta: {
      title: "ALC AutoLead Creation — content and publishing for experiential travel",
      description:
        "The platform that writes and publishes content for your retreat, trip or experience, with clear reports on what went out and where.",
    },
    nav: { login: "Log in", cta: "Start free trial" },
    hero: {
      headline: "Your next article is already written. You just have to publish it — or let us.",
      sub: "ALC AutoLead Creation generates and publishes content for your travel or retreat business, and shows you every week what went out, where, and how it did.",
      primaryCta: "Start your free trial",
      secondaryCta: "Log in",
      note: "No card required to start.",
    },
    problem: {
      heading: "Writing is the task that always slips",
      body: "You run a retreat, an experience, a trip. Content matters — for search, for social, for people deciding whether to go — but it's the first thing you postpone. Until the editorial calendar has been empty for a month.",
    },
    features: {
      heading: "What it does for you",
      items: [
        {
          title: "Writes for your field",
          body: "Templates built for travel experiences, retreats and practices — not generic articles. Edit them freely to match your voice.",
        },
        {
          title: "Publishes where it matters",
          body: "Connect your WordPress site and publish in one click. Social platforms coming soon.",
        },
        {
          title: "Shows you what happened",
          body: "A dashboard with the history of every publication: platform, outcome, date. No surprises at month end.",
        },
      ],
    },
    how: {
      heading: "How it works",
      steps: [
        { title: "Pick a template", body: "A guide, an experience showcase, or a destination guide." },
        { title: "Generate the article", body: "Text is ready in seconds, in your language and tone." },
        { title: "Publish and check", body: "One click to publish, one chart to see the result." },
      ],
    },
    pricing: {
      heading: "Pricing",
      note: "Indicative — activate a subscription whenever you're ready, no lock-in.",
      period: "/month",
      cta: "Start free trial",
      tiers: [
        { name: "Starter", price: "$49", desc: "For teams starting to structure their content.", features: ["20 articles/month", "1 connected site", "Publication dashboard"] },
        { name: "Growth", price: "$149", desc: "For teams publishing consistently.", features: ["100 articles/month", "3 connected sites/channels", "Unlimited templates", "Priority support"], highlight: true },
        { name: "Scale", price: "Custom", desc: "For agencies and operators with multiple brands.", features: ["Custom volumes", "Multiple organizations", "Dedicated onboarding"] },
      ],
    },
    final: {
      heading: "Your next article could be ready in five minutes.",
      cta: "Start your free trial",
    },
    footer: { rights: "All rights reserved." },
  },
  es: {
    meta: {
      title: "ALC AutoLead Creation — contenidos y publicación para el viaje experiencial",
      description:
        "La plataforma que escribe y publica los contenidos de tu retiro, viaje o experiencia, con informes claros sobre qué se publicó y dónde.",
    },
    nav: { login: "Entrar", cta: "Empieza la prueba" },
    hero: {
      headline: "Tu próximo artículo ya está escrito. Solo falta publicarlo — o lo hacemos nosotros.",
      sub: "ALC AutoLead Creation genera y publica los contenidos de tu negocio de viajes o retiros, y te muestra cada semana qué se publicó, dónde, y cómo funcionó.",
      primaryCta: "Empieza tu prueba gratuita",
      secondaryCta: "Entrar",
      note: "No se requiere tarjeta para empezar.",
    },
    problem: {
      heading: "Escribir es la tarea que siempre se posterga",
      body: "Gestionas un retiro, una experiencia, un viaje. Los contenidos importan — para las búsquedas, para las redes, para quien está decidiendo si viajar — pero son lo primero que se aplaza. Hasta que el calendario editorial lleva un mes vacío.",
    },
    features: {
      heading: "Qué hace por ti",
      items: [
        {
          title: "Escribe para tu sector",
          body: "Plantillas pensadas para experiencias de viaje, retiros y prácticas — no artículos genéricos. Las editas libremente para adaptarlas a tu voz.",
        },
        {
          title: "Publica donde importa",
          body: "Conecta tu sitio WordPress y publica con un clic. Redes sociales próximamente.",
        },
        {
          title: "Te muestra qué pasó",
          body: "Un panel con el historial de cada publicación: plataforma, resultado, fecha. Sin sorpresas a fin de mes.",
        },
      ],
    },
    how: {
      heading: "Cómo funciona",
      steps: [
        { title: "Elige una plantilla", body: "Una guía, la presentación de una experiencia, o una guía de destino." },
        { title: "Genera el artículo", body: "El texto está listo en segundos, en tu idioma y tono." },
        { title: "Publica y comprueba", body: "Un clic para publicar, un gráfico para ver el resultado." },
      ],
    },
    pricing: {
      heading: "Precios",
      note: "Orientativos — activa una suscripción cuando estés listo, sin permanencia.",
      period: "/mes",
      cta: "Empieza la prueba",
      tiers: [
        { name: "Starter", price: "49 €", desc: "Para quienes empiezan a estructurar sus contenidos.", features: ["20 artículos/mes", "1 sitio conectado", "Panel de publicaciones"] },
        { name: "Growth", price: "149 €", desc: "Para quienes publican con constancia.", features: ["100 artículos/mes", "3 sitios/canales conectados", "Plantillas ilimitadas", "Soporte prioritario"], highlight: true },
        { name: "Scale", price: "A medida", desc: "Para agencias y operadores con varias marcas.", features: ["Volúmenes personalizados", "Varias organizaciones", "Incorporación dedicada"] },
      ],
    },
    final: {
      heading: "Tu próximo artículo puede estar listo en cinco minutos.",
      cta: "Empieza tu prueba gratuita",
    },
    footer: { rights: "Todos los derechos reservados." },
  },
} as const;
