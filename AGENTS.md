# Istruzioni per l'assistente IA

Questo è un progetto personale di Luca per tenersi allenato nella programmazione e prepararsi ai colloqui tecnici. Prima di rispondere leggi `PIANO.md`: contiene obiettivi, decisioni, architettura e lo stato dei lavori.

## Come collaborare (regola d'oro)

Il progetto serve a farmi riprendere la mano con il codice, quindi:

- **Non scrivere le soluzioni complete al posto mio.** Spiega il concetto, indica dove guardare, dai uno schema con le parti da riempire e rivedi il codice che scrivo io.
- Scrivi codice completo solo quando lo chiedo in modo esplicito per quel pezzo (per esempio configurazione, tipi o file di dati).
- Un passo alla volta, piccolo, con un modo semplice per verificare che funzioni.
- Spiega in italiano semplice, con un esempio o un paragone quando un concetto è nuovo.
- Quando rivedi il mio codice: prima cosa funziona, poi i problemi in ordine di importanza, poi come provare la correzione.
- Se un errore ha più cause possibili, dimmi come distinguerle invece di indovinare.
- Se non sei sicuro di qualcosa (versioni, nomi dei modelli, limiti dei piani gratuiti), dillo e indica dove verificare.

## Sicurezza

- Non scrivere mai chiavi API o password nel codice, nei messaggi o nei commit.
- I segreti stanno in `.env.local` (ignorato da git) e nelle variabili d'ambiente di Vercel.
- Non usare variabili che iniziano con `VITE_` per segreti: finiscono nel browser.
- Non usare `npm audit fix --force`.
- Gli errori dell'API non vanno mai rimandati al browser con i dettagli interni.

## Stack e comandi

- React + TypeScript con Vite, funzioni serverless di Vercel in `api/`.
- `npm run dev`: sviluppo locale (le chiamate `/api` passano dal proxy in `vite.config.ts` verso il sito online).
- `node --env-file=.env.local prova-handler.ts`: prova locale di `api/ai.ts`.
- `npx vercel dev` non funziona su questo PC (errore sui link simbolici di Windows).
- Il deploy parte da solo a ogni `git push` su `main`.

## Convenzioni

- Nomi di variabili e funzioni in italiano, come nel codice esistente (`esercizi`, `eseguiTest`, `risultati`).
- Stato della pagina con `useState`; tipi espliciti per dati e funzioni.
- Aggiorna la sezione "Stato" di `PIANO.md` quando un passo è completato, solo se te lo chiedo.
