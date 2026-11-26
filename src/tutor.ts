import type { Materia } from './materie.ts'
import type { Esercizio } from './esercizi.ts'
import type { RisultatoTest } from './runner.ts'

// Un messaggio della chat: è la stessa forma che /api/ai inoltra ai provider.
export type Messaggio = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

// Prompt del test di livello: l'IA conduce lei la conversazione, una domanda
// alla volta, e chiude con un profilo in poche righe.
// Funzione pura: nessuno stato, nessuna rete. Si prova con scripts/prova-prompt.ts.
export function promptTestLivello(materia: Materia): string {
  const codice = materia.eseguibile
    ? 'Il codice dello studente viene eseguito davvero: puoi chiedergli di completare funzioni e correggerlo guardando i risultati dei test.'
    : 'Il codice dello studente non viene eseguito: valuta tu la correttezza, senza inventare output o risultati di test.'

  return [
    `Sei un insegnante paziente di ${materia.nome} e stai facendo un test di livello a uno studente che si prepara ai colloqui tecnici.`,
    `Argomenti su cui puoi interrogarlo: ${materia.argomenti.join(', ')}.`,
    '',
    'Come conduci il test:',
    '- Fai una domanda alla volta e aspetta la risposta: non elencare più domande insieme.',
    '- In tutto 8-10 domande, dalla più facile alla più difficile.',
    '- Se lo studente sbaglia, abbassa la difficoltà della domanda successiva.',
    '- Alterna teoria, "cosa stampa questo codice" e "come lo scriveresti".',
    '- Dopo ogni risposta dai un giudizio breve (giusto, sbagliato, incompleto) e spiega il perché in una o due frasi.',
    '- Non dare mai la soluzione completa né il codice finito.',
    '- Scrivi in italiano semplice, con frasi corte; mostra codice solo quando serve.',
    `- ${codice}`,
    '- Se una risposta è vuota o fuori tema, chiedi di riprovare una volta, poi passa avanti.',
    '',
    'Come chiudi:',
    `- Dopo l'ultima domanda scrivi "PROFILO:" e poi 3-5 righe con punti forti, punti deboli e argomenti da ripassare.`,
    '- Dopo il profilo non fare altre domande e non chiedere altro.',
  ].join('\n')
}

// ---------------------------------------------------------------------------
// Contesto comune a tutti gli aiuti sull'esercizio: consegna, codice, risultati.
// Il resto del prompt cambia, questa parte no. Così ogni aiuto parla del SUO
// codice e non di un esercizio generico.
// ---------------------------------------------------------------------------

function mostraValore(valore: unknown): string {
  try {
    const json = JSON.stringify(valore)
    return (json === undefined ? String(valore) : json).slice(0, 120)
  } catch {
    return String(valore).slice(0, 120)
  }
}

// Riassunto compatto dei test: quello che l'IA deve leggere per capire dove sei.
export function riassuntoRisultati(risultati: RisultatoTest[]): string {
  if (risultati.length === 0) return 'Non ha ancora eseguito i test.'

  return risultati
    .slice(0, 8)
    .map((risultato, posizione) => {
      const input = risultato.input.map(mostraValore).join(', ')
      const esito = risultato.corretto ? 'OK' : 'SBAGLIATO'
      const errore = risultato.errore ? ` - errore: ${risultato.errore.slice(0, 160)}` : ''
      return `Test ${posizione + 1}: (${input}) -> atteso ${mostraValore(risultato.atteso)}, ottenuto ${mostraValore(risultato.ottenuto)} (${esito})${errore}`
    })
    .join('\n')
}

function contestoEsercizio(
  materia: Materia,
  esercizio: Esercizio,
  codice: string,
  risultati: RisultatoTest[]
): string[] {
  // Il codice può essere lungo: si taglia, o paghiamo token inutili.
  const codiceMostrato = codice.trim()
    ? ['```', codice.slice(0, 2000), '```'].join('\n')
    : 'Non ha ancora scritto codice.'

  const esecuzione = materia.eseguibile
    ? 'Il suo codice viene eseguito davvero dai test: i risultati qui sopra sono veri.'
    : 'Il suo codice non viene eseguito dal sito: valuta tu, senza inventare risultati.'

  return [
    `Sei un insegnante paziente di ${materia.nome}; lo studente si prepara ai colloqui tecnici e sta affrontando un esercizio ${esercizio.difficolta}.`,
    '',
    'Consegna:',
    esercizio.testo,
    '',
    'Il suo codice in questo momento:',
    codiceMostrato,
    '',
    "Risultati dell'ultima esecuzione dei test:",
    riassuntoRisultati(risultati),
    '',
    `- ${esecuzione}`,
  ]
}

// Gli indizi sono tre tipi di aiuto diversi, non tre gradini dello stesso
// discorso: così ognuno funziona da solo e non serve ricordare i precedenti.
export type LivelloIndizio = 1 | 2 | 3

