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
  {
    id: 'conta-vocali',
    titolo: 'Conta le vocali',
    categoria: 'stringhe',
    difficolta: 'facile',
    testo:
      'Scrivi contaVocali(testo) che conta quante vocali (a, e, i, o, u) ci sono, senza distinguere maiuscole e minuscole. Esempio: contaVocali("Ciao") restituisce 3.',
    codiceIniziale: `function contaVocali(testo) {\n  // scrivi qui il tuo codice\n}`,
    nomeFunzione: 'contaVocali',
    test: [
      { input: ['ciao'], atteso: 3 },
      { input: ['AEIOU'], atteso: 5 },
      { input: [''], atteso: 0 },
      { input: ['xyz'], atteso: 0 },
    ],
  },
  {
    id: 'palindromo',
    titolo: 'Parola palindroma',
    categoria: 'stringhe',
    difficolta: 'facile',
    testo:
      'Scrivi ePalindromo(testo) che restituisce true se la stringa si legge uguale nei due versi, ignorando maiuscole e minuscole. Esempio: ePalindromo("Anna") restituisce true.',
    codiceIniziale: `function ePalindromo(testo) {\n  // scrivi qui il tuo codice\n}`,
    nomeFunzione: 'ePalindromo',
    test: [
      { input: ['anna'], atteso: true },
      { input: ['Anna'], atteso: true },
      { input: ['ciao'], atteso: false },
      { input: [''], atteso: true },
    ],
  },
  {
    id: 'capitalizza',
    titolo: 'Prima lettera maiuscola',
    categoria: 'stringhe',
    difficolta: 'facile',
    testo:
      'Scrivi capitalizza(testo) che mette in maiuscolo la prima lettera di ogni parola e lascia le altre come sono. Esempio: capitalizza("ciao mondo") restituisce "Ciao Mondo".',
    codiceIniziale: `function capitalizza(testo) {\n  // scrivi qui il tuo codice\n}`,
    nomeFunzione: 'capitalizza',
    test: [
      { input: ['ciao mondo'], atteso: 'Ciao Mondo' },
      { input: [''], atteso: '' },
      { input: ['a'], atteso: 'A' },
      { input: ['ciao  mondo'], atteso: 'Ciao  Mondo' },
    ],
  },
  {
    id: 'conta-parole',
    titolo: 'Conta le parole',
    categoria: 'stringhe',
    difficolta: 'facile',
    testo:
      'Scrivi contaParole(testo) che conta le parole separate da spazi, ignorando gli spazi in più. Esempio: contaParole("  ciao   mondo  ") restituisce 2.',
    codiceIniziale: `function contaParole(testo) {\n  // scrivi qui il tuo codice\n}`,
    nomeFunzione: 'contaParole',
    test: [
      { input: ['ciao mondo'], atteso: 2 },
      { input: [''], atteso: 0 },
      { input: ['  ciao   mondo  '], atteso: 2 },
      { input: ['ciao'], atteso: 1 },
    ],
  },
  {
    id: 'parola-piu-lunga',
    titolo: 'La parola più lunga',
    categoria: 'stringhe',
    difficolta: 'medio',
    testo:
      'Scrivi parolaPiuLunga(testo) che restituisce la parola più lunga; se il testo è vuoto restituisce "". Esempio: parolaPiuLunga("sono un programmatore") restituisce "programmatore".',
    codiceIniziale: `function parolaPiuLunga(testo) {\n  // scrivi qui il tuo codice\n}`,
    nomeFunzione: 'parolaPiuLunga',
    test: [
      { input: ['sono un programmatore'], atteso: 'programmatore' },
      { input: [''], atteso: '' },
      { input: ['abc'], atteso: 'abc' },
      { input: ['a bb ccc'], atteso: 'ccc' },
    ],
  },
  {
    id: 'somma-array',
    titolo: 'Somma di un array',
    categoria: 'array',
    difficolta: 'facile',
    testo:
      'Scrivi sommaArray(numeri) che restituisce la somma di tutti i numeri. Esempio: sommaArray([1, 2, 3]) restituisce 6.',
    codiceIniziale: `function sommaArray(numeri) {\n  // scrivi qui il tuo codice\n}`,
    nomeFunzione: 'sommaArray',
    test: [
      { input: [[1, 2, 3]], atteso: 6 },
      { input: [[]], atteso: 0 },
      { input: [[-1, 1]], atteso: 0 },
      { input: [[5]], atteso: 5 },
    ],
  },
  {
    id: 'massimo',
    titolo: 'Il numero più grande',
    categoria: 'array',
    difficolta: 'facile',
    testo:
      "Scrivi massimo(numeri) che restituisce il numero più grande. L'array ha sempre almeno un elemento. Esempio: massimo([1, 5, 2]) restituisce 5.",
    codiceIniziale: `function massimo(numeri) {\n  // scrivi qui il tuo codice\n}`,
    nomeFunzione: 'massimo',
    test: [
      { input: [[1, 5, 2]], atteso: 5 },
      { input: [[7]], atteso: 7 },
      { input: [[-3, -8]], atteso: -3 },
      { input: [[3, 3]], atteso: 3 },
    ],
  },
  {
    id: 'media',
    titolo: 'Media dei numeri',
    categoria: 'numeri',
    difficolta: 'facile',
    testo:
      "Scrivi media(numeri) che restituisce la media aritmetica. L'array ha sempre almeno un elemento. Esempio: media([1, 2, 3]) restituisce 2.",
    codiceIniziale: `function media(numeri) {\n  // scrivi qui il tuo codice\n}`,
    nomeFunzione: 'media',
    test: [
      { input: [[1, 2, 3]], atteso: 2 },
      { input: [[2, 2]], atteso: 2 },
      { input: [[10]], atteso: 10 },
      { input: [[1, 2]], atteso: 1.5 },
    ],
  },
  {
    id: 'conta-pari',
    titolo: 'Conta i numeri pari',
    categoria: 'array',
    difficolta: 'facile',
    testo:
      'Scrivi contaPari(numeri) che conta quanti numeri sono pari (anche lo zero è pari). Esempio: contaPari([1, 2, 3, 4]) restituisce 2.',
    codiceIniziale: `function contaPari(numeri) {\n  // scrivi qui il tuo codice\n}`,
    nomeFunzione: 'contaPari',
    test: [
      { input: [[1, 2, 3, 4]], atteso: 2 },
      { input: [[]], atteso: 0 },
      { input: [[1, 3]], atteso: 0 },
      { input: [[0, 2]], atteso: 2 },
    ],
  },
  {
    id: 'inverti-array',
    titolo: 'Inverti un array',
    categoria: 'array',
    difficolta: 'facile',
    testo:
      "Scrivi invertiArray(numeri) che restituisce un nuovo array con gli elementi al contrario, senza modificare quello originale. Esempio: invertiArray([1, 2, 3]) restituisce [3, 2, 1].",
    codiceIniziale: `function invertiArray(numeri) {\n  // scrivi qui il tuo codice\n}`,
    nomeFunzione: 'invertiArray',
    test: [
      { input: [[1, 2, 3]], atteso: [3, 2, 1] },
      { input: [[]], atteso: [] },
      { input: [[1]], atteso: [1] },
      { input: [['a', 'b']], atteso: ['b', 'a'] },
    ],
  },
  {
    id: 'trova-indice',
    titolo: 'Trova la posizione',
    categoria: 'array',
    difficolta: 'facile',
    testo:
      "Scrivi trovaIndice(numeri, valore) che restituisce la posizione della prima occorrenza di valore, oppure -1 se non c'è. Esempio: trovaIndice([10, 20, 30], 20) restituisce 1.",
    codiceIniziale: `function trovaIndice(numeri, valore) {\n  // scrivi qui il tuo codice\n}`,
    nomeFunzione: 'trovaIndice',
    test: [
      { input: [[10, 20, 30], 20], atteso: 1 },
      { input: [[1, 2], 5], atteso: -1 },
      { input: [[], 1], atteso: -1 },
      { input: [[1, 1], 1], atteso: 0 },
    ],
  },
  {
    id: 'fattoriale',
    titolo: 'Fattoriale',
    categoria: 'ricorsione',
    difficolta: 'facile',
    testo:
      'Scrivi fattoriale(n) che restituisce il prodotto dei numeri da 1 a n. Per convenzione fattoriale(0) restituisce 1. Esempio: fattoriale(5) restituisce 120.',
    codiceIniziale: `function fattoriale(n) {\n  // scrivi qui il tuo codice\n}`,
    nomeFunzione: 'fattoriale',
    test: [
      { input: [0], atteso: 1 },
      { input: [1], atteso: 1 },
      { input: [5], atteso: 120 },
      { input: [7], atteso: 5040 },
    ],
  },
  {
    id: 'fibonacci',
    titolo: 'Fibonacci',
    categoria: 'ricorsione',
    difficolta: 'medio',
    testo:
      "Scrivi fibonacci(n) che restituisce l'n-esimo numero di Fibonacci, con fibonacci(0) = 0 e fibonacci(1) = 1. Prova a farlo con la ricorsione.",
    codiceIniziale: `function fibonacci(n) {\n  // scrivi qui il tuo codice\n}`,
    nomeFunzione: 'fibonacci',
    test: [
      { input: [0], atteso: 0 },
      { input: [1], atteso: 1 },
      { input: [5], atteso: 5 },
      { input: [10], atteso: 55 },
    ],
  },
  {
    id: 'somma-cifre',
    titolo: 'Somma delle cifre',
    categoria: 'numeri',
    difficolta: 'facile',
    testo:
      'Scrivi sommaCifre(n) che somma le cifre di un numero intero positivo. Esempio: sommaCifre(123) restituisce 6.',
    codiceIniziale: `function sommaCifre(n) {\n  // scrivi qui il tuo codice\n}`,
    nomeFunzione: 'sommaCifre',
    test: [
      { input: [123], atteso: 6 },
      { input: [0], atteso: 0 },
      { input: [9999], atteso: 36 },
      { input: [10], atteso: 1 },
    ],
  },
  {
    id: 'e-primo',
    titolo: 'Numero primo',
    categoria: 'numeri',
    difficolta: 'medio',
    testo:
      'Scrivi ePrimo(n) che restituisce true se n è un numero primo, altrimenti false. Ricorda che 0 e 1 non sono primi.',
    codiceIniziale: `function ePrimo(n) {\n  // scrivi qui il tuo codice\n}`,
    nomeFunzione: 'ePrimo',
    test: [
      { input: [2], atteso: true },
      { input: [1], atteso: false },
      { input: [0], atteso: false },
      { input: [9], atteso: false },
      { input: [13], atteso: true },
    ],
  },
  {
    id: 'fizzbuzz',
    titolo: 'FizzBuzz',
    categoria: 'numeri',
    difficolta: 'medio',
    testo:
      'Scrivi fizzbuzz(n) che restituisce un array di stringhe da "1" a n: "Fizz" per i multipli di 3, "Buzz" per i multipli di 5, "FizzBuzz" per i multipli di entrambi. Esempio: fizzbuzz(5) restituisce ["1", "2", "Fizz", "4", "Buzz"].',
    codiceIniziale: `function fizzbuzz(n) {\n  // scrivi qui il tuo codice\n}`,
    nomeFunzione: 'fizzbuzz',
    test: [
      { input: [3], atteso: ['1', '2', 'Fizz'] },
      { input: [5], atteso: ['1', '2', 'Fizz', '4', 'Buzz'] },
      {
        input: [15],
        atteso: [
          '1',
          '2',
          'Fizz',
          '4',
          'Buzz',
          'Fizz',
          '7',
          '8',
          'Fizz',
          'Buzz',
          '11',
          'Fizz',
          '13',
          '14',
          'FizzBuzz',
        ],
      },
      { input: [1], atteso: ['1'] },
    ],
  },
  {
    id: 'ordina-numeri',
    titolo: 'Ordina i numeri',
    categoria: 'array',
    difficolta: 'medio',
    testo:
      'Scrivi ordinaNumeri(numeri) che restituisce un nuovo array ordinato dal più piccolo al più grande, senza modificare quello originale. Esempio: ordinaNumeri([3, 1, 2]) restituisce [1, 2, 3].',
    codiceIniziale: `function ordinaNumeri(numeri) {\n  // scrivi qui il tuo codice\n}`,
    nomeFunzione: 'ordinaNumeri',
    test: [
      { input: [[3, 1, 2]], atteso: [1, 2, 3] },
      { input: [[5]], atteso: [5] },
      { input: [[-1, -5, 0]], atteso: [-5, -1, 0] },
      { input: [[]], atteso: [] },
    ],
  },
  {
    id: 'intersezione',
    titolo: 'Elementi in comune',
    categoria: 'array',
    difficolta: 'medio',
    testo:
      "Scrivi intersezione(a, b) che restituisce i valori presenti in entrambi gli array, senza duplicati. Esempio: intersezione([1, 2, 3], [2, 3, 4]) restituisce [2, 3].",
    codiceIniziale: `function intersezione(a, b) {\n  // scrivi qui il tuo codice\n}`,
    nomeFunzione: 'intersezione',
    test: [
      { input: [[1, 2, 3], [2, 3, 4]], atteso: [2, 3] },
      { input: [[1], [2]], atteso: [] },
      { input: [[], []], atteso: [] },
      { input: [[1, 1], [1]], atteso: [1] },
    ],
  },
  {
    id: 'appiattisci',
    titolo: 'Appiattisci un array',
    categoria: 'array',
    difficolta: 'medio',
    testo:
      "Scrivi appiattisci(lista) che toglie un livello di annidamento. Esempio: appiattisci([1, [2, 3], 4]) restituisce [1, 2, 3, 4].",
    codiceIniziale: `function appiattisci(lista) {\n  // scrivi qui il tuo codice\n}`,
    nomeFunzione: 'appiattisci',
    test: [
      { input: [[1, [2, 3], 4]], atteso: [1, 2, 3, 4] },
      { input: [[]], atteso: [] },
      { input: [[[1], [2]]], atteso: [1, 2] },
      { input: [[1, 2]], atteso: [1, 2] },
    ],
  },
]
