/* eslint-disable @typescript-eslint/no-explicit-any */
// Prova completa di /api/profilo con req/res finti e database locale.
// Non usa la rete e non consuma quote IA.
import { rmSync } from 'node:fs';
import handler from '../api/profilo.ts';
import { creaClient, creaTabella, leggiProfilo } from '../lib/db.ts';
import { estraiProfilo } from '../src/profili.ts';
import type { Messaggio } from '../src/tutor.ts';

process.env.APP_PASSWORD = 'prova';
process.env.TURSO_DATABASE_URL = 'file:prova-profili.db';

rmSync('prova-profili.db', { force: true });

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

const conversazione: Messaggio[] = [
  { role: 'user', content: 'Iniziamo il test di livello.' },
  { role: 'assistant', content: 'Prima domanda: cosa restituisce 2 + 3?' },
  { role: 'user', content: '5' },
  {
    role: 'assistant',
    content: 'Giusto.\n\nPROFILO:\n- Punti forti: basi solide\n- Da ripassare: cicli',
  },
];

const profilo = {
  materia: 'javascript',
  conversazione,
  profilo: estraiProfilo(conversazione),
};

const conPassword = { 'x-app-password': 'prova' };

async function prova(nome: string, req: any, atteso: number): Promise<any> {
  const res = makeRes();
  await handler(req, res);
  const segno = res.codice === atteso ? 'OK     ' : 'FALLITO';
  console.log(`${segno} ${nome}: atteso ${atteso}, ottenuto ${res.codice}`, res.corpo);
  return res;
}

console.log('profilo estratto:', JSON.stringify(profilo.profilo));

await prova('GET senza password', { method: 'GET', headers: {}, query: {} }, 401);
await prova('PUT senza password', { method: 'PUT', headers: {}, body: profilo }, 401);
await prova('DELETE senza password', { method: 'DELETE', headers: {}, query: {} }, 401);

await prova(
  'materia vuota',
  { method: 'PUT', headers: conPassword, body: { ...profilo, materia: '' } },
  400
);
await prova(
  'conversazione vuota',
  { method: 'PUT', headers: conPassword, body: { ...profilo, conversazione: [] } },
  400
);
await prova(
  'troppi messaggi',
  {
    method: 'PUT',
    headers: conPassword,
    body: {
      ...profilo,
      conversazione: Array.from({ length: 31 }, () => ({ role: 'user', content: 'x' })),
    },
  },
  400
);
await prova(
  'ruolo non valido',
  {
    method: 'PUT',
    headers: conPassword,
    body: { ...profilo, conversazione: [{ role: 'system', content: 'x' }] },
  },
  400
);
await prova(
  'messaggio vuoto',
  {
    method: 'PUT',
    headers: conPassword,
    body: { ...profilo, conversazione: [{ role: 'user', content: '   ' }] },
  },
  400
);
await prova(
  'profilo troppo lungo',
  { method: 'PUT', headers: conPassword, body: { ...profilo, profilo: 'x'.repeat(4001) } },
  400
);
await prova(
  'GET materia non valida',
  { method: 'GET', headers: conPassword, query: { materia: '' } },
  400
);

await prova('PUT valido', { method: 'PUT', headers: conPassword, body: profilo }, 200);
await prova(
  'GET materia',
  { method: 'GET', headers: conPassword, query: { materia: 'javascript' } },
  200
);
await prova('GET tutte', { method: 'GET', headers: conPassword, query: {} }, 200);

const lettura = await creaClient();
const salvato = await leggiProfilo(lettura, 'javascript');
console.log(
  salvato
    ? `OK      riga salvata: ${salvato.conversazione.length} messaggi, profilo ${salvato.profilo.length} caratteri`
    : 'FALLITO riga non trovata'
);
lettura.close();

const aggiornato = { ...profilo, conversazione: conversazione.slice(0, 2), profilo: '' };
await prova('PUT aggiorna la riga', { method: 'PUT', headers: conPassword, body: aggiornato }, 200);

const rilettura = await creaClient();
const dopo = await leggiProfilo(rilettura, 'javascript');
console.log(
  dopo && dopo.conversazione.length === 2
    ? 'OK      la seconda PUT ha sostituito la riga'
    : 'FALLITO la seconda PUT non ha aggiornato la riga'
);
rilettura.close();

const cancellazione = await prova(
  'DELETE',
  { method: 'DELETE', headers: conPassword, query: { materia: 'javascript' } },
  200
);
console.log(
  (cancellazione.corpo as { eliminati?: number }).eliminati === 1
    ? 'OK      DELETE ha eliminato 1 riga'
    : 'FALLITO DELETE non ha eliminato la riga'
);

await prova(
  'GET dopo DELETE',
  { method: 'GET', headers: conPassword, query: { materia: 'javascript' } },
  200
);
await prova(
  'metodo non consentito',
  { method: 'POST', headers: conPassword, body: profilo },
  405
);
