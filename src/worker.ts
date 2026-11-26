import { eseguiTest } from './runner'
import type { RichiestaTest, RisultatoTest, RispostaTest } from './runner'

// Il codice dell'utente può stampare quanto vuole: senza un tetto, un ciclo con
// centomila console.log bloccherebbe il passaggio dei messaggi alla pagina.
const MAX_RIGHE_LOG = 50
const MAX_CARATTERI_LOG = 500

// Come la console vera: le stringhe senza virgolette, il resto leggibile.
function scrivi(valore: unknown): string {
  if (typeof valore === 'string') return valore
  if (valore instanceof Error) return valore.message
  try {
    const json = JSON.stringify(valore)
    return json === undefined ? String(valore) : json
  } catch {
    return String(valore)
  }
}

// Questo file gira in un Web Worker, fuori dal thread della pagina:
// se il codice dell'utente entra in un ciclo infinito, si blocca qui e non nella pagina.
self.onmessage = (evento: MessageEvent<RichiestaTest>) => {
  const { codice, esercizio } = evento.data

  const log: string[] = []
  let troncato = false
  const logOriginale = console.log

  // Il codice dell'utente scrive su console.log: qui lo raccogliamo invece di
  // lasciarlo sparire nella console del worker, che nessuno vede.
  console.log = (...valori: unknown[]) => {
    if (log.length >= MAX_RIGHE_LOG) {
      troncato = true
      return
    }
    log.push(valori.map(scrivi).join(' ').slice(0, MAX_CARATTERI_LOG))
  }

  let risultati: RisultatoTest[]
  try {
    risultati = eseguiTest(codice, esercizio)
  } finally {
    console.log = logOriginale
  }

  const risposta: RispostaTest = { risultati, log, troncato }
  self.postMessage(risposta)
}
