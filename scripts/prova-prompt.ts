// Stampa il prompt del test di livello per una materia.
// Nessuna rete, nessuna quota consumata.
// Uso: node scripts/prova-prompt.ts <id materia>
import { materie } from '../src/materie.ts'
import { promptTestLivello } from '../src/tutor.ts'

const scelta = process.argv[2]
const materia = materie.find((singola) => singola.id === scelta)

if (!materia) {
  console.log('Uso: node scripts/prova-prompt.ts <id materia>')
  console.log('Materie:', materie.filter((singola) => !singola.nascosta).map((singola) => singola.id).join(', '))
} else {
  const prompt = promptTestLivello(materia)
  console.log(prompt)
  console.log(`\n(${prompt.length} caratteri)`)
}
