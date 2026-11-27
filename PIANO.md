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
2. **Insegna quando serve**: se non conosco ancora i concetti, mi dà una lezione breve sull'argomento dell'esercizio, con esempi su problemi diversi dal mio, e due domande di verifica.
3. **Sceglie cosa mi serve adesso**, in base ai miei errori e al profilo.
4. **Mi propone cose diverse ogni volta**: scrivere una funzione, trovare il bug, prevedere cosa stampa un codice, spiegare con parole mie un concetto, valutare la complessità, fare code review, scenari Git, domande da colloquio anche in inglese.
5. **Quando sbaglio, mi guida con domande** (indizio vago, poi mirato, poi schema con i buchi) invece di darmi la soluzione completa.
6. **Ricorda come sto andando** e mi ripropone dopo qualche giorno ciò che ho sbagliato.

Limite onesto: con i modelli gratuiti la qualità varia. Per questo servono un prompt di sistema con regole scritte, il profilo passato a ogni chiamata e la validazione dei contenuti generati.

## Prova e Consegna

Due pulsanti distinti sotto l'editor:

- **Prova**: esegue il codice contro i test, mostra i risultati e **salva una riga** con `tipo: 'prova'`. Non conta nelle statistiche, ma resta nel percorso: così lo storico dice anche dove mi sono bloccato. Se premo Prova due volte senza toccare il codice, la seconda non viene salvata.
- **Consegna**: esegue i test e salva una riga con `tipo: 'consegna'`, anche se i test non passano. Solo le consegne alimentano statistiche, profilo e dashboard.

Dopo entrambi compare un pannello leggibile: esito in una riga, **console catturata** (quello che stampa `console.log`, con un tetto per non bloccare la pagina), solo i test falliti con ottenuto e atteso, e un errore di sintassi mostrato una volta sola.

Il tempo non è quello del runner (60 ms): parte dal primo tasto nell'editor e si azzera a ogni esecuzione, quindi la somma delle durate è il tempo vero passato sull'esercizio.

"Teoria", "Aiutami", "Cosa non va?" e la chat del tutor ricevono tutti **l'esercizio, il mio codice e i risultati dell'ultima Prova**: l'aiuto parla del mio errore, non di un esercizio astratto. Quando i modelli gratuiti non bastano, "Copia prompt per Gemini Pro" copia contesto e domanda già pronti.

## Materie gestibili dall'app

