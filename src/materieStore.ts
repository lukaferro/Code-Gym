import { materie as materieBase } from './materie.ts'
import type { Materia } from './materie.ts'

// Le materie create o modificate dall'app vivono qui. Per ora in localStorage
// (il browser del PC che uso); la Fase 3 le porterà su Turso come i tentativi.
const CHIAVE = 'code-gym-materie'

const MAX_ARGOMENTI = 20
const MAX_LUNGHEZZA_ARGOMENTO = 60
const MAX_LUNGHEZZA_NOME = 60

// Un argomento per riga, oppure separati da virgola: vanno bene tutti e due.
// Toglie anche i trattini e i numeri che l'IA mette davanti agli elenchi.
export function argomentiDaTesto(testo: string): string[] {
  return limitaArgomenti(
    testo
      .split(/[\n,]/)
      .map((argomento) => argomento.replace(/^(?:[-*•]|\d+[.)])\s+/, '').trim())
  )
}

// Gli argomenti arrivano anche dalle righe della schermata: qui valgono le stesse regole.
function limitaArgomenti(argomenti: string[]): string[] {
  return argomenti
    .map((argomento) => argomento.trim())
    .filter((argomento) => argomento.length > 0)
    .map((argomento) => argomento.slice(0, MAX_LUNGHEZZA_ARGOMENTO))
    .slice(0, MAX_ARGOMENTI)
}

export function testoDaArgomenti(argomenti: string[]): string {
  return argomenti.join('\n')
}

// L'id non cambia più: è la chiave con cui tentativi e profili ricordano la materia.
// "Inglese tecnico" -> "inglese-tecnico", e se esiste già diventa "inglese-tecnico-2".
export function creaId(nome: string, esistenti: Materia[]): string {
  const base =
    nome
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'materia'

  let id = base
  let numero = 2
  while (esistenti.some((materia) => materia.id === id)) {
    id = `${base}-${numero}`
    numero += 1
  }
  return id
}

export function materiaNuova(
  nome: string,
  argomenti: string[],
  esistenti: Materia[]
): Materia {
  return {
    id: creaId(nome, esistenti),
    nome: nome.trim().slice(0, MAX_LUNGHEZZA_NOME),
    argomenti: limitaArgomenti(argomenti),
    // Una materia nuova non ha esercizi: il suo codice non viene eseguito,
    // lo valuta l'insegnante. Gli esercizi arriveranno nella Fase 2d.
    eseguibile: false,
  }
}

// Il nome e gli argomenti si possono cambiare, l'id no: resta la chiave della cronologia.
export function rinominaMateria(
  elenco: Materia[],
  id: string,
  nome: string,
  argomenti: string[]
): Materia[] {
  const pulito = nome.trim().slice(0, MAX_LUNGHEZZA_NOME)
  if (!pulito) return elenco

  return elenco.map((materia) =>
    materia.id === id
      ? { ...materia, nome: pulito, argomenti: limitaArgomenti(argomenti) }
      : materia
  )
}

// "Eliminare" una materia vuol dire nasconderla: la cronologia resta leggibile.
export function impostaVisibile(elenco: Materia[], id: string, visibile: boolean): Materia[] {
  return elenco.map((materia) =>
    materia.id === id ? { ...materia, nascosta: !visibile } : materia
  )
}

// Copia salvata nel browser: se è rotta si riparte dall'elenco iniziale.
// Le voci storte si scartano una per una, senza buttare via tutto il resto.
export function validaMaterie(valore: unknown): Materia[] | null {
  if (!Array.isArray(valore)) return null

  const lette: Materia[] = []
  for (const voce of valore) {
    if (typeof voce !== 'object' || voce === null) continue
    const dati = voce as Record<string, unknown>

    if (typeof dati.id !== 'string' || dati.id.trim().length === 0) continue
    if (typeof dati.nome !== 'string' || dati.nome.trim().length === 0) continue
    if (!Array.isArray(dati.argomenti)) continue
    if (!dati.argomenti.every((argomento) => typeof argomento === 'string')) continue
    if (typeof dati.eseguibile !== 'boolean') continue
    if (dati.nascosta !== undefined && typeof dati.nascosta !== 'boolean') continue
    if (lette.some((materia) => materia.id === dati.id)) continue

    const materia: Materia = {
      id: dati.id.trim().slice(0, 100),
      nome: dati.nome.trim().slice(0, MAX_LUNGHEZZA_NOME),
      argomenti: (dati.argomenti as string[]).slice(0, MAX_ARGOMENTI),
      eseguibile: dati.eseguibile,
    }
    if (dati.nascosta === true) materia.nascosta = true
    lette.push(materia)
  }

  return lette
}

// Se un giorno aggiungo materie in `materie.ts`, compaiono anche a chi ha già
// una copia salvata. Quelle nascoste dall'app restano nascoste (ci sono già).
export function unisciMaterie(lette: Materia[]): Materia[] {
  const elenco = [...lette]
  for (const iniziale of materieBase) {
    if (elenco.some((materia) => materia.id === iniziale.id)) continue
    elenco.push({ ...iniziale, argomenti: [...iniziale.argomenti] })
  }
  return elenco
}

// Lettura unica all'avvio: una materia nascosta resta nei dati, sparisce dal menu.
export function leggiMaterie(): Materia[] {
  if (typeof localStorage === 'undefined') return unisciMaterie([])
  try {
    const grezzo = localStorage.getItem(CHIAVE)
    if (!grezzo) return unisciMaterie([])
    const salvate = validaMaterie(JSON.parse(grezzo))
    return unisciMaterie(salvate ?? [])
  } catch {
    return unisciMaterie([])
  }
}

export function salvaMaterie(elenco: Materia[]): void {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(CHIAVE, JSON.stringify(elenco))
  } catch {
    // spazio esaurito o storage disattivato: la pagina continua a funzionare,
    // le modifiche valgono solo finché la scheda è aperta.
  }
}
