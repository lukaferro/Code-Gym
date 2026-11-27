// Tipi condivisi tra pagina, API e script di prova.
import type { Messaggio } from './tutor.ts'

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

// Il test di livello salvato: una riga per materia, l'ultimo test sostituisce il precedente.
export type ProfiloTest = {
  materia: string
  conversazione: Messaggio[]
  // Testo dopo "PROFILO:", vuoto finché l'insegnante non chiude il test.
  profilo: string
  aggiornato: string
}
