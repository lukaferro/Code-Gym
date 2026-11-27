// Prova delle funzioni pure di materieStore.ts: nessun browser, nessuna rete.
import {
  argomentiDaTesto,
  creaId,
  impostaVisibile,
  leggiMaterie,
  materiaNuova,
  rinominaMateria,
  salvaMaterie,
  testoDaArgomenti,
  unisciMaterie,
  validaMaterie,
} from '../src/materieStore.ts';
import { materie } from '../src/materie.ts';

let fallimenti = 0;

function verifica(nome: string, condizione: boolean, dettaglio = ''): void {
    if (condizione) {
        console.log(`OK      ${nome}`);
    } else {
        fallimenti += 1;
        console.log(`FALLITO ${nome}${dettaglio ? ` -> ${dettaglio}` : ''}`);
    }
}

function uguale(nome: string, ottenuto: unknown, atteso: unknown): void {
    const a = JSON.stringify(ottenuto);
    const b = JSON.stringify(atteso);
    verifica(nome, a === b, `atteso ${b}, ottenuto ${a}`);
}

// --- id delle materie -------------------------------------------------------

uguale('id da nome con spazio', creaId('Inglese tecnico', []), 'inglese-tecnico');
uguale('id senza accenti', creaId('Città e Paesi', []), 'citta-e-paesi');
uguale('id con simboli', creaId('C# / .NET', []), 'c-net');
uguale('id vuoto ripiega su materia', creaId('  ***  ', []), 'materia');
uguale('id doppio prende il numero', creaId('SQL', [{ id: 'sql', nome: 'SQL', argomenti: [], eseguibile: false }]), 'sql-2');
uguale(
    'id triplo prende il numero dopo',
    creaId('SQL', [
        { id: 'sql', nome: 'SQL', argomenti: [], eseguibile: false },
        { id: 'sql-2', nome: 'SQL 2', argomenti: [], eseguibile: false },
    ]),
    'sql-3'
);
uguale('id lungo si taglia', creaId('a'.repeat(80), []).length, 40);

// --- argomenti --------------------------------------------------------------

uguale('argomenti da virgole', argomentiDaTesto('a, b , c'), ['a', 'b', 'c']);
uguale('argomenti da righe', argomentiDaTesto('a\nb\n\nc'), ['a', 'b', 'c']);
uguale('argomenti con trattini e numeri', argomentiDaTesto('- uno\n* due\n3. tre\n4) quattro'), [
    'uno',
    'due',
    'tre',
    'quattro',
]);
uguale('argomenti vuoti si scartano', argomentiDaTesto(' , ,\n '), []);
uguale('argomenti limitati a 20', argomentiDaTesto(Array.from({ length: 30 }, (_, i) => `a${i}`).join(',')).length, 20);
uguale('argomento lungo tagliato a 60', argomentiDaTesto('x'.repeat(100))[0].length, 60);
uguale('testo e argomenti sono l inverso', argomentiDaTesto(testoDaArgomenti(['a', 'b'])), ['a', 'b']);

// --- validazione della copia salvata ---------------------------------------

verifica('validazione: non array', validaMaterie('x') === null);
verifica('validazione: array vuoto e valido', JSON.stringify(validaMaterie([])) === '[]');
verifica(
    'validazione: voce rotta scartata, buona tenuta',
    JSON.stringify(
        validaMaterie([
            { id: 'x', nome: 'X', argomenti: ['a'], eseguibile: false },
            { id: 12, nome: 'Rotta', argomenti: [], eseguibile: false },
            { id: 'y', nome: 'Y', argomenti: 'non array', eseguibile: false },
            { id: 'z', nome: 'Z', argomenti: [], eseguibile: 'si' },
        ])
    ) === JSON.stringify([{ id: 'x', nome: 'X', argomenti: ['a'], eseguibile: false }])
);
verifica(
    'validazione: id doppio tenuto una volta',
    (validaMaterie([
        { id: 'x', nome: 'X', argomenti: [], eseguibile: false },
        { id: 'x', nome: 'Doppia', argomenti: [], eseguibile: false },
    ]) ?? []).length === 1
);
verifica(
    'validazione: nascosta vale solo se true',
    JSON.stringify(
        validaMaterie([
            { id: 'x', nome: 'X', argomenti: [], eseguibile: false, nascosta: true },
            { id: 'y', nome: 'Y', argomenti: [], eseguibile: false, nascosta: false },
        ])
    ) ===
        JSON.stringify([
            { id: 'x', nome: 'X', argomenti: [], eseguibile: false, nascosta: true },
            { id: 'y', nome: 'Y', argomenti: [], eseguibile: false },
        ])
);

