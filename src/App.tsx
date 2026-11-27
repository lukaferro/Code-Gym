import { useEffect, useRef, useState } from 'react'
import './App.css'
import { esercizi } from './esercizi'
import type { Esercizio } from './esercizi'
import type { Materia } from './materie'
import { leggiMaterie, salvaMaterie } from './materieStore'
import { risultatiTempoScaduto } from './runner'
import type { RispostaTest, RisultatoTest } from './runner'
import { useTemaScuro } from './tema'
import Editor from '@monaco-editor/react'
import { inviaTentativo, scaricaTentativi } from './tentativi'
import type { Tentativo } from './tipi'
import {
  promptArgomenti,
  promptCosaNonVa,
  promptIndizio,
  promptLezione,
  promptTestLivello,
  promptTutorBase,
  promptTutorEsercizio,
} from './tutor'
import type { LivelloIndizio, Messaggio } from './tutor'
import { linkMdn } from './docs'
import { TestoAi } from './TestoAi'
import { Storico } from './Storico'
import { GestioneMaterie } from './GestioneMaterie'
import { eliminaProfilo, estraiProfilo, inviaProfilo, scaricaProfilo } from './profili'

const LIMITE_MS = 3000

// performance.now() è impuro (cambia a ogni chiamata) e il linter di React lo
// vieta dentro il componente: qui è lecito, misura il tempo di un click.
function adesso(): number {
  return performance.now()
}

// Come mostriamo un valore sul serio: undefined e null devono leggersi, non sparire.
function mostra(valore: unknown): string {
  try {
    const json = JSON.stringify(valore)
    return json === undefined ? String(valore) : json
  } catch {
    return String(valore)
  }
}

// Letta una volta sola, al caricamento del file: dentro il componente sarebbe
// una lettura impura a ogni disegno.
const passwordSalvata =
  typeof localStorage === 'undefined' ? '' : (localStorage.getItem('code-gym-password') ?? '')

// Materie salvate nel browser, lette una volta sola come la password.
const materieIniziali = leggiMaterie()
const materieVisibiliIniziali = materieIniziali.filter((materia) => !materia.nascosta)

// Materie con esercizi: non si possono nascondere, sono l'unica cosa eseguibile.
const materieConEsercizi = [...new Set(esercizi.map((esercizio) => esercizio.materia))]

// Ultima materia usata, letta una volta sola come la password.
const materiaSalvata =
  typeof localStorage === 'undefined'
    ? 'javascript'
    : (localStorage.getItem('code-gym-materia') ?? 'javascript')
// Se quell'id non esiste più, si riparte dalla prima materia del menu.
const materiaIniziale = materieVisibiliIniziali.some((materia) => materia.id === materiaSalvata)
  ? materiaSalvata
  : (materieVisibiliIniziali[0]?.id ?? 'javascript')

