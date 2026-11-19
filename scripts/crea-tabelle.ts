import { creaClient, creaTabella } from '../lib/db.ts';

// Se non c'è TURSO_DATABASE_URL usiamo un file locale, così puoi provare tutto senza account.
process.env.TURSO_DATABASE_URL ??= 'file:sviluppo.db';

const db = await creaClient();
await creaTabella(db);

const url = process.env.TURSO_DATABASE_URL;
console.log('Tabelle create o già presenti su:', url.startsWith('file:') ? url : 'Turso');

db.close();
