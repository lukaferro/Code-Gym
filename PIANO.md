# Code-Gym: piano del progetto

App personale per tenermi allenato nella programmazione e prepararmi ai colloqui tecnici, con un'IA che funziona come un vero insegnante. Uso solo personale, tutto in cloud gratuito.

> Questo file va tenuto aggiornato: la sezione "Stato" si modifica a ogni passo completato.

## Perché esiste

Nel lavoro l'IA scrive gran parte del codice e io non programmo più a mano: dopo l'ITS mi sento fermo, anzi in regressione. L'app serve a:

- allenarmi con esercizi che scrivo io, con test automatici;
- avere **un insegnante IA** che capisce il mio livello, sceglie cosa devo fare adesso, mi guida con domande quando sbaglio e ricorda come sto andando;
- scegliere **su quale materia allenarmi** (linguaggi, Git, inglese, colloquio) e cambiarla quando voglio;
- misurare i progressi (statistiche, punti deboli, dashboard, obiettivi);
- prepararmi ai colloqui (teoria, live coding, mock interview, inglese tecnico, Git);
- restare costante con un coach su Telegram (fase finale).

## Regola d'oro

Scrivo io a mano le parti centrali (runner, logica dei tentativi, dashboard). L'IA spiega, dà indizi e rivede il mio codice: non scrive le soluzioni al posto mio.

## Come lavora l'insegnante IA

Un ciclo, non una lista fissa di esercizi:

1. **Capisce il mio livello** con un test iniziale di domande miste, sulla materia scelta.
2. **Sceglie cosa mi serve adesso**, in base ai miei errori e al profilo.
3. **Mi propone cose diverse ogni volta**: scrivere una funzione, trovare il bug, prevedere cosa stampa un codice, spiegare con parole mie un concetto, valutare la complessità, fare code review, scenari Git, domande da colloquio anche in inglese.
4. **Quando sbaglio, mi guida con domande** (indizio vago, poi mirato, poi spiegazione completa) invece di darmi la risposta.
5. **Ricorda come sto andando** e mi ripropone dopo qualche giorno ciò che ho sbagliato.

Limite onesto: con i modelli gratuiti la qualità varia. Per questo servono un prompt di sistema con regole scritte, il profilo passato a ogni chiamata e la validazione dei contenuti generati.

## Prova e Consegna

Due pulsanti distinti sotto l'editor:

