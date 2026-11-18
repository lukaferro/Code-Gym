import { useState } from 'react'
import './App.css'
import { esercizi } from './esercizi'
import { eseguiTest } from './runner'
import type { RisultatoTest } from './runner'
import Editor from '@monaco-editor/react'

function App() {
  const [domanda, setDomanda] = useState('')
  const [risposta, setRisposta] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

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

  const esercizio = esercizi[0] // Prendiamo il primo esercizio come esempio
  const [codice, setCodice] = useState(esercizio.codiceIniziale)
  const [risultati, setRisultati] = useState<RisultatoTest[]>([])

  function esegui(): void {
    setRisultati(eseguiTest(codice, esercizio))
  }

  const superati = risultati.filter((risultato) => risultato.corretto).length

  return (
    <>
      <h2>{esercizio.titolo}</h2>
      <p>Categoria: {esercizio.categoria}</p>
      <p>Difficoltà: {esercizio.difficolta}</p>
      <p>{esercizio.testo}</p>
      <Editor
        height="300px"
        defaultLanguage="javascript"
        value={codice}
        onChange={(nuovo) => setCodice(nuovo ?? '')}
      />
      <button onClick={esegui}>Esegui test</button>
      {risultati.length > 0 && (
        <div>
          <p>
            {superati} su {risultati.length} superati
          </p>
          <ul>
            {risultati.map((risultato, indice) => (
              <li key={indice}>
                {risultato.corretto ? 'OK' : 'NO'} - input: {JSON.stringify(risultato.input)} -
                atteso: {JSON.stringify(risultato.atteso)} - ottenuto:{' '}
                {JSON.stringify(risultato.ottenuto) ?? 'niente'}
                {risultato.errore && <span> - errore: {risultato.errore}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
      <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
      <textarea value={domanda} onChange={(e) => setDomanda(e.target.value)}></textarea>
      <button onClick={invia} disabled={loading}>
        Invia
      </button>
      <p>{risposta}</p>
      <p>{error}</p>
    </>
  )
}

export default App
