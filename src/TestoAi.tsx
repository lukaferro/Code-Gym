import type { ReactNode } from 'react'

// Il testo dell'IA arriva in markdown: qui lo trasformiamo in blocchi veri.
// Niente librerie: bastano i blocchi ``` e il codice in linea `così`.
type Blocco = { tipo: 'testo' | 'codice'; righe: string[] }

function iniziaCodice(riga: string): boolean {
  return riga.trim().startsWith('```')
}

function separaBlocchi(testo: string): Blocco[] {
  const righe = testo.split('\n')
  const blocchi: Blocco[] = []
  let indice = 0

  while (indice < righe.length) {
    if (iniziaCodice(righe[indice])) {
      indice += 1
      const codice: string[] = []
      while (indice < righe.length && !iniziaCodice(righe[indice])) {
        codice.push(righe[indice])
        indice += 1
      }
      // salta la riga di chiusura ``` (se c'è)
      indice += 1
      blocchi.push({ tipo: 'codice', righe: codice })
      continue
    }

    const testoRighe: string[] = []
    while (indice < righe.length && !iniziaCodice(righe[indice])) {
      testoRighe.push(righe[indice])
      indice += 1
    }
    while (testoRighe.length > 0 && testoRighe[0].trim() === '') testoRighe.shift()
    while (testoRighe.length > 0 && testoRighe[testoRighe.length - 1].trim() === '') testoRighe.pop()
    if (testoRighe.length > 0) blocchi.push({ tipo: 'testo', righe: testoRighe })
  }

  return blocchi
}

// Codice in linea e **grassetto** dentro una riga di testo.
function inline(testo: string, chiave: string): ReactNode[] {
  return testo
    .split(/(`[^`]+`|\*\*[^*]+\*\*)/g)
    .filter(Boolean)
    .map((pezzo, posizione) => {
      const id = `${chiave}-${posizione}`
      if (pezzo.startsWith('`') && pezzo.endsWith('`') && pezzo.length > 2) {
        return <code key={id}>{pezzo.slice(1, -1)}</code>
      }
      if (pezzo.startsWith('**') && pezzo.endsWith('**') && pezzo.length > 4) {
        return <strong key={id}>{pezzo.slice(2, -2)}</strong>
      }
      return pezzo
    })
}

export function TestoAi({ testo }: { testo: string }) {
  const blocchi = separaBlocchi(testo)

  return (
    <div className="testo-ai">
      {blocchi.map((blocco, posizione) =>
        blocco.tipo === 'codice' ? (
          <pre key={posizione}>
            <code>{blocco.righe.join('\n')}</code>
          </pre>
        ) : (
          <p key={posizione}>{inline(blocco.righe.join('\n'), String(posizione))}</p>
        )
      )}
    </div>
  )
}