// --- unione con l'elenco iniziale -----------------------------------------

uguale('unione: da zero arrivano le 9 materie', unisciMaterie([]).length, materie.length);
verifica(
    'unione: il nome modificato resta',
    unisciMaterie([{ id: 'react', nome: 'React avanzato', argomenti: ['hook'], eseguibile: false }])[0]
        .nome === 'React avanzato'
);
verifica(
    'unione: una materia nuova in piu resta in coda',
    unisciMaterie([...materie, { id: 'sql', nome: 'SQL', argomenti: [], eseguibile: false }]).length ===
        materie.length + 1
);
verifica(
    'unione: le nascoste restano nascoste',
    unisciMaterie([{ id: 'git', nome: 'Git', argomenti: [], eseguibile: false, nascosta: true }])
        .find((materia) => materia.id === 'git')?.nascosta === true
);

// --- creazione, rinomina, visibilita --------------------------------------

const nuova = materiaNuova('SQL', ['select', 'join'], materie);
verifica('materia nuova: id libero', nuova.id === 'sql');
verifica('materia nuova: non eseguibile', nuova.eseguibile === false);
uguale('materia nuova: nome pulito', materiaNuova('  SQL  ', [], materie).nome, 'SQL');

const rinominate = rinominaMateria(materie, 'git', 'Git e GitHub', ['branch', 'rebase']);
verifica(
    'rinomina: cambia nome e argomenti',
    rinominate.find((materia) => materia.id === 'git')?.nome === 'Git e GitHub' &&
        rinominate.find((materia) => materia.id === 'git')?.argomenti.join() === 'branch,rebase'
);
verifica('rinomina: id invariato', rinominate.find((materia) => materia.id === 'git')?.id === 'git');
verifica('rinomina: nome vuoto non cambia niente', rinominaMateria(materie, 'git', '   ', []) === materie);
verifica(
    'rinomina: non tocca le altre materie',
    rinominate.find((materia) => materia.id === 'react')?.nome ===
        materie.find((materia) => materia.id === 'react')?.nome
);

const nascoste = impostaVisibile(materie, 'git', false);
verifica(
    'nascondi: solo quella scelta',
    nascoste.filter((materia) => materia.nascosta).length === 1 &&
        nascoste.find((materia) => materia.id === 'git')?.nascosta === true
);
verifica(
    'nascondi: non modifica l elenco di partenza',
    materie.every((materia) => materia.nascosta === undefined)
);
verifica(
    'mostra: la materia torna visibile',
    impostaVisibile(nascoste, 'git', true).find((materia) => materia.id === 'git')?.nascosta === false
);

// --- lettura e scrittura senza browser ------------------------------------

const senzaBrowser = leggiMaterie();
verifica('senza localStorage si parte dall elenco iniziale', senzaBrowser.length === materie.length);
salvaMaterie(senzaBrowser);
verifica('salvaMaterie senza localStorage non lancia errori', true);
verifica(
    'la lettura non condivide gli argomenti con l elenco iniziale',
    senzaBrowser[0].argomenti !== materie[0].argomenti
);

console.log('');
if (fallimenti === 0) {
    console.log('Tutto a posto.');
} else {
    console.log(`${fallimenti} controlli falliti.`);
    process.exitCode = 1;
}
