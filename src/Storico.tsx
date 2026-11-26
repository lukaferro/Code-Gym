import { useState } from 'react'
import { esercizi } from './esercizi'
import { scaricaTentativi } from './tentativi'
import type { Tentativo } from './tipi'

// Letti una volta sola: non cambiano mentre la pagina è aperta.
const formattatoreData = new Intl.DateTimeFormat('it-IT', {
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
})

const titoli = new Map(esercizi.map((esercizio) => [esercizio.id, esercizio.titolo]))

function formattaDurata(ms: number): string {
  // 0 = non ha ancora toccato l'editor prima di premere Prova.
  if (ms <= 0) return '—'
  const secondi = Math.round(ms / 1000)
  if (secondi < 60) return `${secondi} s`
  return `${Math.floor(secondi / 60)} min ${secondi % 60} s`
}

// Storico dei tentativi: legge quello che c'è su Turso con la GET protetta.
// Si carica a mano, con un pulsante: niente richieste all'apertura della pagina.
export function Storico({ password }: { password: string }) {
  const [tentativi, setTentativi] = useState<Tentativo[]>([])
  const [caricato, setCaricato] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errore, setErrore] = useState('')

  async function carica(): Promise<void> {
    setLoading(true)
    setErrore('')
    try {
      const elenco = await scaricaTentativi(password)
      // L'API restituisce dal più vecchio: qui il più recente sta in cima.
      setTentativi([...elenco].reverse())
      setCaricato(true)
    } catch (err) {
      setErrore(err instanceof Error ? err.message : 'Errore sconosciuto')
    } finally {
      setLoading(false)
    }
  }

  const consegne = tentativi.filter((tentativo) => tentativo.tipo === 'consegna').length
  const prove = tentativi.length - consegne

  return (
    <section className="sezione">
      <h2>I tuoi tentativi</h2>
      <p className="nota">
        Ogni riga è un'esecuzione dei test. Le prove si salvano da sole, le consegne sono quelle che
        contano nelle statistiche.
      </p>
      <div className="bottoni">
        <button onClick={() => void carica()} disabled={loading}>
          {loading ? 'Carico...' : caricato ? 'Aggiorna' : 'Carica i miei tentativi'}
        </button>
        {caricato && (
          <span className="nota">
            {consegne} consegne · {prove} prove
          </span>
        )}
      </div>

      {caricato && tentativi.length === 0 && (
        <p className="nota">Non c'è ancora nessun tentativo: prova un esercizio.</p>
      )}

      {caricato && tentativi.length > 0 && (
        <div className="tabella-scorrevole">
          <table className="storico">
            <thead>
              <tr>
                <th>Quando</th>
                <th>Esercizio</th>
                <th>Tipo</th>
                <th>Test</th>
                <th>Indizi</th>
                <th>Lezioni</th>
                <th>Tempo</th>
              </tr>
            </thead>
            <tbody>
              {tentativi.map((tentativo, posizione) => (
                <tr key={`${tentativo.id ?? 'locale'}-${posizione}`}>
                  <td>{formattatoreData.format(new Date(tentativo.data))}</td>
                  <td>{titoli.get(tentativo.esercizioId) ?? tentativo.esercizioId}</td>
                  <td>
                    <span className={tentativo.tipo === 'consegna' ? 'tipo-consegna' : 'tipo-prova'}>
                      {tentativo.tipo}
                    </span>
                  </td>
                  <td className={tentativo.esito ? 'esito-ok' : 'esito-no'}>
                    {tentativo.superati} su {tentativo.totale}
                  </td>
                  <td>{tentativo.indizi}</td>
                  <td>{tentativo.lezioni}</td>
                  <td>{formattaDurata(tentativo.durataMs)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="errore">{errore}</p>
    </section>
  )
}
