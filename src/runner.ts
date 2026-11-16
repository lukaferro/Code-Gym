import type { Esercizio } from './esercizi';

export type RisultatoTest = {
    input: unknown[];
    atteso: unknown;
    ottenuto: unknown;
    corretto: boolean;
    errore?: string;
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