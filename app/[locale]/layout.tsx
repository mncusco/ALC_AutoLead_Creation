import "../globals.css";
import { dictionary, LOCALES, type Locale } from "@/lib/i18n/dictionary";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export function generateMetadata({ params }: { params: { locale: Locale } }) {
  const t = dictionary[params.locale] ?? dictionary.it;
  return { title: t.meta.title, description: t.meta.description };
}

export default function LocaleLayout({ children }: { children: React.ReactNode }) {
  return children;
}
