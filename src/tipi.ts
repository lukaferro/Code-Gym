// Tipi condivisi tra pagina, API e script di prova.
export type Tentativo = {
  id?: number
  esercizioId: string
  materia: string
  // 'prova' viene salvata in automatico, 'consegna' è quella che conta.
  tipo: 'prova' | 'consegna'
  esito: boolean
  superati: number
  totale: number
  durataMs: number
  indizi: number
  lezioni: number
  errori: string[]
  data: string
}
