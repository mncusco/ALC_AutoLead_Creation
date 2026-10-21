# ALC AutoLead Creation

Piattaforma SaaS multi-tenant per content automation (generazione + pubblicazione su social/WordPress), con dashboard, report pubblicazioni e abbonamenti.

## Setup
1. `npm install`
2. Copia `.env.example` in `.env.local` e inserisci `DATABASE_URL` (Neon)
3. Esegui `db/schema.sql` sul database Neon
4. `npm run dev`

## Auth
- Signup: `/signup` (crea organizzazione + primo utente)
- Login: `/login`
- Dashboard protetta: `/dashboard` (richiede `NEXTAUTH_SECRET` impostato)

Genera `NEXTAUTH_SECRET` con: `openssl rand -base64 32`