function App() {
  const scuro = useTemaScuro()

  const [password, setPassword] = useState(passwordSalvata)

  function cambiaPassword(nuova: string): void {
    setPassword(nuova)
    if (nuova) localStorage.setItem('code-gym-password', nuova)
    else localStorage.removeItem('code-gym-password')
  }

  // stato dell'esercizio
  const [elencoMaterie, setElencoMaterie] = useState<Materia[]>(materieIniziali)
  const materieVisibili = elencoMaterie.filter((materia) => !materia.nascosta)
  const [materiaScelta, setMateriaScelta] = useState(materiaIniziale)
  const [indice, setIndice] = useState(0)
  const eserciziMateria = esercizi.filter((singolo) => singolo.materia === materiaScelta)
  // Con una materia senza esercizi questa è undefined: la pagina mostra un avviso.
  const esercizio: Esercizio | undefined = eserciziMateria[indice]
  const [codice, setCodice] = useState(esercizio?.codiceIniziale ?? '')
  const [risultati, setRisultati] = useState<RisultatoTest[]>([])
  const [righeLog, setRigheLog] = useState<string[]>([])
  const [logTroncato, setLogTroncato] = useState(false)
  const [inCorso, setInCorso] = useState(false)
  const [salvataggio, setSalvataggio] = useState('')

  // Il tempo parte dal primo tasto premuto e si azzera a ogni esecuzione:
  // così la somma delle durate è il tempo vero passato sull'esercizio.
  const ultimaAzione = useRef(0)
  // Durata dell'ultima esecuzione: se la Consegna arriva subito dopo una Prova,
  // il tempo del codice è quello, non zero.
  const ultimaDurata = useRef(0)
  // Chiavi degli ultimi invii: una Prova o una Consegna con lo stesso codice
  // non aggiungono informazione.
  const ultimoInvio = useRef('')
  const ultimaConsegna = useRef('')

  // stato del test di livello
  const [conversazione, setConversazione] = useState<Messaggio[]>([])
  const [bozza, setBozza] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [chatErrore, setChatErrore] = useState('')
  // '' = nessun test, 'carico' = lettura, 'salvo'/'salvato' = scrittura, 'errore' = non salvato
  const [statoTest, setStatoTest] = useState<'' | 'carico' | 'salvo' | 'salvato' | 'errore'>('')
  const [profiloCopiato, setProfiloCopiato] = useState(false)
  // Materia del test già caricato: evita di rileggere e sovrascrivere a ogni cambio password.
  const profiloCaricatoPer = useRef('')
  const materiaCorrente =
    elencoMaterie.find((materia) => materia.id === materiaScelta) ??
    materieVisibili[0] ??
    materieIniziali[0]

  // stato del backup
  const [backupMessaggio, setBackupMessaggio] = useState('')
  const [backupInCorso, setBackupInCorso] = useState(false)

  // aiuti sull'esercizio: un solo riquadro, mostra l'ultima risposta arrivata
  const [livelloIndizi, setLivelloIndizi] = useState(0)
  const [aiuto, setAiuto] = useState<{ titolo: string; testo: string } | null>(null)
  const [aiutoLoading, setAiutoLoading] = useState(false)
  const [aiutoErrore, setAiutoErrore] = useState('')

  // lezione: blocco a parte, resta a schermo ma si può chiudere
  const [lezione, setLezione] = useState('')
  const [lezioneAperta, setLezioneAperta] = useState(true)
  const [lezioneLoading, setLezioneLoading] = useState(false)
  const [lezioneErrore, setLezioneErrore] = useState('')
  const [lezioni, setLezioni] = useState(0)

  // chat contestuale: la conversazione intera resta a schermo, così l'insegnante
  // ricorda cosa vi siete detti (all'IA ne mando solo gli ultimi messaggi).
  const [tutorDomanda, setTutorDomanda] = useState('')
  const [messaggiTutor, setMessaggiTutor] = useState<Messaggio[]>([])
  const [tutorLoading, setTutorLoading] = useState(false)
  const [tutorErrore, setTutorErrore] = useState('')

  // ultimo prompt mandato: serve al pulsante "Copia prompt"
  const [ultimoPrompt, setUltimoPrompt] = useState('')
  const [copiato, setCopiato] = useState(false)

  function azzeraAiuti(): void {
    setLivelloIndizi(0)
    setAiuto(null)
    setAiutoErrore('')
    setLezione('')
    setLezioneErrore('')
    setLezioni(0)
    setMessaggiTutor([])
    setTutorErrore('')
    setUltimoPrompt('')
    setCopiato(false)
    ultimaAzione.current = 0
    ultimaDurata.current = 0
    ultimoInvio.current = ''
    ultimaConsegna.current = ''
  }

  function cambiaMateria(nuovaMateria: string): void {
    setMateriaScelta(nuovaMateria)
    localStorage.setItem('code-gym-materia', nuovaMateria)
    // L'indice è una posizione nella lista della materia: riparte da zero.
    setIndice(0)
    const primo = esercizi.find((singolo) => singolo.materia === nuovaMateria)
    setCodice(primo?.codiceIniziale ?? '')
    setRisultati([])
    setRigheLog([])
    setLogTroncato(false)
    setSalvataggio('')
    // Una conversazione su Git non vale per JavaScript: la sua la ricarica l'effetto.
    setConversazione([])
    setBozza('')
    setChatErrore('')
    setStatoTest('')
    setProfiloCopiato(false)
    azzeraAiuti()
  }

  // Ogni modifica alle materie si salva subito e non deve lasciare la pagina
  // su una materia appena nascosta.
  function applicaMaterie(nuovo: Materia[]): void {
    setElencoMaterie(nuovo)
    salvaMaterie(nuovo)
    const visibili = nuovo.filter((materia) => !materia.nascosta)
    if (!visibili.some((materia) => materia.id === materiaScelta)) {
      cambiaMateria(visibili[0]?.id ?? 'javascript')
    }
  }

  function cambiaEsercizio(nuovoIndice: number): void {
    setIndice(nuovoIndice)
    // l'editor non si svuota da solo: rimettiamo il codice iniziale del nuovo esercizio
    setCodice(eserciziMateria[nuovoIndice].codiceIniziale)
    setRisultati([])
    setRigheLog([])
    setLogTroncato(false)
    setSalvataggio('')
    azzeraAiuti()
  }

  // Un solo punto per parlare con l'IA: cambia il prompt, non il resto.
  // registra = false per le chiamate di servizio (es. suggerire argomenti):
  // non devono sostituire il prompt che poi copi per Gemini Pro.
  async function inviaAi(messaggi: Messaggio[], registra = true): Promise<string> {
    const res = await fetch('/api/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-app-password': password,
      },
      body: JSON.stringify({ messages: messaggi }),
    })
    if (!res.ok) {
      const dettaglio: { error?: string } = await res.json()
      throw new Error(dettaglio.error ?? `Errore ${res.status}`)
    }
    const data: { text?: string } = await res.json()
    if (!data.text) throw new Error('Risposta vuota')
    if (registra) {
      // Tenuto per "Copia prompt": è il testo esatto che ha ricevuto l'IA.
      setUltimoPrompt(
        messaggi.map((messaggio) => `[${messaggio.role}]\n${messaggio.content}`).join('\n\n---\n\n')
      )
      setCopiato(false)
    }
    return data.text
  }

  // Una domanda secca: indizi, lezione e "Cosa non va?" non hanno memoria.
  async function chiamaAi(sistema: string, utente: string, registra = true): Promise<string> {
    return inviaAi(
      [
        { role: 'system', content: sistema },
        { role: 'user', content: utente },
      ],
      registra
    )
  }

  // Argomenti proposti per la gestione materie: chiamata di servizio.
  async function suggerisciArgomenti(nome: string): Promise<string> {
    return chiamaAi(promptArgomenti(nome), 'Elenca gli argomenti.', false)
  }

  async function copiaPrompt(): Promise<void> {
    try {
      await navigator.clipboard.writeText(ultimoPrompt)
      setCopiato(true)
    } catch {
      setCopiato(false)
    }
  }

  // base esplicito: dopo "Inizia test" lo stato conversazione non è ancora aggiornato
  async function inviaMessaggio(
    testo: string,
    base: Messaggio[] = conversazione
  ): Promise<void> {
    const pulito = testo.trim()
    if (!pulito || chatLoading) return

    const materiaTest = materiaCorrente.id
    const nuovi: Messaggio[] = [...base, { role: 'user', content: pulito }]
    setConversazione(nuovi)
    setBozza('')
    setChatLoading(true)
    setChatErrore('')

    try {
      const risposta = await inviaAi([
        // il prompt delle regole viaggia come primo messaggio di sistema
        { role: 'system', content: promptTestLivello(materiaCorrente) },
        ...nuovi,
      ])
      const aggiornata: Messaggio[] = [...nuovi, { role: 'assistant', content: risposta }]
      setConversazione(aggiornata)
      setProfiloCopiato(false)
      // Il test si salva a ogni risposta: chiudere la pagina non lo cancella.
      void salvaTest(materiaTest, aggiornata)
    } catch (err) {
      // la conversazione resta com'era: si può riprovare senza perdere le risposte
      setChatErrore(err instanceof Error ? err.message : 'Errore sconosciuto')
    } finally {
      setChatLoading(false)
    }
  }

  async function salvaTest(materia: string, messaggi: Messaggio[]): Promise<void> {
    setStatoTest('salvo')
    try {
      await inviaProfilo(
        { materia, conversazione: messaggi, profilo: estraiProfilo(messaggi) },
        password
      )
      setStatoTest('salvato')
    } catch {
      setStatoTest('errore')
    }
  }

  // Riprende il test salvato quando cambi materia o ricarichi la pagina.
  useEffect(() => {
    if (!password) return
    const materia = materiaScelta
    // Già caricato (o appena azzerato): non sovrascrivere la conversazione viva.
    if (profiloCaricatoPer.current === materia) return

    let annullato = false
    void (async () => {
      setStatoTest('carico')
      try {
        const salvato = await scaricaProfilo(materia, password)
        if (annullato) return
        profiloCaricatoPer.current = materia
        setConversazione(salvato?.conversazione ?? [])
        setStatoTest(salvato ? 'salvato' : '')
      } catch {
        if (!annullato) {
          profiloCaricatoPer.current = ''
          setStatoTest('errore')
        }
      }
    })()

    return () => {
      annullato = true
    }
  }, [materiaScelta, password])

  function iniziaTest(): void {
    setChatErrore('')
    setProfiloCopiato(false)
    void inviaMessaggio('Iniziamo il test di livello.', [])
  }

  async function azzeraTest(): Promise<void> {
    if (!window.confirm('Cancellare il test di livello salvato per questa materia?')) return
    setChatErrore('')
    setChatLoading(true)
    try {
      await eliminaProfilo(materiaCorrente.id, password)
      setConversazione([])
      setBozza('')
      setProfiloCopiato(false)
      setStatoTest('')
      profiloCaricatoPer.current = materiaCorrente.id
    } catch (err) {
      setChatErrore(err instanceof Error ? err.message : 'Errore sconosciuto')
    } finally {
      setChatLoading(false)
    }
  }

  async function copiaProfilo(): Promise<void> {
    const profilo = estraiProfilo(conversazione)
    if (!profilo) return
    try {
      await navigator.clipboard.writeText(profilo)
      setProfiloCopiato(true)
    } catch {
      setProfiloCopiato(false)
    }
  }

  // Un indizio per volta: se la chiamata fallisce il livello non sale.
  async function chiediIndizio(): Promise<void> {
    if (!esercizio || livelloIndizi >= 3 || aiutoLoading) return
    const livello = (livelloIndizi + 1) as LivelloIndizio
    setAiutoLoading(true)
    setAiutoErrore('')

    try {
      const testo = await chiamaAi(
        promptIndizio(materiaCorrente, esercizio, codice, risultati, livello),
        "Dammi l'indizio."
      )
      setAiuto({ titolo: `Indizio ${livello} di 3`, testo })
      setLivelloIndizi(livello)
    } catch (err) {
      setAiutoErrore(err instanceof Error ? err.message : 'Errore sconosciuto')
    } finally {
      setAiutoLoading(false)
    }
  }

  // La lezione non ha livelli: si chiede finché serve e ognuna conta.
  async function chiediLezione(): Promise<void> {
    if (!esercizio || lezioneLoading) return
    setLezioneLoading(true)
    setLezioneErrore('')

    try {
      setLezione(
        await chiamaAi(
          promptLezione(materiaCorrente, esercizio, codice, risultati),
          'Spiegami la teoria.'
        )
      )
      setLezioneAperta(true)
      setLezioni(lezioni + 1)
    } catch (err) {
      setLezioneErrore(err instanceof Error ? err.message : 'Errore sconosciuto')
    } finally {
      setLezioneLoading(false)
    }
  }

  // Guarda il codice vero e i risultati veri: è il "perché non funziona".
  async function chiediCosaNonVa(): Promise<void> {
    if (!esercizio || aiutoLoading) return
    setAiutoLoading(true)
    setAiutoErrore('')

    try {
      const testo = await chiamaAi(
        promptCosaNonVa(materiaCorrente, esercizio, codice, risultati),
        "Cosa non va nel mio codice?"
      )
      setAiuto({ titolo: 'Cosa non va', testo })
    } catch (err) {
      setAiutoErrore(err instanceof Error ? err.message : 'Errore sconosciuto')
    } finally {
      setAiutoLoading(false)
    }
  }

  async function chiediTutor(): Promise<void> {
    const pulito = tutorDomanda.trim()
    if (!pulito || tutorLoading) return

    const nuovi: Messaggio[] = [...messaggiTutor, { role: 'user', content: pulito }]
    setMessaggiTutor(nuovi)
    setTutorDomanda('')
    setTutorLoading(true)
    setTutorErrore('')

    try {
      const sistema = esercizio
        ? promptTutorEsercizio(materiaCorrente, esercizio, codice, risultati)
        : promptTutorBase(materiaCorrente)
      const risposta = await inviaAi([
        { role: 'system', content: sistema },
        // Solo gli ultimi 8: abbastanza per ricordare, senza far crescere i token.
        ...nuovi.slice(-8),
      ])
      setMessaggiTutor([...nuovi, { role: 'assistant', content: risposta }])
    } catch (err) {
      // La domanda non è andata: la rimettiamo nella casella, pronta da reinviare.
      setMessaggiTutor(messaggiTutor)
      setTutorDomanda(pulito)
      setTutorErrore(err instanceof Error ? err.message : 'Errore sconosciuto')
    } finally {
      setTutorLoading(false)
    }
  }

  async function esportaTentativi(): Promise<void> {
    setBackupMessaggio('')
    setBackupInCorso(true)
    try {
      const tentativi = await scaricaTentativi(password)
      const contenuto = { versione: 1, esportato: new Date().toISOString(), tentativi }
      const blob = new Blob([JSON.stringify(contenuto, null, 2)], { type: 'application/json' })
      const indirizzo = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = indirizzo
      link.download = `code-gym-tentativi-${new Date().toISOString().slice(0, 10)}.json`
      link.click()
      URL.revokeObjectURL(indirizzo)
      setBackupMessaggio(`Esportati ${tentativi.length} tentativi.`)
    } catch (err) {
      setBackupMessaggio(err instanceof Error ? err.message : 'Esportazione fallita')
    } finally {
      setBackupInCorso(false)
    }
  }

  // L'import rimanda ogni riga all'API: la validazione del server vale per il file.
  async function importaTentativi(file: File): Promise<void> {
    setBackupMessaggio('')
    setBackupInCorso(true)
    let importati = 0
    try {
      const dati: unknown = JSON.parse(await file.text())
      const elenco =
        Array.isArray(dati) ? dati : ((dati as { tentativi?: unknown }).tentativi ?? [])
      if (!Array.isArray(elenco) || elenco.length === 0) {
        throw new Error('Il file non contiene tentativi')
      }
      for (const voce of elenco) {
        await inviaTentativo(voce as Tentativo, password)
        importati += 1
      }
      setBackupMessaggio(`Importati ${importati} tentativi.`)
    } catch (err) {
      const motivo = err instanceof Error ? err.message : 'Importazione fallita'
      setBackupMessaggio(
        importati > 0 ? `Importati ${importati}, poi errore: ${motivo}` : `Errore: ${motivo}`
      )
    } finally {
      setBackupInCorso(false)
    }
  }

  // Mette una riga di console.log dentro la funzione per vedere i valori veri dei
  // test. Non la aggiunge due volte e non tocca il resto del codice.
  function aggiungiEsempioConsole(): void {
    const conArgomenti = "console.log('argomenti:', ...arguments) // poi togli questa riga"
    const senzaArgomenti = "console.log('esempio attivo') // poi togli questa riga"
    // `arguments` esiste solo nelle funzioni dichiarate con `function`.
    const riga = /\bfunction\b/.test(codice) ? conArgomenti : senzaArgomenti
    if (codice.includes(riga)) return

    const graffa = codice.indexOf('{')
    const nuovo =
      graffa === -1
        ? `${riga}\n${codice}`
        : `${codice.slice(0, graffa + 1)}\n  ${riga}${codice.slice(graffa + 1)}`

    setCodice(nuovo)
    // Anche questa è un'azione sull'esercizio: il cronometro parte da qui.
    if (ultimaAzione.current === 0) ultimaAzione.current = adesso()
  }

  function esegui(deveSalvare: boolean): void {
    if (!esercizio) return
    const esercizioCorrente = esercizio
    setInCorso(true)
    setSalvataggio('')
    setRigheLog([])
    setLogTroncato(false)

    // Tempo dall'ultima azione: 0 significa "non ha ancora toccato l'editor".
    const inizio = adesso()
    let durataMs =
      ultimaAzione.current === 0 ? 0 : Math.max(0, Math.round(inizio - ultimaAzione.current))
    // Consegna subito dopo una Prova, senza tasti nuovi: il tempo è quello del
    // codice appena eseguito, non zero.
    if (durataMs === 0 && deveSalvare) durataMs = ultimaDurata.current
    ultimaAzione.current = 0
    ultimaDurata.current = durataMs

    // Una Prova o una Consegna con lo stesso codice non aggiungono informazione.
    const chiave = `${esercizioCorrente.id}\n${codice}`
    const ripetuta = !deveSalvare && ultimoInvio.current === chiave
    const consegnaRipetuta = deveSalvare && ultimaConsegna.current === chiave
    ultimoInvio.current = chiave
    if (deveSalvare) ultimaConsegna.current = chiave

    function finisci(risposta: RispostaTest): void {
      setRisultati(risposta.risultati)
      setRigheLog(risposta.log)
      setLogTroncato(risposta.troncato)
      chiudi()
      // La scelta viaggia come parametro: lo stato sarebbe ancora quello vecchio.
      if (consegnaRipetuta) {
        setSalvataggio('ripetuta')
      } else if (!ripetuta) {
        void salvaTentativo(
          esercizioCorrente,
          risposta.risultati,
          durataMs,
          livelloIndizi,
          lezioni,
          deveSalvare ? 'consegna' : 'prova'
        )
      }
    }

    const worker = new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })

    // Se il worker non risponde entro il limite, lo terminiamo noi.
    const timer = setTimeout(() => {
      finisci({ risultati: risultatiTempoScaduto(esercizioCorrente), log: [], troncato: false })
    }, LIMITE_MS)

    // funzione unica per chiudere tutto senza dimenticare il timer
    function chiudi(): void {
      clearTimeout(timer)
      worker.terminate()
      setInCorso(false)
    }

    worker.onmessage = (evento: MessageEvent<RispostaTest>) => {
      finisci(evento.data)
    }

    worker.onerror = (evento: ErrorEvent) => {
      finisci({
        risultati: [
          {
            input: [],
            atteso: undefined,
            ottenuto: undefined,
            corretto: false,
            errore: evento.message || 'Errore nel worker',
          },
        ],
        log: [],
        troncato: false,
      })
    }

    worker.postMessage({ codice, esercizio: esercizioCorrente })
  }

  async function salvaTentativo(
    esercizioCorrente: Esercizio,
    risultati: RisultatoTest[],
    durataMs: number,
    indizi: number,
    lezioni: number,
    tipo: 'prova' | 'consegna'
  ): Promise<void> {
    const superati = risultati.filter((r) => r.corretto).length
    const tentativo: Tentativo = {
      esercizioId: esercizioCorrente.id,
      materia: esercizioCorrente.materia,
      tipo,
      esito: superati === risultati.length,
      superati,
      totale: risultati.length,
      durataMs,
      indizi,
      lezioni,
      errori: [...new Set(risultati.flatMap((r) => (r.errore ? [r.errore] : [])))].slice(0, 5),
      data: new Date().toISOString(),
    }

    try {
      await inviaTentativo(tentativo, password)
      if (tipo === 'consegna') setSalvataggio('ok')
    } catch (err) {
      // Una prova è dato di sottofondo: non riempiamo la pagina di errori.
      if (tipo === 'consegna') {
        setSalvataggio(err instanceof Error ? err.message : 'Salvataggio fallito')
      }
    }
  }

  const superati = risultati.filter((risultato) => risultato.corretto).length
  const falliti = risultati.filter((risultato) => !risultato.corretto)
  const primoErrore = risultati[0]?.errore
  const erroreUnico =
    risultati.length > 0 && primoErrore !== undefined && risultati.every((r) => r.errore === primoErrore)
      ? primoErrore
      : ''
  const nomeMateria =
    elencoMaterie.find((materia) => materia.id === materiaScelta)?.nome ?? materiaScelta
  // Estratto a ogni disegno dalla conversazione: nessuno stato in più da tenere allineato.
  const profiloTest = estraiProfilo(conversazione)

  return (
    <>
      <section className="sezione">
        <input
          type="password"
          value={password}
          onChange={(e) => cambiaPassword(e.target.value)}
          placeholder="Password"
        />
        <select value={materiaScelta} onChange={(e) => cambiaMateria(e.target.value)}>
          {materieVisibili.map((singola) => (
            <option key={singola.id} value={singola.id}>
              {singola.nome}
            </option>
          ))}
        </select>

        {esercizio ? (
          <>
            <select value={indice} onChange={(e) => cambiaEsercizio(Number(e.target.value))}>
              {eserciziMateria.map((singolo, posizione) => (
                <option key={singolo.id} value={posizione}>
                  {singolo.titolo} ({singolo.difficolta})
                </option>
              ))}
            </select>

            <h2>{esercizio.titolo}</h2>
            <p>
              Categoria: {esercizio.categoria} - Difficoltà: {esercizio.difficolta} -{' '}
              <a
                className="link-docs"
                href={linkMdn(esercizio.categoria)}
                target="_blank"
                rel="noreferrer"
              >
                Docs MDN (inglese)
              </a>
            </p>
            <p>{esercizio.testo}</p>

            <details className="test-esempi">
              <summary>Cosa verrà provato ({esercizio.test.length} casi)</summary>
              <ul>
                {esercizio.test.map((test, posizione) => (
                  <li key={posizione}>
                    <code>
                      {esercizio.nomeFunzione}({test.input.map(mostra).join(', ')})
                    </code>{' '}
                    deve dare <code>{mostra(test.atteso)}</code>
                  </li>
                ))}
              </ul>
            </details>

            <Editor
              height="320px"
              defaultLanguage="javascript"
              theme={scuro ? 'vs-dark' : 'light'}
              value={codice}
              onChange={(nuovo) => {
                // Il cronometro parte al primo tasto, non all'apertura della pagina.
                if (ultimaAzione.current === 0) ultimaAzione.current = adesso()
                setCodice(nuovo ?? '')
              }}
            />

            <div className="bottoni">
              <button onClick={() => esegui(false)} disabled={inCorso}>
                {inCorso ? 'In esecuzione...' : 'Prova'}
              </button>
              <button onClick={() => esegui(true)} disabled={inCorso}>
                {inCorso ? 'In esecuzione...' : 'Consegna'}
              </button>
            </div>
            <p className="nota">
              Prova salva una prova (non conta nelle statistiche). Consegna la salva come consegna,
              anche se i test non passano: è quella che racconta come stai andando.
            </p>

            <div className="bottoni">
              <button onClick={() => void chiediLezione()} disabled={lezioneLoading}>
                {lezioneLoading ? 'Attendo la lezione...' : 'Teoria'}
              </button>
              <button
                onClick={() => void chiediIndizio()}
                disabled={aiutoLoading || livelloIndizi >= 3}
              >
                {aiutoLoading
                  ? 'Attendo...'
                  : livelloIndizi >= 3
                    ? 'Nessun altro indizio'
                    : 'Aiutami'}
              </button>
              <button onClick={() => void chiediCosaNonVa()} disabled={aiutoLoading}>
                Cosa non va?
              </button>
            </div>
            <p className="nota">
              Indizi: {livelloIndizi} su 3 · Lezioni: {lezioni}
              {ultimoPrompt && (
                <>
                  {' · '}
                  <button className="link-bottone" onClick={() => void copiaPrompt()}>
                    {copiato ? 'Prompt copiato' : 'Copia prompt per Gemini Pro'}
                  </button>
                </>
              )}
            </p>

            {(lezione || aiuto) && (
              <div className="aiuto">
                {lezione && (
                  // open controllato: l'attributo nudo si riapre a ogni ridisegno
                  <details
                    open={lezioneAperta}
                    onToggle={(evento) => setLezioneAperta(evento.currentTarget.open)}
                  >
                    <summary>Teoria</summary>
                    <TestoAi testo={lezione} />
                  </details>
                )}
                {aiuto && (
                  <div className="indizio">
                    <strong>{aiuto.titolo}</strong>
                    <TestoAi testo={aiuto.testo} />
                  </div>
                )}
              </div>
            )}
            <p className="errore">{lezioneErrore}</p>
            <p className="errore">{aiutoErrore}</p>

            {risultati.length > 0 && (
              <div className="esiti">
                <p className={superati === risultati.length ? 'esito-ok' : 'esito-no'}>
                  {superati} su {risultati.length} test superati
                </p>

                {erroreUnico ? (
                  <p className="esito-no">Errore: {erroreUnico}</p>
                ) : (
                  falliti.length > 0 && (
                    <ul>
                      {falliti.map((risultato, posizione) => (
                        <li key={posizione} className="esito-no">
                          <code>
                            {esercizio.nomeFunzione}({risultato.input.map(mostra).join(', ')})
                          </code>{' '}
                          → ottenuto <code>{mostra(risultato.ottenuto)}</code>, atteso{' '}
                          <code>{mostra(risultato.atteso)}</code>
                          {risultato.errore && <span> · {risultato.errore}</span>}
                        </li>
                      ))}
                    </ul>
                  )
                )}

                <div>
                  <p className="nota">
                    Console
                    {righeLog.length > 0 &&
                      ` (${righeLog.length} righe${logTroncato ? ', troncata' : ''})`}
                  </p>
                  {righeLog.length > 0 ? (
                    <pre className="console">{righeLog.join('\n')}</pre>
                  ) : (
                    <div className="console-vuota">
                      <p className="nota">
                        Qui compare quello che stampi con <code>console.log</code>.
                      </p>
                      <button className="link-bottone" onClick={aggiungiEsempioConsole}>
                        Inserisci un console.log di esempio
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
            {salvataggio && (
              <p className={salvataggio === 'ok' ? 'esito-ok' : 'esito-no'}>
                {salvataggio === 'ok'
                  ? 'Consegna salvata'
                  : salvataggio === 'ripetuta'
                    ? 'Consegna già salvata (codice identico)'
                    : `Salvataggio non riuscito: ${salvataggio}`}
              </p>
            )}
            {(salvataggio === 'ok' || salvataggio === 'ripetuta') &&
              eserciziMateria.length > 1 && (
                <button
                  className="link-bottone"
                  onClick={() => cambiaEsercizio((indice + 1) % eserciziMateria.length)}
                >
                  Prossimo esercizio
                </button>
              )}
          </>
        ) : (
          <p className="nota">
            Per {nomeMateria} non ci sono ancora esercizi: arriveranno quelli generati dall'IA.
          </p>
        )}
      </section>

      <section className="sezione">
        <h2>
          {esercizio ? `Chiedi al tutor: ${esercizio.titolo}` : `Chiedi al tutor: ${nomeMateria}`}
        </h2>
        <p className="nota">
          {esercizio
            ? "L'insegnante vede il tuo codice e i risultati dell'ultima Prova."
            : 'Scegli una materia con esercizi per avere il contesto del codice.'}
        </p>
        {messaggiTutor.length > 0 && (
          <div className="chat">
            {messaggiTutor.map((messaggio, posizione) => (
              <div
                key={posizione}
                className={messaggio.role === 'user' ? 'chat-utente' : 'chat-ia'}
              >
                <strong>{messaggio.role === 'user' ? 'Tu' : 'Insegnante'}:</strong>
                {messaggio.role === 'user' ? (
                  <p>{messaggio.content}</p>
                ) : (
                  <TestoAi testo={messaggio.content} />
                )}
              </div>
            ))}
          </div>
        )}
        <form
          onSubmit={(evento) => {
            evento.preventDefault()
            void chiediTutor()
          }}
        >
          <textarea
            value={tutorDomanda}
            onChange={(e) => setTutorDomanda(e.target.value)}
            placeholder="Es. perché il mio ciclo parte da 1?"
          ></textarea>
          <button type="submit" disabled={tutorLoading || tutorDomanda.trim().length === 0}>
            {tutorLoading ? 'Attendo la risposta...' : 'Invia'}
          </button>
        </form>
        {messaggiTutor.length > 0 && (
          <div className="bottoni">
            <button
              className="link-bottone"
              onClick={() => setMessaggiTutor([])}
              disabled={tutorLoading}
            >
              Azzera chat
            </button>
          </div>
        )}
        <p className="errore">{tutorErrore}</p>
      </section>

      <Storico password={password} />

      <section className="sezione">
        <h2>Test di livello: {nomeMateria}</h2>
        <div className="bottoni">
          {conversazione.length === 0 && (
            <button onClick={iniziaTest} disabled={chatLoading}>
              {chatLoading ? 'Attendo la risposta...' : 'Inizia test'}
            </button>
          )}
          {conversazione.length > 0 && (
            <button onClick={() => void azzeraTest()} disabled={chatLoading}>
              Azzera test
            </button>
          )}
          {profiloTest && (
            <button className="link-bottone" onClick={() => void copiaProfilo()}>
              {profiloCopiato ? 'Profilo copiato' : 'Copia profilo'}
            </button>
          )}
        </div>

        {statoTest && (
          <p className={statoTest === 'errore' ? 'errore' : 'nota'}>
            {statoTest === 'carico'
              ? 'Carico il test salvato...'
              : statoTest === 'salvo'
                ? 'Salvo il test...'
                : statoTest === 'salvato'
                  ? 'Test salvato su Turso.'
                  : 'Test non salvato: controlla la password o la rete.'}
          </p>
        )}

        {conversazione.length === 0 ? (
          <p className="nota">
            L'insegnante farà 8-10 domande, una alla volta, e alla fine ti lascerà un profilo.
          </p>
        ) : (
          <div className="chat">
            {conversazione.map((messaggio, posizione) => (
              <div
                key={posizione}
                className={messaggio.role === 'user' ? 'chat-utente' : 'chat-ia'}
              >
                <strong>{messaggio.role === 'user' ? 'Tu' : 'Insegnante'}:</strong>
                {messaggio.role === 'user' ? (
                  <p>{messaggio.content}</p>
                ) : (
                  <TestoAi testo={messaggio.content} />
                )}
              </div>
            ))}
          </div>
        )}

        <form
          onSubmit={(evento) => {
            evento.preventDefault()
            void inviaMessaggio(bozza)
          }}
        >
          <textarea
            value={bozza}
            onChange={(e) => setBozza(e.target.value)}
            placeholder="Scrivi la tua risposta..."
          ></textarea>
          <button type="submit" disabled={chatLoading || bozza.trim().length === 0}>
            Rispondi
          </button>
        </form>
        <p className="errore">{chatErrore}</p>
      </section>

      <GestioneMaterie
        elenco={elencoMaterie}
        conEsercizi={materieConEsercizi}
        onCambia={applicaMaterie}
        onSuggerisci={suggerisciArgomenti}
      />

      <section className="sezione">
        <h2>Backup dei tentativi</h2>
        <p className="nota">
          Esporta scarica tutti i tentativi in un file JSON. Importa rimanda al server le righe del
          file: quelle già presenti vengono aggiunte di nuovo, con la data del giorno
          dell'importazione (il file non riporta indietro l'orologio).
        </p>
        <div className="bottoni">
          <button onClick={() => void esportaTentativi()} disabled={backupInCorso}>
            Esporta
          </button>
          <label className="bottone-file">
            Importa
            <input
              type="file"
              accept="application/json,.json"
              disabled={backupInCorso}
              onChange={(evento) => {
                const file = evento.target.files?.[0]
                // senza questo, lo stesso file non fa partire un secondo onChange
                evento.target.value = ''
                if (file) void importaTentativi(file)
              }}
            />
          </label>
        </div>
        <p className="nota">{backupMessaggio}</p>
      </section>
    </>
  )
}

export default App
