export type Esercizio = {
  id: string
  titolo: string
  categoria: string
  difficolta: 'facile' | 'medio' | 'difficile'
  testo: string
  codiceIniziale: string
  nomeFunzione: string
  test: { input: unknown[]; atteso: unknown }[]
}

export const esercizi: Esercizio[] = [
  {
    id: 'inverti-stringa',
    titolo: 'Inverti una stringa',
    categoria: 'stringhe',
    difficolta: 'facile',
    testo:
      'Scrivi una funzione inverti(testo) che restituisce la stringa con i caratteri in ordine inverso. Esempio: inverti("ciao") restituisce "oaic".',
    codiceIniziale: `function inverti(testo) {\n  // scrivi qui il tuo codice\n}`,
    nomeFunzione: 'inverti',
    test: [
      { input: ['ciao'], atteso: 'oaic' },
      { input: [''], atteso: '' },
      { input: ['a b'], atteso: 'b a' },
    ],
  },
]