const REGOLE_INDIZIO: Record<LivelloIndizio, string> = {
  1: 'Fai una sola domanda che lo aiuti a capire da dove partire. Non nominare funzioni, metodi o concetti tecnici, non scrivere codice.',
  2: 'Spiega in una o due frasi il concetto o il metodo che gli serve. Non scrivere codice, nemmeno un esempio di mezza riga.',
  3: 'Mostra lo schema del codice con i pezzi da riempire come commenti (es. "// qui il ciclo"). Nessuna riga deve funzionare così com\'è: i buchi li riempie lui.',
}

// Prompt di un indizio: funzione pura, si prova con scripts/prova-prompt.ts.
export function promptIndizio(
  materia: Materia,
  esercizio: Esercizio,
  codice: string,
  risultati: RisultatoTest[],
  livello: LivelloIndizio
): string {
  return [
    ...contestoEsercizio(materia, esercizio, codice, risultati),
    '',
    `Questo è l'indizio di livello ${livello} di 3.`,
    REGOLE_INDIZIO[livello],
    '',
    'Regole valide per tutti i livelli:',
    "- Se i test danno un errore o un risultato sbagliato, usa QUELLO: l'indizio deve parlare del suo codice, non di un esercizio in astratto.",
    '- Non dare mai la soluzione completa né codice che si possa incollare e far funzionare.',
    '- Non ripetere la consegna e non aprire con frasi tipo "Certo!" o "Ottima domanda".',
    '- Scrivi in italiano semplice, con frasi corte, al massimo 8 righe.',
    '',
    "Rispondi solo con l'indizio.",
  ].join('\n')
}

// Lezione contestuale: spiega l'argomento dell'esercizio senza risolverlo.
export function promptLezione(
  materia: Materia,
  esercizio: Esercizio,
  codice: string,
  risultati: RisultatoTest[]
): string {
  return [
    ...contestoEsercizio(materia, esercizio, codice, risultati),
    '',
    `L'argomento da spiegare è la categoria "${esercizio.categoria}".`,
    'Dagli una lezione breve, in italiano semplice e con frasi corte, al massimo 12 righe.',
    '',
    'Struttura:',
    "1. L'idea in tre frasi: a cosa serve, quando si usa, cosa fa.",
    "2. Un esempio su un problema DIVERSO da quello dell'esercizio: nomi diversi, dati diversi.",
    '3. Due errori comuni, uno per riga.',
    '4. Due domande di verifica per lui, da rispondere a voce. Non risolverle.',
    '',
    'Regole:',
    "- Non risolvere l'esercizio, nemmeno in parte.",
    "- Non scrivere funzioni complete: nell'esempio puoi mostrare solo singole istruzioni.",
    '- Codice solo per l\'esempio generico, niente altro.',
    '- I nomi di metodi e proprietà restano in inglese, come nel linguaggio.',
    '',
    'Rispondi solo con la lezione.',
  ].join('\n')
}

// "Cosa non va?": guarda il SUO codice e i risultati veri, e spiega l'errore.
export function promptCosaNonVa(
  materia: Materia,
  esercizio: Esercizio,
  codice: string,
  risultati: RisultatoTest[]
): string {
  return [
    ...contestoEsercizio(materia, esercizio, codice, risultati),
    '',
    'Spiega cosa non funziona nel suo codice, in massimo 8 righe:',
    '- parti dal test che fallisce e dal valore che ha ottenuto;',
    '- indica il punto preciso (la riga, la condizione, il passaggio) e perché sbaglia;',
    '- se il codice è vuoto o quasi, digli da dove partire;',
    '- non riscrivere la soluzione e non incollare il codice corretto: fagli capire cosa cambiare.',
    '',
    'Italiano semplice, frasi corte.',
    'Rispondi solo con la spiegazione.',
  ].join('\n')
}

// Chat contestuale sull'esercizio: la domanda la scrive lo studente.
export function promptTutorEsercizio(
  materia: Materia,
  esercizio: Esercizio,
  codice: string,
  risultati: RisultatoTest[]
): string {
  return [
    ...contestoEsercizio(materia, esercizio, codice, risultati),
    '',
    'Rispondi alle sue domande su questo esercizio, una cosa alla volta, in massimo 8 righe.',
    'Non dare mai la soluzione completa: spiega, fai esempi su casi diversi, fai domande.',
    "Se la domanda è fuori tema, riportalo all'esercizio in una frase.",
    '',
    'Italiano semplice.',
  ].join('\n')
}

// Chat senza esercizio (materie che non hanno ancora esercizi).
export function promptTutorBase(materia: Materia): string {
  return [
    `Sei un insegnante paziente di ${materia.nome} per chi prepara colloqui tecnici.`,
    `Argomenti: ${materia.argomenti.join(', ')}.`,
    'Rispondi in italiano semplice, al massimo 8 righe, una cosa alla volta, con un esempio quando serve.',
    'Non dare mai soluzioni complete di esercizi: spiega il concetto e fai ragionare.',
  ].join('\n')
}
