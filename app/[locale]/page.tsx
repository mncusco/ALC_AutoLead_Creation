import Link from "next/link";
import { dictionary, LOCALES, type Locale } from "@/lib/i18n/dictionary";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

function RidgeArt() {
  return (
    <svg className="ridge-art" viewBox="0 0 480 420" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 260 L70 170 L120 220 L190 110 L250 200 L300 150 L360 230 L420 160 L480 260 L480 420 L0 420 Z" fill="#19233b" />
      <path d="M0 300 L60 240 L130 290 L210 190 L270 270 L340 210 L400 280 L480 220 L480 420 L0 420 Z" fill="#141c30" />
      <path d="M40 330 Q240 280 440 340" stroke="#d9a94c" strokeWidth="1.5" opacity="0.55" fill="none" />
      <circle cx="380" cy="90" r="26" fill="#d9a94c" opacity="0.9" />
    </svg>
  );
}

export default function LandingPage({ params }: { params: { locale: Locale } }) {
  const locale = params.locale;
  const t = dictionary[locale] ?? dictionary.it;

  return (
    <main>
      <div className="site">
        <nav className="nav">
          <div className="wordmark">ALC AutoLead Creation</div>
          <div className="nav-links">
            <div className="lang-switch">
              {LOCALES.map((l) => (
                <Link key={l} href={`/${l}`} className={l === locale ? "active" : ""}>
                  {l.toUpperCase()}
                </Link>
              ))}
            </div>
            <Link href="/login">{t.nav.login}</Link>
            <Link href="/signup" className="btn btn-primary">{t.nav.cta}</Link>
          </div>
        </nav>

        <section className="hero">
          <div>
            <h1>{t.hero.headline}</h1>
            <p className="sub">{t.hero.sub}</p>
            <div className="ctas">
              <Link href="/signup" className="btn btn-primary">{t.hero.primaryCta}</Link>
              <Link href="/login" className="btn btn-ghost">{t.hero.secondaryCta}</Link>
            </div>
            <p className="note">{t.hero.note}</p>
          </div>
          <RidgeArt />
        </section>

        <section className="band">
          <h2>{t.problem.heading}</h2>
          <p className="lead">{t.problem.body}</p>
        </section>

        <section className="band">
          <h2>{t.features.heading}</h2>
          <div className="features">
            {t.features.items.map((f, i) => (
              <div className="item" key={i}>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="band">
          <h2>{t.how.heading}</h2>
          <div className="steps">
            {t.how.steps.map((s, i) => (
              <div className="step" key={i}>
                <div className="num">{String(i + 1).padStart(2, "0")}</div>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="band">
          <h2>{t.pricing.heading}</h2>
          <div className="pricing-grid">
            {t.pricing.tiers.map((p, i) => (
              <div className={`plan ${"highlight" in p && p.highlight ? "highlight" : ""}`} key={i}>
                <div className="name">{p.name}</div>
                <div className="price">{p.price}</div>
                {p.price !== t.pricing.tiers[2].price && <div className="period">{t.pricing.period}</div>}
                <div className="desc">{p.desc}</div>
                <ul>
                  {p.features.map((f, j) => (
                    <li key={j}>{f}</li>
                  ))}
                </ul>
                <Link href="/signup" className="btn btn-ghost" style={{ width: "100%", textAlign: "center" }}>
                  {t.pricing.cta}
                </Link>
              </div>
            ))}
          </div>
          <p className="price-note">{t.pricing.note}</p>
        </section>

        <section className="final">
          <h2>{t.final.heading}</h2>
          <Link href="/signup" className="btn btn-primary">{t.final.cta}</Link>
        </section>

        <footer>
          <div>ALC AutoLead Creation</div>
          <div>© {new Date().getFullYear()} — {t.footer.rights}</div>
        </footer>
      </div>
    </main>
  );
}
