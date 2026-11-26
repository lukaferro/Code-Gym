// Controlla i dati degli esercizi: id unici, test presenti, codice iniziale coerente.
// Per i riscaldamento esegue anche una soluzione di riferimento: se i test fossero
// sbagliati, nessuno potrebbe superarli. Nessuna rete.
import { esercizi } from '../src/esercizi.ts'
import { eseguiTest } from '../src/runner.ts'

const soluzioniRiscaldamento: Record<string, string> = {
  'somma-due-numeri': 'function somma(a, b) { return a + b; }',
  'ripeti-testo': 'function ripeti(testo, volte) { return testo.repeat(volte); }',
  'maggiore-di-due': 'function maggiore(a, b) { return a > b ? a : b; }',
  'primo-carattere': "function primoCarattere(testo) { return testo === '' ? '' : testo[0]; }",
  'somma-fino-a':
    'function sommaFinoA(n) { let totale = 0; for (let i = 1; i <= n; i += 1) totale += i; return totale; }',
}

let problemi = 0

function controlla(condizione: boolean, messaggio: string): void {
  console.log(`${condizione ? 'OK     ' : 'FALLITO'} ${messaggio}`)
  if (!condizione) problemi += 1
}

const visti = new Set<string>()

for (const esercizio of esercizi) {
  controlla(!visti.has(esercizio.id), `id unico: ${esercizio.id}`)
  visti.add(esercizio.id)

  controlla(esercizio.test.length > 0, `${esercizio.id}: almeno un test`)
  controlla(
    /^[A-Za-z_$][\w$]*$/.test(esercizio.nomeFunzione),
    `${esercizio.id}: nome funzione valido (${esercizio.nomeFunzione})`
  )
  controlla(
    esercizio.codiceIniziale.includes(`function ${esercizio.nomeFunzione}(`),
    `${esercizio.id}: il codice iniziale dichiara ${esercizio.nomeFunzione}`
  )
}

const riscaldamento = esercizi.filter((esercizio) => esercizio.difficolta === 'riscaldamento')
controlla(
  riscaldamento.length === 5,
  `5 esercizi di riscaldamento (trovati ${riscaldamento.length})`
)

for (const esercizio of riscaldamento) {
  const soluzione = soluzioniRiscaldamento[esercizio.id]
  controlla(soluzione !== undefined, `${esercizio.id}: soluzione di riferimento presente`)
  if (!soluzione) continue

  const risultati = eseguiTest(soluzione, esercizio)
  const falliti = risultati.filter((risultato) => !risultato.corretto)
  controlla(
    falliti.length === 0,
    `${esercizio.id}: la soluzione passa tutti i test${falliti.length > 0 ? ` (${falliti.length} falliti)` : ''}`
  )
}

const conteggi = {
  riscaldamento: esercizi.filter((e) => e.difficolta === 'riscaldamento').length,
  facile: esercizi.filter((e) => e.difficolta === 'facile').length,
  medio: esercizi.filter((e) => e.difficolta === 'medio').length,
  difficile: esercizi.filter((e) => e.difficolta === 'difficile').length,
}

console.log('\nEsercizi per difficoltà:', conteggi)
console.log(problemi === 0 ? '\nTutto a posto.' : `\n${problemi} problemi da correggere.`)
process.exitCode = problemi === 0 ? 0 : 1
