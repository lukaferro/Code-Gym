import type { ProfiloTest } from './tipi.ts'
import type { Messaggio } from './tutor.ts'

// Il test di livello si legge e si salva passando dall'API protetta, come i tentativi.
export async function scaricaProfilo(
  materia: string,
  password: string
): Promise<ProfiloTest | null> {
  const res = await fetch(`/api/profilo?materia=${encodeURIComponent(materia)}`, {
    headers: { 'x-app-password': password },
  })
  if (!res.ok) {
    const dettaglio = (await res.json()) as { error?: string }
    throw new Error(dettaglio.error ?? `Errore ${res.status}`)
  }
  const dati = (await res.json()) as { profilo?: ProfiloTest | null }
  return dati.profilo ?? null
}

export async function inviaProfilo(
  profilo: { materia: string; conversazione: Messaggio[]; profilo: string },
  password: string
): Promise<void> {
  const res = await fetch('/api/profilo', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-app-password': password,
    },
    body: JSON.stringify(profilo),
  })
  if (!res.ok) {
    const dettaglio = (await res.json()) as { error?: string }
    throw new Error(dettaglio.error ?? `Errore ${res.status}`)
  }
}

export async function eliminaProfilo(materia: string, password: string): Promise<void> {
  const res = await fetch(`/api/profilo?materia=${encodeURIComponent(materia)}`, {
    method: 'DELETE',
    headers: { 'x-app-password': password },
  })
  if (!res.ok) {
    const dettaglio = (await res.json()) as { error?: string }
    throw new Error(dettaglio.error ?? `Errore ${res.status}`)
  }
}

// Il profilo è il testo che l'insegnante scrive dopo "PROFILO:".
// Funzione pura: la usano la pagina e gli script di prova.
export function estraiProfilo(messaggi: Messaggio[]): string {
  for (let posizione = messaggi.length - 1; posizione >= 0; posizione -= 1) {
    const messaggio = messaggi[posizione]
    if (messaggio.role !== 'assistant') continue

    const segno = messaggio.content.indexOf('PROFILO:')
    if (segno === -1) continue

    const dopo = messaggio.content.slice(segno + 'PROFILO:'.length)
    // A volte il modello scrive **PROFILO:**: togliamo gli asterischi iniziali.
    return dopo.replace(/^\*+/, '').trim()
  }

  return ''
}
