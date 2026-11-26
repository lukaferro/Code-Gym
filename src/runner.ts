import type { Esercizio } from './esercizi.ts';

export type RisultatoTest = {
    input: unknown[];
    atteso: unknown;
    ottenuto: unknown;
    corretto: boolean;
    errore?: string;
}

// Cosa il worker riceve: il codice scritto dall'utente e l'esercizio da verificare.
export type RichiestaTest = {
    codice: string;
    esercizio: Esercizio;
}

// Cosa il worker restituisce: i risultati e quello che il codice ha stampato.
// `troncato` dice che le righe sono state tagliate per non bloccare la pagina.
export type RispostaTest = {
    risultati: RisultatoTest[];
    log: string[];
    troncato: boolean;
}

// Risultati finti usati quando il worker viene terminato per tempo scaduto.
export function risultatiTempoScaduto(esercizio: Esercizio): RisultatoTest[] {
    return esercizio.test.map(test => ({
        input: test.input,
        atteso: test.atteso,
        ottenuto: undefined,
        corretto: false,
        errore: 'Tempo scaduto: possibile ciclo infinito',
    }));
}

export function eseguiTest(codice: string, esercizio: Esercizio): RisultatoTest[] {

    const risultati: RisultatoTest[] = [];

    let funzione: (...args: unknown[]) => unknown;
    try {
        funzione = new Function(codice + '\nreturn ' + esercizio.nomeFunzione + ';')();
    } catch (errore) {
        const messaggio = errore instanceof Error ? errore.message : String(errore);
        return esercizio.test.map(test => ({
            input: test.input,
            atteso: test.atteso,
            ottenuto: undefined,
            corretto: false,
            errore: messaggio
        }));
    }

    for (const test of esercizio.test) {
        try {
            const ottenuto = funzione(...test.input);
            const corretto = JSON.stringify(ottenuto) === JSON.stringify(test.atteso);
            risultati.push({
                input: test.input,
                atteso: test.atteso,
                ottenuto,
                corretto
            });
        } catch (errore) {
            risultati.push({
                input: test.input,
                atteso: test.atteso,
                ottenuto: undefined,
                corretto: false,
                errore: errore instanceof Error ? errore.message : String(errore)
            });
        }
    }

    return risultati;
}