Una **materia** è ciò su cui mi alleno: un linguaggio (JavaScript, TypeScript, Python, C#, Java), un framework (React, Angular) o un tema (Git, inglese tecnico, misto da colloquio). Ogni materia ha un nome, un elenco di argomenti e un'indicazione su se il codice si può eseguire.

- Dall'app posso **aggiungere, modificare ed eliminare** le materie, senza toccare il codice.
- Per una materia nuova, l'IA può **proporre gli argomenti**: scrivo il nome e lei suggerisce una lista che posso correggere.
- L'elenco in `src/materie.ts` è solo il **punto di partenza**. Quelle gestite dall'app si salvano a parte.
- Salvataggio: all'inizio in `localStorage` del browser, dietro un modulo `materieStore.ts`; con il database (Fase 3) si sposta lì.
- Test di livello, esercizi e profilo si organizzano per materia: ogni materia ha il suo profilo.
- Una materia eliminata non cancella la sua cronologia: la nasconde.

## Salvataggio dei tentativi e backup

I tentativi si salvano sul database **Turso**, già attivo dietro `api/tentativi.ts`: una sola fonte di verità, così le statistiche della Fase 3 partono senza migrazioni. Ogni riga ha un `tipo` (`prova` o `consegna`). In più, un pulsante **Esporta/Importa** scarica e ricarica i tentativi in un file JSON, come backup; l'import non riporta indietro le date, le righe prendono la data del giorno dell'importazione.

## Versione 1: da usare tutti i giorni

Il rischio vero è costruire l'app senza usarla. La versione 1 è completa quando ci sono:

1. scelta della materia;
2. test di livello;
3. esercizi con test, compresi **5 di riscaldamento** più facili dei "facile", con **Prova** e **Consegna**;
4. pulsante "Aiutami" con indizi a livelli;
5. salvataggio dei tentativi con backup;
6. **lezione contestuale**: un pulsante "Teoria" che spiega l'argomento dell'esercizio quando i concetti non li conosco ancora. Nata dopo le prime prove: senza la teoria l'indizio non basta.
7. **debug leggibile**: console catturata, pannello con i soli test falliti, errori di sintassi una volta sola;
8. **storico dei tentativi** in pagina, con prove e consegne distinte.

Quando c'è, la **uso tutti i giorni per una settimana**, 20 minuti di esercizi prima di mettere mano al codice dell'app. Annoto cosa manca e cosa non serve, e solo dopo decido cosa aggiungere.

## Decisioni prese

- Interfaccia: React + TypeScript (Vite), pubblicata su Vercel.
- Backend: funzioni serverless di Vercel nella cartella `api/`.
- IA gratuita con fallback: Gemini, poi Groq, poi OpenRouter (modelli `:free`), con un limite di tempo (circa 8 secondi) per ogni provider.
- Il piano Pro di Gemini non dà quota API: lo uso come secondo insegnante manuale, con un bottone "Copia prompt per Gemini Pro" che copia il prompt completo (contesto compreso) da incollare nell'app Gemini.
- Niente tracciamento manuale delle ricerche fatte fuori dall'app: un diario da compilare si abbandona. I segnali sono quelli che il server salva già con ogni tentativo: `indizi` e `lezioni`.
- Anche le **Prove** si salvano (`tipo: 'prova'`), in silenzio e senza doppioni: il percorso conta più dei soli successi. Le statistiche continuano a contare solo le consegne.
- Il testo dell'IA si renderizza in pagina (blocchi di codice veri, codice in linea, grassetto) con un componente piccolo, senza librerie nuove.
- La chat libera è diventata **contestuale all'esercizio**: riceve codice e risultati ed è la stessa cosa che avrei chiesto a ChatGPT, ma qui dentro.
- Link ai docs in inglese (MDN `en-US`): la versione italiana è tradotta a metà e leggere i docs in inglese allena anche al colloquio.
- Accesso all'API protetto da una password inviata nell'header `x-app-password`.
- Database: Turso (SQLite ospitato), scelto invece di Supabase perché i progetti gratuiti Supabase si mettono in pausa dopo una settimana di inattività e auth/storage non servono.
- Esecuzione del codice: JavaScript nel browser; Python con Pyodide più avanti. C# e Java: per ora l'IA valuta il codice senza eseguirlo (segnalato nella pagina); poi, con un servizio come Judge0 tramite `api/run.ts` (piano gratuito, oppure installato sul Raspberry).
- Gli esercizi hanno test come dati (input e risultato atteso), quindi possono servire in più linguaggi con un piccolo involucro.
- I 25 esercizi scritti a mano (5 di riscaldamento) restano come base e rete di sicurezza; quelli nuovi li genera l'IA, sempre validati.
- Bot Telegram come ultima fase; in futuro tutto può migrare su un Raspberry.

## Architettura

| Pezzo | Dove |
|---|---|
| Pagina React | `src/App.tsx` |
| Esercizi (dati) | `src/esercizi.ts` |
| Runner dei test | `src/runner.ts` |
| Worker e cattura di `console.log` | `src/worker.ts` |
| Rendering del testo dell'IA | `src/TestoAi.tsx` |
| Storico dei tentativi in pagina | `src/Storico.tsx` |
| Materie iniziali | `src/materie.ts` |
| Lettura e salvataggio delle materie | `src/materieStore.ts` (da creare) |
| Schermata di gestione materie | `src/GestioneMaterie.tsx` (da creare) |
| Salvataggio dei tentativi e backup | `src/tentativi.ts` (invio all'API) |
| Test di livello salvato e profilo estratto | `src/profili.ts` |
| Prompt e logica dell'insegnante | `src/tutor.ts` |
| Link ai docs MDN per categoria | `src/docs.ts` |
| API con fallback tra provider | `api/ai.ts` |
| API dei tentativi (GET backup, POST salvataggio) | `api/tentativi.ts` |
| API del test di livello (GET, PUT, DELETE per materia) | `api/profilo.ts` |
| Database Turso (client, tabelle, migrazioni) | `lib/db.ts` |
| Esecuzione remota di codice (più avanti) | `api/run.ts` |
| Script di prova locali | `scripts/prova-handler.ts`, `prova-tentativi.ts`, `prova-profili.ts`, `prova-prompt.ts`, `prova-esercizi.ts`, `crea-tabelle.ts` |

API: `POST /api/ai`, header `x-app-password`, body `{ "messages": [{ "role": "user", "content": "..." }] }`, risposta `{ "provider": "...", "text": "..." }`.

Tabella `profili` (una riga per materia, l'ultimo test sostituisce il precedente): `materia` (chiave), `conversazione` (JSON dei messaggi), `profilo` (testo dopo `PROFILO:`), `aggiornato` (data decisa dal server).

Variabili d'ambiente (nomi, mai i valori): `GEMINI_API_KEY`, `GROQ_API_KEY`, `OPENROUTER_API_KEY`, `APP_PASSWORD`, `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`. Stanno in `.env.local` e nelle impostazioni di Vercel.

## Stato

- [x] Fase 0: progetto React, repo GitHub, deploy Vercel, chiavi gratuite, `api/ai.ts` con fallback e password, pagina collegata all'API
- [x] Fase 1: tipo `Esercizio`, editor Monaco, `runner.ts` con test, 20 esercizi inseriti (oggi 25, con 5 di riscaldamento)
- [x] `materie.ts` con le materie iniziali (9 materie, comprese TypeScript e Python)
- [x] Web Worker con limite di tempo per i cicli infiniti
- [x] Password ricordata dal browser (`localStorage`)

Prossimi passi, in ordine:

1. [x] `tutor.ts` con `promptTestLivello(materia)`
2. [x] Menu di scelta della materia nella pagina; filtro degli esercizi per materia
3. [x] Pulsanti **Prova** e **Consegna**; salvataggio delle consegne su Turso
4. [x] Timeout (circa 8 secondi) per ogni provider in `api/ai.ts`
5. [x] Test di livello collegato alla chat, con la conversazione che si accumula
6. [x] Backup Esporta/Importa dei tentativi in JSON
7. [x] "Aiutami" con indizi a tre livelli (domanda, concetto, schema con i buchi)
8. [x] Lezione contestuale ("Teoria"), conteggio `lezioni`, link ai docs MDN
9. [x] Pannello di debug: console catturata, soli test falliti, errori di sintassi una volta sola
10. [x] Prove salvate (`tipo: 'prova'`) e durata vera dal primo tasto, non il tempo del runner
11. [x] Aiuti contestuali (esercizio + codice + risultati), "Cosa non va?", chat sull'esercizio, testo dell'IA renderizzato
12. [x] 5 esercizi di riscaldamento e casi di test visibili prima di provare
13. [x] Storico dei tentativi in pagina (`Storico.tsx`), con prove e consegne distinte
14. [x] Chat del tutor con memoria (tutta la conversazione a schermo, ultimi 8 messaggi all'IA)
15. [x] Test di livello salvato su Turso (`profili`, `api/profilo.ts`), ripreso all'apertura, con "Copia profilo"
16. [x] Consegna che eredita la durata della Prova appena fatta, deduplica di Consegne ed errori, "Prossimo esercizio"
17. [x] Console sempre visibile dopo una Prova, con pulsante di esempio `console.log`
18. [ ] Materie gestibili dall'app: `materieStore.ts` e schermata di gestione, con suggerimento degli argomenti dell'IA
19. [ ] **Versione 1 completa: usarla ogni giorno per una settimana**

## Fasi

### Fase 2: insegnante IA (cuore del progetto)

- **2a. Materie gestibili dall'app.** Menu di scelta, poi `materieStore.ts`, poi la schermata per aggiungere, modificare ed eliminare, e il suggerimento degli argomenti da parte dell'IA.
- **2b. Test di livello.** L'IA mi fa 8-10 domande sulla materia scelta, una alla volta, valuta le risposte e scrive il mio primo profilo. La conversazione si accumula in uno stato (`conversazione`); a ogni risposta si salva nella tabella `profili` (una riga per materia) e si riprende all'apertura della pagina. Il profilo (testo dopo `PROFILO:`) si può copiare e sarà il pezzo che passeremo ai prompt della Fase 3.
- **2c. Tutor sugli errori.** Pulsante "Aiutami" con tre livelli, e ogni livello è un **tipo di aiuto diverso**: (1) una domanda che fa ragionare, senza nominare funzioni; (2) il concetto o il metodo giusto, senza codice; (3) lo schema del codice con i pezzi da riempire come commenti. Il prompt vieta la soluzione completa a ogni livello e riceve esercizio, codice e risultati veri dell'ultima Prova. Accanto c'è **"Cosa non va?"**, che parte dal test fallito, e "Copia prompt per Gemini Pro", che copia contesto e domanda. Gli indizi usati finiscono nel tentativo (`indizi`).
- **2c-bis. Lezione contestuale.** Pulsante "Teoria" sull'esercizio: una lezione di massimo 12 righe sull'argomento, con un esempio su un **problema diverso** (così non è la soluzione travestita), due errori comuni e due domande di verifica. Il testo riceve l'esercizio, il mio codice e i risultati dei test, ma non deve risolverlo. Il contatore `lezioni` finisce nel tentativo. Insieme c'è un link ai docs MDN generato dalla categoria, senza IA.
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

`Materia` (id, nome, argomenti, eseguibile, nascosta), `Esercizio` (con `materia` e difficoltà `riscaldamento` | `facile` | `medio` | `difficile`), `Tentativo` (materia, esercizio, `tipo` prova/consegna, esito, tempo dall'ultimo tasto, `indizi`, `lezioni`, tag errore, data; ogni Prova e ogni Consegna crea una riga), `ProfiloTest` (una riga per materia con conversazione del test e profilo estratto), `StatArgomento`, `ProfiloStudente` (uno per materia), `Obiettivo`, `PianoSettimana`.

## Attenzioni

- I limiti dei piani gratuiti cambiano senza preavviso: per questo esiste la catena di provider.
- Una chiave per provider, intestata a me. Niente account multipli per aggirare le quote.
- Niente codice o dati riservati del lavoro nei prompt.
- Le chiavi non vanno mai nel frontend né in variabili che iniziano con `VITE_`.
- `npm audit fix --force` non si usa: può installare versioni incompatibili.
- Gli esercizi generati vanno sempre validati prima di essere mostrati.
- Le lezioni generate possono sbagliare, e su un testo lungo ci si fida più che su un indizio: l'esempio deve stare su un problema diverso dall'esercizio, altrimenti è la soluzione travestita.
- Le statistiche della Fase 3 devono contare solo `tipo = 'consegna'`: le prove salvate sono percorso, non risultati, e gonfierebbero i numeri.
- `localStorage` si perde se cancello i dati del browser: per questo c'è il backup Esporta/Importa e, più avanti, il database.
- Il codice di C# e Java valutato dall'IA non è eseguito davvero: può sbagliare.
- Gli endpoint dentro `api/` sono autosufficienti (tipi e `autorizza` copiati): Vercel non risolve i file condivisi fuori da `api/`. Se cambia un tipo in `src/tipi.ts`, va cambiato anche lì.
- Il test di livello si salva a ogni risposta dell'insegnante: una risposta persa costa un'altra chiamata all'IA, non il test intero.
