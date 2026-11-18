import { useState } from 'react'
import './App.css'
import { esercizi } from './esercizi'
import { risultatiTempoScaduto } from './runner'
import type { RisultatoTest } from './runner'
import { useTemaScuro } from './tema'
import Editor from '@monaco-editor/react'

const LIMITE_MS = 3000

function App() {
  const scuro = useTemaScuro()

  // stato del tutor IA
  const [domanda, setDomanda] = useState('')
  const [risposta, setRisposta] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // stato dell'esercizio
  const [indice, setIndice] = useState(0)
  const esercizio = esercizi[indice]
  const [codice, setCodice] = useState(esercizio.codiceIniziale)
  const [risultati, setRisultati] = useState<RisultatoTest[]>([])
  const [inCorso, setInCorso] = useState(false)

  function cambiaEsercizio(nuovoIndice: number): void {
    setIndice(nuovoIndice)
    // l'editor non si svuota da solo: rimettiamo il codice iniziale del nuovo esercizio
    setCodice(esercizi[nuovoIndice].codiceIniziale)
    setRisultati([])
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

    const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })

    // Se il worker non risponde entro il limite, lo terminiamo noi.
    const timer = setTimeout(() => {
      worker.terminate()
      setRisultati(risultatiTempoScaduto(esercizio))
      setInCorso(false)
    }, LIMITE_MS)

    // funzione unica per chiudere tutto senza dimenticare il timer
    function chiudi(): void {
      clearTimeout(timer)
      worker.terminate()
      setInCorso(false)
    }

    worker.onmessage = (evento: MessageEvent<RisultatoTest[]>) => {
      setRisultati(evento.data)
      chiudi()
    }

    worker.onerror = (evento: ErrorEvent) => {
      setRisultati([
        {
          input: [],
          atteso: undefined,
          ottenuto: undefined,
          corretto: false,
          errore: evento.message || 'Errore nel worker',
        },
      ])
      chiudi()
    }

    worker.postMessage({ codice, esercizio })
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
      </section>

      <section className="sezione">
        <h2>Tutor IA</h2>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
