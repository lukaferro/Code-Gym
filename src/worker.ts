import { eseguiTest } from './runner'
import type { RichiestaTest, RisultatoTest } from './runner'

// Questo file gira in un Web Worker, fuori dal thread della pagina:
// se il codice dell'utente entra in un ciclo infinito, si blocca qui e non nella pagina.
self.onmessage = (evento: MessageEvent<RichiestaTest>) => {
  const { codice, esercizio } = evento.data
  const risultati: RisultatoTest[] = eseguiTest(codice, esercizio)
  self.postMessage(risultati)
}
