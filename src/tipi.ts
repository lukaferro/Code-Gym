// Tipi condivisi tra pagina, API e script di prova.
export type Tentativo = {
  id?: number
  esercizioId: string
  materia: string
  esito: boolean
  superati: number
  totale: number
  durataMs: number
  indizi: number
  errori: string[]
  data: string
}
