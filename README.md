# ALC AutoLead Creation

Piattaforma SaaS multi-tenant per content automation: generazione di articoli, gestione della voce del brand e pubblicazione sui canali collegati.

## Setup locale

1. `npm install`
2. Copia `.env.example` in `.env.local`
3. Configura almeno `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `GROQ_API_KEY` e `INTEGRATION_ENCRYPTION_KEY`
4. Per generare la chiave di cifratura delle credenziali: `openssl rand -hex 32`
5. Su un database nuovo, esegui `db/schema.sql`
6. Su un database esistente, esegui prima un backup e poi valuta/applica le migrazioni in `db/migrations/`
7. `npm run dev`

## Sicurezza delle integrazioni

Le nuove connessioni social vengono cifrate lato server con AES-256-GCM. La chiave `INTEGRATION_ENCRYPTION_KEY` deve essere una stringa esadecimale di 64 caratteri e va impostata nei secret dell'ambiente di deploy. Non inserirla nel repository e non condividerla in chat.

Le connessioni legacy salvate nel precedente campo JSON restano leggibili durante la transizione; quando vengono aggiornate, la nuova configurazione viene salvata cifrata. Prima di distribuire il codice, impostare la chiave nell'ambiente Vercel. Se manca, il salvataggio di nuove connessioni viene rifiutato senza cancellare quelle esistenti.

## Database

`db/schema.sql` descrive lo schema per installazioni nuove. Per database già esistenti, non rieseguire lo schema iniziale: esaminare e applicare le migrazioni additive una alla volta dopo backup. La migrazione `001_app_schema_alignment.sql` aggiunge i campi e la tabella template già utilizzati dall'applicazione. Non viene eseguita automaticamente dal codice.

## Autenticazione

- Signup: `/signup`
- Login: `/login`
- Dashboard protetta: `/dashboard` (richiede `NEXTAUTH_SECRET`)

Genera `NEXTAUTH_SECRET` con: `openssl rand -base64 32`

## Pubblicazione GitHub Pages

Il publisher attuale crea un file HTML statico nella cartella configurata. Prima di usarlo su un blog esistente, verificare il motore statico e il percorso corretto dei post (ad esempio Jekyll, Hugo o Astro): la semplice creazione del file nel repository non garantisce che il blog lo indicizzi o lo mostri.
