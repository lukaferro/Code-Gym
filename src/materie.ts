// Materie su cui ci si può allenare. Questo elenco è solo il punto di partenza:
// più avanti le materie create dall'app si salvano in localStorage.
export type Materia = {
  id: string
  nome: string
  argomenti: string[]
  // true solo per i linguaggi che il runner del browser riesce a eseguire davvero.
  // Per gli altri il codice lo valuta l'IA (nessuna esecuzione).
  eseguibile: boolean
  // true quando la materia viene eliminata dall'app: sparisce dai menu
  // ma la sua cronologia resta.
  nascosta?: boolean
}

export const materie: Materia[] = [
  {
    id: 'javascript',
    nome: 'JavaScript',
    eseguibile: true,
    argomenti: [
      'variabili e tipi',
      'funzioni',
      'stringhe',
      'array e oggetti',
      'chiusure',
      'async/await',
      'gestione degli errori',
    ],
  },
  {
    id: 'typescript',
    nome: 'TypeScript',
    eseguibile: false,
    argomenti: [
      'tipi di base',
      'interfacce e type alias',
      'union e narrowing',
      'generici',
      'utility types',
      'tipi delle funzioni async',
    ],
  },
  {
    id: 'react',
    nome: 'React',
    eseguibile: false,
    argomenti: [
      'componenti e props',
      'useState',
      'useEffect',
      'liste e key',
      'input controllati',
      'custom hook',
    ],
  },
  {
    id: 'angular',
    nome: 'Angular',
    eseguibile: false,
    argomenti: [
      'componenti e template',
      'binding',
      'servizi e dependency injection',
      'routing',
      'form',
      'RxJS e observable',
    ],
  },
  {
    id: 'csharp',
    nome: 'C#',
    eseguibile: false,
    argomenti: [
      'tipi e variabili',
      'classi e oggetti',
      'collezioni',
      'LINQ',
      'async/await',
      'eccezioni',
    ],
  },
  {
    id: 'java',
    nome: 'Java',
    eseguibile: false,
    argomenti: [
      'tipi primitivi',
      'classi e oggetti',
      'collezioni',
      'ereditarietà e interfacce',
      'eccezioni',
      'stream',
    ],
  },
  {
    id: 'python',
    nome: 'Python',
    eseguibile: false,
    argomenti: [
      'variabili e tipi',
      'liste e dizionari',
      'funzioni',
      'comprensioni',
      'classi',
      'file ed eccezioni',
    ],
  },
  {
    id: 'git',
    nome: 'Git',
    eseguibile: false,
    argomenti: [
      'commit e storia',
      'branch',
      'merge e conflitti',
      'rebase',
      'remote e push',
      'annullare modifiche',
    ],
  },
  {
    id: 'inglese',
    nome: 'Inglese tecnico',
    eseguibile: false,
    argomenti: [
      'vocabolario di programmazione',
      'descrivere un bug',
      'standup e riunioni',
      'colloquio in inglese',
      'code review in inglese',
    ],
  },
]