- **Prova**: esegue il codice contro i test e mostra i risultati, ma **non salva niente**. Non conta come tentativo né come errore, e si può usare quante volte voglio per sperimentare.
- **Consegna**: esegue i test e **salva il tentativo** (esito, tempo, indizi usati, tag dell'errore). Solo le consegne alimentano statistiche, profilo e dashboard.

"Aiutami" funziona sia dopo una prova sia dopo una consegna. Più avanti, nel pannello della prova, può comparire anche l'output di `console.log` del mio codice.

## Materie gestibili dall'app

Una **materia** è ciò su cui mi alleno: un linguaggio (JavaScript, TypeScript, Python, C#, Java), un framework (React, Angular) o un tema (Git, inglese tecnico, misto da colloquio). Ogni materia ha un nome, un elenco di argomenti e un'indicazione su se il codice si può eseguire.

- Dall'app posso **aggiungere, modificare ed eliminare** le materie, senza toccare il codice.
- Per una materia nuova, l'IA può **proporre gli argomenti**: scrivo il nome e lei suggerisce una lista che posso correggere.
- L'elenco in `src/materie.ts` è solo il **punto di partenza**. Quelle gestite dall'app si salvano a parte.
- Salvataggio: all'inizio in `localStorage` del browser, dietro un modulo `materieStore.ts`; con il database (Fase 3) si sposta lì.
- Test di livello, esercizi e profilo si organizzano per materia: ogni materia ha il suo profilo.
- Una materia eliminata non cancella la sua cronologia: la nasconde.

## Salvataggio dei tentativi e backup

I tentativi (solo le consegne) si salvano sul database **Turso**, già attivo dietro `api/tentativi.ts`: una sola fonte di verità, così le statistiche della Fase 3 partono senza migrazioni. In più, un pulsante **Esporta/Importa** scarica e ricarica tentativi e materie in un file JSON, come backup.

## Versione 1: da usare tutti i giorni

Il rischio vero è costruire l'app senza usarla. La versione 1 è completa quando ci sono:

1. scelta della materia;
2. test di livello;
3. esercizi con test, con **Prova** e **Consegna**;
4. pulsante "Aiutami" con indizi a livelli;
5. salvataggio dei tentativi con backup.

Quando c'è, la **uso tutti i giorni per una settimana**, 20 minuti di esercizi prima di mettere mano al codice dell'app. Annoto cosa manca e cosa non serve, e solo dopo decido cosa aggiungere.

## Decisioni prese

- Interfaccia: React + TypeScript (Vite), pubblicata su Vercel.
- Backend: funzioni serverless di Vercel nella cartella `api/`.
- IA gratuita con fallback: Gemini, poi Groq, poi OpenRouter (modelli `:free`), con un limite di tempo (circa 8 secondi) per ogni provider.
- Il piano Pro di Gemini non dà quota API: lo uso come secondo insegnante manuale, con un bottone "Chiedi a Gemini Pro" che copia il prompt completo da incollare nell'app Gemini.
- Accesso all'API protetto da una password inviata nell'header `x-app-password`.
- Database: Turso (SQLite ospitato), scelto invece di Supabase perché i progetti gratuiti Supabase si mettono in pausa dopo una settimana di inattività e auth/storage non servono.
- Esecuzione del codice: JavaScript nel browser; Python con Pyodide più avanti. C# e Java: per ora l'IA valuta il codice senza eseguirlo (segnalato nella pagina); poi, con un servizio come Judge0 tramite `api/run.ts` (piano gratuito, oppure installato sul Raspberry).
- Gli esercizi hanno test come dati (input e risultato atteso), quindi possono servire in più linguaggi con un piccolo involucro.
- I 20 esercizi scritti a mano restano come base e rete di sicurezza; quelli nuovi li genera l'IA, sempre validati.
- Bot Telegram come ultima fase; in futuro tutto può migrare su un Raspberry.

## Architettura

| Pezzo | Dove |
|---|---|
| Pagina React | `src/App.tsx` |
| Esercizi (dati) | `src/esercizi.ts` |
| Runner dei test | `src/runner.ts` |
| Materie iniziali | `src/materie.ts` |
| Lettura e salvataggio delle materie | `src/materieStore.ts` (da creare) |
| Schermata di gestione materie | `src/GestioneMaterie.tsx` (da creare) |
| Salvataggio dei tentativi e backup | `src/tentativi.ts` (invio all'API) |
| Prompt e logica dell'insegnante | `src/tutor.ts` |
| API con fallback tra provider | `api/ai.ts` |
| Esecuzione remota di codice (più avanti) | `api/run.ts` |
| Script di prova locali | `prova.mjs`, `prova-handler.ts`, `prova-online.mjs` |

API: `POST /api/ai`, header `x-app-password`, body `{ "messages": [{ "role": "user", "content": "..." }] }`, risposta `{ "provider": "...", "text": "..." }`.

Variabili d'ambiente (nomi, mai i valori): `GEMINI_API_KEY`, `GROQ_API_KEY`, `OPENROUTER_API_KEY`, `APP_PASSWORD`, `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`. Stanno in `.env.local` e nelle impostazioni di Vercel.

## Stato

- [x] Fase 0: progetto React, repo GitHub, deploy Vercel, chiavi gratuite, `api/ai.ts` con fallback e password, pagina collegata all'API
- [x] Fase 1: tipo `Esercizio`, editor Monaco, `runner.ts` con test, 20 esercizi inseriti
- [x] `materie.ts` con le materie iniziali (9 materie, comprese TypeScript e Python)
- [x] Web Worker con limite di tempo per i cicli infiniti
- [x] Password ricordata dal browser (`localStorage`)

Prossimi passi, in ordine:

1. [x] `tutor.ts` con `promptTestLivello(materia)`
2. [x] Menu di scelta della materia nella pagina; filtro degli esercizi per materia
3. [x] Pulsanti **Prova** e **Consegna**; salvataggio delle consegne su Turso
4. [x] Timeout (circa 8 secondi) per ogni provider in `api/ai.ts`
5. [x] Test di livello collegato alla chat, con la conversazione che si accumula
6. [ ] **In corso:** backup Esporta/Importa dei tentativi in JSON
7. [ ] Pulsante "Aiutami" con indizi a livelli, e "Chiedi a Gemini Pro"
8. [ ] Materie gestibili dall'app: `materieStore.ts` e schermata di gestione, con suggerimento degli argomenti dell'IA
9. [ ] **Versione 1 completa: usarla ogni giorno per una settimana**

## Fasi

### Fase 2: insegnante IA (cuore del progetto)

- **2a. Materie gestibili dall'app.** Menu di scelta, poi `materieStore.ts`, poi la schermata per aggiungere, modificare ed eliminare, e il suggerimento degli argomenti da parte dell'IA.
- **2b. Test di livello.** L'IA mi fa 8-10 domande sulla materia scelta, una alla volta, valuta le risposte e scrive il mio primo profilo. La conversazione si accumula in uno stato (`conversazione`) e a ogni invio mando tutta la lista a `/api/ai`. Il profilo per ora resta nella chat: verrà salvato con il profilo della Fase 3.
- **2c. Tutor sugli errori.** Pulsante "Aiutami" con tre livelli: indizio vago, indizio mirato, spiegazione completa. L'IA risponde in JSON con spiegazione e tag dell'errore (`async`, `array`, `complessità`, ...). Il prompt vieta la soluzione completa prima del livello 3. Opzione "Chiedi a Gemini Pro".
- **2d. Esercizi generati e tipi vari.** "Genera un esercizio su questo argomento", con validazione: l'IA fornisce anche una soluzione di riferimento, il runner la esegue contro i test e l'esercizio si scarta se la fallisce. Tipi: scrivere una funzione, trovare il bug, prevedere l'output, spiegare un concetto, complessità, code review.
- **2e. Prompt di sistema dell'insegnante** in `src/tutor.ts`, con regole di tono, di sequenza degli aiuti e di formato delle risposte.
- **2f. Altri linguaggi.** Python con Pyodide e il runner esistente; C# e Java valutati dall'IA senza esecuzione, poi con Judge0.

### Fase 3: memoria e profilo

Database dietro `db.ts` (anche per materie e tentativi, migrando i dati da `localStorage`), statistiche aggregate per materia e per argomento, profilo dello studente per materia rigenerato ogni settimana (poche righe), ripasso a intervalli. All'IA passo solo profilo, statistiche dell'argomento e ultimi errori simili (circa 500 token).

### Fase 4: dashboard e obiettivi

Streak, consegne svolte, tasso di successo, tempo medio, indizi usati, livello per materia e argomento, andamento nel tempo, errori più frequenti. Obiettivi ("3 sessioni a settimana", "colloquio il [data]") e piano settimanale.

### Fase 5: colloqui, Git e inglese

Mock interview, live coding cronometrato, domande teoriche valutate dall'IA. Git (peso piccolo): scenari sui comandi. Inglese tecnico (importante): glossario, scrittura, lettura, parlato, "modalità inglese" su ogni esercizio, aiuto in italiano quando non capisco.

### Fase 6: coach Telegram

Pillole (massimo 1-2 al giorno), chat libera con le mie statistiche, comandi `/oggi`, `/stato`, `/pausa`, pillola di inglese del giorno.

## Idee da valutare dopo la versione 1

- **Modalità colloquio:** editor senza suggerimenti automatici e con cronometro; ogni esercizio si fa una volta con gli aiuti e una volta "come al colloquio".
- **Segnalare spiegazioni sbagliate:** un pulsante che salva il caso, per migliorare il prompt.
- **Test per `runner.ts`** con Vitest.
- **`.env.example`** con i nomi delle variabili (senza valori) e un `README` breve.
- **Pulizia** degli script `prova-*` o spostamento in una cartella `scripts/`.

## Modello dati minimo

`Materia` (id, nome, argomenti, eseguibile, nascosta), `Esercizio` (con `materia`), `Tentativo` (materia, esercizio, esito, tempo, indizi, tag errore, data; salvato solo con Consegna), `StatArgomento`, `ProfiloStudente` (uno per materia), `Obiettivo`, `PianoSettimana`.

## Attenzioni

- I limiti dei piani gratuiti cambiano senza preavviso: per questo esiste la catena di provider.
- Una chiave per provider, intestata a me. Niente account multipli per aggirare le quote.
- Niente codice o dati riservati del lavoro nei prompt.
- Le chiavi non vanno mai nel frontend né in variabili che iniziano con `VITE_`.
- `npm audit fix --force` non si usa: può installare versioni incompatibili.
- Gli esercizi generati vanno sempre validati prima di essere mostrati.
- `localStorage` si perde se cancello i dati del browser: per questo c'è il backup Esporta/Importa e, più avanti, il database.
- Il codice di C# e Java valutato dall'IA non è eseguito davvero: può sbagliare.
