// Template di partenza assegnati a ogni nuova organizzazione alla registrazione.
// Pensati per il settore travel/spirituale/esperienziale (il mercato target del prodotto),
// personalizzabili liberamente da ogni tenant in Impostazioni > Template.

export const STARTER_TEMPLATES = [
  {
    name: "guide",
    label: "Guida tematica",
    language: "IT",
    prompt: `Scrivi un articolo informativo in {language} su un tema rilevante per la tua attività (es. una pratica, una tradizione locale, un argomento che interessa i tuoi clienti).
Tono: {tone}, rispettoso, chiaro e onesto.

{instructions}

L'articolo deve includere:
1. Titolo chiaro e informativo
2. Meta description da 160 caratteri
3. Introduzione che spiega il contesto
4. 3-5 sezioni con sottotitoli che approfondiscono l'argomento
5. Un'offerta o lead magnet pertinente
6. CTA finale
7. hashtag`,
  },
  {
    name: "offer",
    label: "Presentazione di un'esperienza/servizio",
    language: "IT",
    prompt: `Scrivi un articolo di blog in {language} che presenta un'esperienza, un ritiro o un servizio della tua attività.
Tono: {tone}, professionale ma accessibile, che ispiri fiducia.
Lunghezza: 800-1200 parole.

{instructions}

L'articolo deve includere:
1. Titolo accattivante (con SEO in mente)
2. Meta description di max 160 caratteri
3. Lead emotivo che catturi l'attenzione
4. Sezioni: il luogo/contesto, cosa include l'esperienza, la preparazione richiesta, chi la guida, cosa porta a casa il partecipante
5. CTA finale per richiedere informazioni
6. hashtag per social media`,
  },
  {
    name: "destination",
    label: "Guida di viaggio/destinazione",
    language: "IT",
    prompt: `Scrivi un articolo di viaggio in {language} su una destinazione rilevante per la tua attività.
Tono: {tone}, evocativo ma concreto.

{instructions}

L'articolo deve includere:
1. Titolo accattivante
2. Meta description da 160 caratteri
3. Lead che trasporti il lettore
4. 3-5 sezioni su luoghi/esperienze diverse della destinazione
5. Consigli pratici (quando andare, come prepararsi)
6. CTA finale
7. hashtag`,
  },
];
