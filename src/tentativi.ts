import type { Tentativo } from './tipi'

// Scarica tutti i tentativi salvati: serve al backup e, più avanti, alla dashboard.
export async function scaricaTentativi(password: string): Promise<Tentativo[]> {
  const res = await fetch('/api/tentativi', {
    headers: { 'x-app-password': password },
  })
  if (!res.ok) {
    const dettaglio: { error?: string } = await res.json()
    throw new Error(dettaglio.error ?? `Errore ${res.status}`)
  }
  const dati: { tentativi?: Tentativo[] } = await res.json()
  return dati.tentativi ?? []
}

// Salva un tentativo passando dall'API protetta: il browser non parla mai col database.
export async function inviaTentativo(tentativo: Tentativo, password: string): Promise<void> {
  const res = await fetch('/api/tentativi', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-app-password': password,
    },
    body: JSON.stringify(tentativo),
  })
  if (!res.ok) {
    const dettaglio: { error?: string } = await res.json()
    throw new Error(dettaglio.error ?? `Errore ${res.status}`)
  }
}
