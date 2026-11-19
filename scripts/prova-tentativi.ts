/* eslint-disable @typescript-eslint/no-explicit-any */
// Prova completa di /api/tentativi con req/res finti e database locale.
// Non usa la rete e non consuma quote IA.
import { rmSync } from 'node:fs';
import handler from '../api/tentativi.ts';
import { creaClient, creaTabella, leggiTentativi } from '../lib/db.ts';

process.env.APP_PASSWORD = 'prova';
process.env.TURSO_DATABASE_URL = 'file:prova-tentativi.db';

rmSync('prova-tentativi.db', { force: true });

const db = await creaClient();
await creaTabella(db);
db.close();

function makeRes() {
  const res: any = {
    codice: 0,
    corpo: null as unknown,
    status(codice: number) {
      res.codice = codice;
      return res;
    },
    json(corpo: unknown) {
      res.corpo = corpo;
      return res;
    },
  };
  return res;
}

const valido = {
  esercizioId: 'inverti-stringa',
  esito: true,
  superati: 3,
  totale: 3,
  durataMs: 45000,
  indizi: 0,
  errori: [],
};

async function prova(nome: string, req: any, atteso: number): Promise<any> {
  const res = makeRes();
  await handler(req, res);
  const segno = res.codice === atteso ? 'OK     ' : 'FALLITO';
  console.log(`${segno} ${nome}: atteso ${atteso}, ottenuto ${res.codice}`, res.corpo);
  return res;
}

await prova('senza password', { method: 'POST', headers: {}, body: valido }, 401);
await prova(
  'password sbagliata',
  { method: 'POST', headers: { 'x-app-password': 'sbagliata' }, body: valido },
  401
);
await prova('GET', { method: 'GET', headers: { 'x-app-password': 'prova' } }, 405);
await prova(
  'esito non booleano',
  { method: 'POST', headers: { 'x-app-password': 'prova' }, body: { ...valido, esito: 'si' } },
  400
);
await prova(
  'superati maggiore del totale',
  { method: 'POST', headers: { 'x-app-password': 'prova' }, body: { ...valido, superati: 5 } },
  400
);
await prova(
  'esercizioId vuoto',
  { method: 'POST', headers: { 'x-app-password': 'prova' }, body: { ...valido, esercizioId: '' } },
  400
);
await prova(
  'troppi errori',
  {
    method: 'POST',
    headers: { 'x-app-password': 'prova' },
    body: { ...valido, errori: ['a', 'b', 'c', 'd', 'e', 'f'] },
  },
  400
);
await prova('tentativo valido', { method: 'POST', headers: { 'x-app-password': 'prova' }, body: valido }, 201);
await prova(
  'tentativo fallito valido',
  {
    method: 'POST',
    headers: { 'x-app-password': 'prova' },
    body: {
      ...valido,
      esito: false,
      superati: 1,
      indizi: 2,
      errori: ['Tempo scaduto: possibile ciclo infinito'],
    },
  },
  201
);

const lettura = await creaClient();
const tentativi = await leggiTentativi(lettura);
console.log('\nRighe salvate:', tentativi.length);
for (const t of tentativi) {
  console.log(' ', t.id, t.esercizioId, 'esito', t.esito, `${t.superati}/${t.totale}`, `${t.durataMs}ms`, 'indizi', t.indizi, t.errori);
}
lettura.close();
