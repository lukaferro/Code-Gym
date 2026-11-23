import type { Materia } from './materie.ts'

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
