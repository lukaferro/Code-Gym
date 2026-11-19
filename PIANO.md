# Code-Gym: piano del progetto

App personale per tenermi allenato nella programmazione e prepararmi ai colloqui tecnici, con tutor IA, dashboard e obiettivi. Uso solo personale, tutto in cloud gratuito.

> Questo file va tenuto aggiornato: la sezione "Stato" si modifica a ogni passo completato.

## Perché esiste

Nel lavoro l'IA scrive gran parte del codice e io non programmo più a mano. L'app serve a:

- allenarmi con esercizi che scrivo io, con test automatici;
- imparare dagli errori con un tutor IA che dà indizi progressivi;
- misurare i progressi (statistiche, punti deboli, dashboard, obiettivi);
- prepararmi ai colloqui (teoria, live coding, mock interview, inglese tecnico, Git);
- restare costante con un coach su Telegram (fase finale).

## Regola d'oro

Scrivo io a mano le parti centrali (runner, logica dei tentativi, dashboard). L'IA spiega, dà indizi e rivede il mio codice: non scrive le soluzioni al posto mio.

## Decisioni prese

- Interfaccia: React + TypeScript (Vite), pubblicata su Vercel.
- Backend: funzioni serverless di Vercel nella cartella `api/`.
- IA gratuita con fallback: Gemini, poi Groq, poi OpenRouter (modelli `:free`).
- Accesso all'API protetto da una password inviata nell'header `x-app-password`.
- Database: Turso (SQLite ospitato), scelto invece di Supabase perché i progetti gratuiti Supabase si mettono in pausa dopo una settimana di inattività e auth/storage non servono.
- Esecuzione del codice: JS/TS nel browser (Web Worker), Python con Pyodide più avanti; C# e Java quando avrò un server (Raspberry).
- Bot Telegram come ultima fase; in futuro tutto può migrare su un Raspberry.

## Architettura

| Pezzo | Dove |
|---|---|
| Pagina React | `src/App.tsx` |
| Esercizi (dati) | `src/esercizi.ts` |
| Runner dei test | `src/runner.ts` |
| API con fallback tra provider | `api/ai.ts` |
| Controllo della password | dentro `api/ai.ts` e `api/tentativi.ts` (copiato) |
| Database Turso (SQLite) | `lib/db.ts` per gli script; dentro `api/tentativi.ts` per l'endpoint |
| API dei tentativi | `api/tentativi.ts` |
| Script di prova locali | `scripts/prova.mjs`, `scripts/prova-handler.ts`, `scripts/prova-online.mjs` |

Gli endpoint dentro `api/` sono autosufficienti: Vercel non spedisce i file condivisi messi in `api/` e non risolve gli import verso `lib/`. Per questo la password, il tipo `Tentativo` e l'accesso al database sono duplicati lì dentro: le copie vanno tenute allineate con `lib/db.ts` e `src/tipi.ts`.

API: `POST /api/ai`, header `x-app-password`, body `{ "messages": [{ "role": "user", "content": "..." }] }`, risposta `{ "provider": "...", "text": "..." }`.

Variabili d'ambiente (nomi, mai i valori): `GEMINI_API_KEY`, `GROQ_API_KEY`, `OPENROUTER_API_KEY`, `APP_PASSWORD`, `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`. Stanno in `.env.local` e nelle impostazioni di Vercel.

## Stato

- [x] Fase 0: progetto React, repo GitHub, deploy Vercel, chiavi gratuite, `api/ai.ts` con fallback e password, pagina collegata all'API
- [x] Fase 1: esercizi, runner con test, editor Monaco, salvataggio dei tentativi
- [x] Bottone "Esegui test" e risultati mostrati nella pagina
- [x] Web Worker con limite di tempo (ciclo infinito)
- [x] Selettore dell'esercizio nella pagina
- [x] Altri esercizi (almeno 20)
- [x] Salvataggio dei tentativi (modulo `db.ts`)
- [x] Password ricordata dal browser (`localStorage`)

## Fasi

### Fase 1: esercizi
Editor Monaco, runner con test, 20 esercizi in dati, salvataggio dei tentativi.

### Fase 2: tutor IA
Pulsante "Aiutami" con tre livelli: indizio vago, indizio mirato, spiegazione completa. L'IA risponde in JSON con spiegazione e tag dell'errore (`async`, `array`, `complessità`...). Il prompt vieta la soluzione completa prima del livello 3. Generazione di nuovi esercizi su un argomento debole.

### Fase 3: dashboard
Streak, esercizi svolti, tasso di successo, tempo medio, indizi usati, livello per argomento, andamento nel tempo, errori più frequenti.

### Fase 4: memoria, piano e obiettivi
Statistiche aggregate per argomento e per tag di errore, profilo dello studente rigenerato ogni settimana (poche righe), obiettivi, piano settimanale con ripasso a intervalli. All'IA passo solo profilo, statistiche dell'argomento e ultimi errori simili.

### Fase 5: teoria, altri linguaggi, Git e inglese
Domande teoriche valutate dall'IA, Python con Pyodide, live coding cronometrato, mock interview. Git (peso piccolo): scenari sui comandi. Inglese tecnico (importante): glossario, scrittura, lettura, parlato, "modalità inglese" su ogni esercizio, aiuto in italiano quando non capisco.

### Fase 6: coach Telegram
Pillole (massimo 1-2 al giorno), chat libera con le mie statistiche, comandi `/oggi`, `/stato`, `/pausa`, pillola di inglese del giorno.

## Modello dati minimo

`Esercizio`, `Tentativo` (esito, tempo, indizi, tag errore), `StatArgomento`, `Obiettivo`, `ProfiloStudente`, `PianoSettimana`.

## Attenzioni

- I limiti dei piani gratuiti cambiano senza preavviso: per questo esiste la catena di provider.
- Una chiave per provider, intestata a me. Niente account multipli per aggirare le quote.
- Niente codice o dati riservati del lavoro nei prompt.
- Le chiavi non vanno mai nel frontend né in variabili che iniziano con `VITE_`.
- `npm audit fix --force` non si usa: può installare versioni incompatibili.
