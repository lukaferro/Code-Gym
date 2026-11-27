import { useState } from 'react'
import type { Materia } from './materie.ts'
import {
  argomentiDaTesto,
  impostaVisibile,
  materiaNuova,
  rinominaMateria,
  testoDaArgomenti,
} from './materieStore.ts'

type Props = {
  elenco: Materia[]
  // Materie che hanno esercizi: nasconderle toglierebbe l'unica cosa eseguibile.
  conEsercizi: string[]
  onCambia: (elenco: Materia[]) => void
  // Chiede all'insegnante un elenco di argomenti per la materia.
  onSuggerisci: (nome: string) => Promise<string>
}

type PropsRiga = {
  materia: Materia
  bloccata: boolean
  onSalva: (id: string, nome: string, argomenti: string[]) => void
  onVisibilita: (id: string, visibile: boolean) => void
  onSuggerisci: (nome: string) => Promise<string>
}

// Una riga = una materia. Le modifiche restano in bozza finché non premi Salva:
// così il menu non cambia a ogni lettera scritta.
function RigaMateria({ materia, bloccata, onSalva, onVisibilita, onSuggerisci }: PropsRiga) {
  const [nome, setNome] = useState(materia.nome)
  const [argomenti, setArgomenti] = useState(testoDaArgomenti(materia.argomenti))
  const [messaggio, setMessaggio] = useState('')
  const [inCorso, setInCorso] = useState(false)

  function salva(): void {
    const argomentiPuliti = argomentiDaTesto(argomenti)
    if (!nome.trim()) {
      setMessaggio('Il nome non può essere vuoto.')
      return
    }
    setNome(nome.trim())
    setArgomenti(testoDaArgomenti(argomentiPuliti))
    onSalva(materia.id, nome.trim(), argomentiPuliti)
    setMessaggio('Salvata.')
  }

  async function suggerisci(): Promise<void> {
    if (!nome.trim() || inCorso) return
    setInCorso(true)
    setMessaggio('')

    try {
      const risposta = await onSuggerisci(nome.trim())
      const attuali = argomentiDaTesto(argomenti)
      // Solo quelli che non ci sono già: niente doppioni nella lista.
      const nuovi = argomentiDaTesto(risposta).filter(
        (proposto) => !attuali.some((attuale) => attuale.toLowerCase() === proposto.toLowerCase())
      )
      if (nuovi.length === 0) {
        setMessaggio('Nessun argomento nuovo da aggiungere.')
        return
      }
      setArgomenti(testoDaArgomenti([...attuali, ...nuovi]))
      setMessaggio(`${nuovi.length} argomenti proposti: controlla e premi Salva.`)
    } catch (err) {
      setMessaggio(err instanceof Error ? err.message : 'Suggerimento non disponibile')
    } finally {
      setInCorso(false)
    }
  }

  return (
    <div className="riga-materia">
      <div className="riga-materia-testa">
        <input
          value={nome}
          onChange={(evento) => setNome(evento.target.value)}
          aria-label="Nome della materia"
        />
        {materia.nascosta && <span className="nota">nascosta</span>}
      </div>
      <textarea
        value={argomenti}
        onChange={(evento) => setArgomenti(evento.target.value)}
        rows={3}
        placeholder="Un argomento per riga"
        aria-label="Argomenti della materia"
      />
      <div className="bottoni">
        <button onClick={salva}>Salva</button>
        <button
          className="link-bottone"
          onClick={() => void suggerisci()}
          disabled={inCorso}
        >
          {inCorso ? 'Chiedo gli argomenti...' : 'Suggerisci argomenti'}
        </button>
        <button
          className="link-bottone"
          onClick={() => onVisibilita(materia.id, materia.nascosta === true)}
          disabled={bloccata}
          title={bloccata ? 'Ha esercizi: resta nel menu' : ''}
        >
          {materia.nascosta ? 'Rimetti nel menu' : 'Nascondi'}
        </button>
      </div>
      {bloccata && <p className="nota">Ha esercizi: resta nel menu (per ora).</p>}
      <p className="nota">{messaggio}</p>
    </div>
  )
}

// Gestione delle materie: aggiungere, rinominare, cambiare argomenti, nascondere.
// Non elimina davvero: la cronologia dei tentativi resta e si può ripristinare.
export function GestioneMaterie({ elenco, conEsercizi, onCambia, onSuggerisci }: Props) {
  const [nuovoNome, setNuovoNome] = useState('')
  const [nuoviArgomenti, setNuoviArgomenti] = useState('')
  const [messaggio, setMessaggio] = useState('')
  const [errore, setErrore] = useState('')

  function aggiungi(): void {
    const nome = nuovoNome.trim()
    setErrore('')
    setMessaggio('')

    if (!nome) {
      setErrore('Scrivi il nome della materia.')
      return
    }
    if (elenco.some((materia) => materia.nome.toLowerCase() === nome.toLowerCase())) {
      setErrore('Esiste già una materia con questo nome.')
      return
    }

    const nuova = materiaNuova(nome, argomentiDaTesto(nuoviArgomenti), elenco)
    onCambia([...elenco, nuova])
    setNuovoNome('')
    setNuoviArgomenti('')
    setMessaggio(
      `Aggiunta "${nuova.nome}": la trovi nel menu, con il suo test di livello. Per ora non ha esercizi.`
    )
  }

  return (
    <section className="sezione">
      <details className="gestione-materie">
        <summary>Gestisci le materie ({elenco.length})</summary>
        <p className="nota">
          Il nome si può cambiare, la chiave interna no: è quella che lega tentativi e profili alla
          materia. "Nascondi" toglie la materia dal menu ma non cancella la sua cronologia. Le
          materie si salvano in questo browser (come la password): il database arriva nella Fase 3.
        </p>

        <form
          onSubmit={(evento) => {
            evento.preventDefault()
            aggiungi()
          }}
        >
          <input
            value={nuovoNome}
            onChange={(evento) => setNuovoNome(evento.target.value)}
            placeholder="Nome della nuova materia (es. SQL)"
            aria-label="Nome della nuova materia"
          />
          <textarea
            value={nuoviArgomenti}
            onChange={(evento) => setNuoviArgomenti(evento.target.value)}
            rows={2}
            placeholder="Argomenti, separati da virgola (puoi anche aggiungerli dopo)"
            aria-label="Argomenti della nuova materia"
          />
          <div className="bottoni">
            <button type="submit">Aggiungi materia</button>
          </div>
        </form>

        <p className={errore ? 'errore' : 'nota'}>{errore || messaggio}</p>

        <div className="elenco-materie">
          {elenco.map((materia) => (
            <RigaMateria
              key={materia.id}
              materia={materia}
              bloccata={conEsercizi.includes(materia.id)}
              onSalva={(id, nome, argomenti) =>
                onCambia(rinominaMateria(elenco, id, nome, argomenti))
              }
              onVisibilita={(id, visibile) =>
                onCambia(impostaVisibile(elenco, id, visibile))
              }
              onSuggerisci={onSuggerisci}
            />
          ))}
        </div>
      </details>
    </section>
  )
}
