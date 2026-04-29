# Discover Matrix

## Stack
- Next.js 15 con App Router
- TypeScript
- Tailwind CSS v4
- Claude claude-sonnet-4-6 (Anthropic SDK) per generazione titoli
- Deploy su Vercel (auto-deploy da main)

## Struttura directory
- `app/` — pagine e layout (App Router)
- `app/api/` — API routes (auth, generate)
- `components/` — componenti riutilizzabili (TitleCard, DiscoverPreview, CharCounter, OutletSelector, HistoryPanel)
- `lib/` — types, validation, prompts
- `middleware.ts` — protezione rotte /generator e /history

## Regole operative
- Branch di lavoro: `main` (push diretti)
- Dopo ogni sessione di modifiche: commit e push automatico su main
- Le variabili d'ambiente vanno in `.env.local` (non committare mai)
- Se aggiungi dipendenze: `npm install` prima del push

## Variabili d'ambiente necessarie
- `ANTHROPIC_API_KEY` — chiave API Anthropic
- `SECRET_CODE` — codice di accesso condiviso per il login

## Funzionalità principali
- Login via secret code condiviso (cookie HTTP-only, 30 giorni)
- Generazione titoli: due varianti (Preciso temp 0.4, Audace temp 0.9) in parallelo
- Tre outlet supportati: TGCOM24, Sport Mediaset, Infinity+
- Validazione CTR: lunghezza, citazioni dirette, nomi propri, verbi forti, grammatica
- Preview card Google Discover (mobile)
- Cronologia in localStorage (max 200 entries)
- Contatore caratteri real-time con sweet-spot visualizzato

## Note
- L'autenticazione è cookie-based; il middleware protegge /generator e /history
- La cronologia è client-side (localStorage), non richiede DB
- I titoli vengono generati in parallelo (Promise.all) per ridurre latenza
