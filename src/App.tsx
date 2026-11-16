import { useState } from 'react'
import './App.css'

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
        const detail = await res.text()
        throw new Error(`Errore: ${res.status} - ${detail}`)
      }
      const data = await res.json()
      setRisposta(data.text)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
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
