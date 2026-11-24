// Link ai docs, generati dalla categoria dell'esercizio: nessuna IA, nessuna quota.
// Puntiamo a MDN in inglese perché la versione italiana è tradotta a metà;
// leggere i docs in inglese allena anche al colloquio.
const ARGOMENTI_MDN: Record<string, string> = {
  stringhe: 'String',
  array: 'Array',
  numeri: 'Number',
  ricorsione: 'recursion',
}

export function linkMdn(categoria: string): string {
  const argomento = ARGOMENTI_MDN[categoria] ?? categoria
  return `https://developer.mozilla.org/en-US/search?q=${encodeURIComponent(argomento)}`
}
