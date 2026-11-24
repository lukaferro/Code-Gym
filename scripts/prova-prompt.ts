// Stampa i prompt per una materia. Nessuna rete, nessuna quota consumata.
// Uso: node scripts/prova-prompt.ts <id materia>
import { materie } from '../src/materie.ts'
import { esercizi } from '../src/esercizi.ts'
import { promptIndizio, promptTestLivello } from '../src/tutor.ts'

const scelta = process.argv[2]
const materia = materie.find((singola) => singola.id === scelta)

if (!materia) {
  console.log('Uso: node scripts/prova-prompt.ts <id materia>')
  console.log('Materie:', materie.filter((singola) => !singola.nascosta).map((singola) => singola.id).join(', '))
} else {
  const prompt = promptTestLivello(materia)
  console.log(prompt)
  console.log(`\n(${prompt.length} caratteri)`)

  // I tre livelli devono suonare diversi: è il controllo che conta davvero.
  const esercizio = esercizi.find((singolo) => singolo.materia === materia.id)
  if (!esercizio) {
    console.log('\nNessun esercizio per questa materia: niente indizi da provare.')
  } else {
    const codice = `function ${esercizio.nomeFunzione}(input) {\n  // il mio tentativo\n}`
    for (const livello of [1, 2, 3] as const) {
      const indizio = promptIndizio(materia, esercizio, codice, livello)
      console.log(`\n=== indizio livello ${livello} (${esercizio.id}) ===`)
      console.log(indizio)
    }
  }
}
