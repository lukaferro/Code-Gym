import { useState } from 'react'
import './App.css'
import { esercizi } from './esercizi'
import { risultatiTempoScaduto } from './runner'
import type { RisultatoTest } from './runner'
import { useTemaScuro } from './tema'
import Editor from '@monaco-editor/react'
import { inviaTentativo } from './tentativi'
import type { Tentativo } from './tipi'

const LIMITE_MS = 3000

// performance.now() è impuro (cambia a ogni chiamata) e il linter di React lo
// vieta dentro il componente: qui è lecito, misura il tempo di un click.
function adesso(): number {
  return performance.now()
}

// Letta una volta sola, al caricamento del file: dentro il componente sarebbe
// una lettura impura a ogni disegno.
const passwordSalvata =
  typeof localStorage === 'undefined' ? '' : (localStorage.getItem('code-gym-password') ?? '')

function App() {
  const scuro = useTemaScuro()

  // stato del tutor IA
  const [domanda, setDomanda] = useState('')
  const [risposta, setRisposta] = useState('')
  const [password, setPassword] = useState(passwordSalvata)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function cambiaPassword(nuova: string): void {
    setPassword(nuova)
    if (nuova) localStorage.setItem('code-gym-password', nuova)
    else localStorage.removeItem('code-gym-password')
  }

  // stato dell'esercizio
  const [indice, setIndice] = useState(0)
  const esercizio = esercizi[indice]
  const [codice, setCodice] = useState(esercizio.codiceIniziale)
  const [risultati, setRisultati] = useState<RisultatoTest[]>([])
  const [inCorso, setInCorso] = useState(false)
  const [salvataggio, setSalvataggio] = useState('')

  function cambiaEsercizio(nuovoIndice: number): void {
    setIndice(nuovoIndice)
    // l'editor non si svuota da solo: rimettiamo il codice iniziale del nuovo esercizio
    setCodice(esercizi[nuovoIndice].codiceIniziale)
    setRisultati([])
    setSalvataggio('')
  }

  async function invia() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-app-password': password,
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: domanda }],
        }),
      })
      if (!res.ok) {
        const dettaglio: { error?: string } = await res.json()
        throw new Error(dettaglio.error ?? `Errore ${res.status}`)
      }
      const data = await res.json()
      setRisposta(data.text)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto')
    } finally {
      setLoading(false)
    }
  }

  function esegui(): void {
    setInCorso(true)
    setSalvataggio('')

    const inizio = adesso()

    function finisci(nuovi: RisultatoTest[]): void {
      const durataMs = Math.round(adesso() - inizio)
      setRisultati(nuovi)
      chiudi()
      void salva(nuovi, durataMs)
    }

    const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })

    // Se il worker non risponde entro il limite, lo terminiamo noi.
    const timer = setTimeout(() => {
      finisci(risultatiTempoScaduto(esercizio))
    }, LIMITE_MS)

    // funzione unica per chiudere tutto senza dimenticare il timer
    function chiudi(): void {
      clearTimeout(timer)
      worker.terminate()
      setInCorso(false)
    }

    worker.onmessage = (evento: MessageEvent<RisultatoTest[]>) => {
      finisci(evento.data)
    }

    worker.onerror = (evento: ErrorEvent) => {
      finisci([
        {
          input: [],
          atteso: undefined,
          ottenuto: undefined,
          corretto: false,
          errore: evento.message || 'Errore nel worker',
        },
      ])
    }

    worker.postMessage({ codice, esercizio })
  }

  async function salva(risultati: RisultatoTest[], durataMs: number): Promise<void> {
    const superati = risultati.filter((r) => r.corretto).length
    const tentativo: Tentativo = {
      esercizioId: esercizio.id,
      materia: esercizio.materia,
      esito: superati === risultati.length,
      superati,
      totale: risultati.length,
      durataMs,
      indizi: 0,
      errori: risultati
        .flatMap((r) => (r.errore ? [r.errore] : []))
        .slice(0, 5),
      data: new Date().toISOString(),
    }

    try {
      await inviaTentativo(tentativo, password)
      setSalvataggio('ok')
    } catch (err) {
      setSalvataggio(err instanceof Error ? err.message : 'Salvataggio fallito')
    }
  }

  const superati = risultati.filter((risultato) => risultato.corretto).length

  return (
    <>
      <section className="sezione">
        <select value={indice} onChange={(e) => cambiaEsercizio(Number(e.target.value))}>
          {esercizi.map((singolo, posizione) => (
            <option key={singolo.id} value={posizione}>
              {singolo.titolo} ({singolo.difficolta})
            </option>
          ))}
        </select>

        <h2>{esercizio.titolo}</h2>
        <p>
          Categoria: {esercizio.categoria} - Difficoltà: {esercizio.difficolta}
        </p>
        <p>{esercizio.testo}</p>

        <Editor
          height="320px"
          defaultLanguage="javascript"
          theme={scuro ? 'vs-dark' : 'light'}
          value={codice}
          onChange={(nuovo) => setCodice(nuovo ?? '')}
        />

        <button onClick={esegui} disabled={inCorso}>
          {inCorso ? 'In esecuzione...' : 'Esegui test'}
        </button>

        {risultati.length > 0 && (
          <div>
            <p>
              {superati} su {risultati.length} superati
            </p>
            <ul>
              {risultati.map((risultato, posizione) => (
                <li key={posizione} className={risultato.corretto ? 'esito-ok' : 'esito-no'}>
                  {risultato.corretto ? 'OK' : 'NO'} - input: {JSON.stringify(risultato.input)} -
                  atteso: {JSON.stringify(risultato.atteso)} - ottenuto:{' '}
                  {JSON.stringify(risultato.ottenuto) ?? '—'}
                  {risultato.errore && <span> - errore: {risultato.errore}</span>}
                </li>
              ))}
            </ul>
          </div>
        )}
        {salvataggio && (
          <p className={salvataggio === 'ok' ? 'esito-ok' : 'esito-no'}>
            {salvataggio === 'ok' ? 'Tentativo Salvato' : `Salvataggio non riuscito: ${salvataggio}`}
          </p>
        )}
      </section>

      <section className="sezione">
        <h2>Tutor IA</h2>
        <input
          type="password"
          value={password}
          onChange={(e) => cambiaPassword(e.target.value)}
          placeholder="Password"
        />
        <textarea value={domanda} onChange={(e) => setDomanda(e.target.value)}></textarea>
        <button onClick={invia} disabled={loading}>
          Invia
        </button>
        <p>{risposta}</p>
        <p className="errore">{error}</p>
      </section>
    </>
  )
}

export default App
