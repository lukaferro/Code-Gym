import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { Client } from '@libsql/client';

// Copia di src/tipi.ts: gli endpoint dentro api/ devono essere autosufficienti
// (Vercel non spedisce i file condivisi dentro api/ né li risolve da fuori).
// Se cambi un campo qui, cambialo anche in src/tipi.ts.
type Tentativo = {
    id?: number;
    esercizioId: string;
    materia: string;
    esito: boolean;
    superati: number;
    totale: number;
    durataMs: number;
    indizi: number;
    errori: string[];
    data: string;
};

const MAX_ERRORI = 5;
const MAX_LUNGHEZZA_ERRORE = 300;
const MAX_DURATA_MS = 60 * 60 * 1000;

// Copia di lib/auth.ts: stessa ragione della copia del tipo qui sopra.
function autorizza(req: VercelRequest, res: VercelResponse): boolean {
    const intestazione = req.headers['x-app-password'];
    const password = Array.isArray(intestazione) ? intestazione[0] : intestazione;

    if (!process.env.APP_PASSWORD || password !== process.env.APP_PASSWORD) {
        res.status(401).json({ error: 'Non autorizzato' });
        return false;
    }

    return true;
}

// Il tipo di client dipende dalla URL:
// - libsql://... -> Turso via HTTP: funziona su Vercel, nessun binario nativo
// - file:...     -> file SQLite locale, solo per gli script di prova sul PC
async function creaClient(): Promise<Client> {
    const url = process.env.TURSO_DATABASE_URL;
    if (!url) throw new Error('TURSO_DATABASE_URL non impostata');

    if (url.startsWith('file:')) {
        const { createClient } = await import('@libsql/client');
        return createClient({ url });
    }

    const { createClient } = await import('@libsql/client/web');
    return createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
}

async function salvaTentativo(db: Client, tentativo: Tentativo): Promise<number> {
    const risultato = await db.execute({
        sql: `INSERT INTO tentativi
              (esercizio_id, materia, esito, superati, totale, durata_ms, indizi, errori, data)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
            tentativo.esercizioId,
            tentativo.materia,
            tentativo.esito ? 1 : 0,
            tentativo.superati,
            tentativo.totale,
            tentativo.durataMs,
            tentativo.indizi,
            JSON.stringify(tentativo.errori),
            tentativo.data,
        ],
    });

    return Number(risultato.lastInsertRowid ?? 0);
}

function intero(valore: unknown, minimo: number, massimo: number): number | null {
    if (typeof valore !== 'number' || !Number.isInteger(valore)) return null;
    if (valore < minimo || valore > massimo) return null;
    return valore;
}

// Controlla il corpo della richiesta e restituisce un Tentativo pulito,
// oppure null se i dati non sono accettabili.
export function validaTentativo(corpo: unknown): Tentativo | null {
    if (typeof corpo !== 'object' || corpo === null) return null;
    const dati = corpo as Record<string, unknown>;

    const esercizioId = dati.esercizioId;
    if (typeof esercizioId !== 'string' || esercizioId.length === 0 || esercizioId.length > 100) {
        return null;
    }

    const materia = dati.materia;
    if (typeof materia !== 'string' || materia.length === 0 || materia.length > 100) {
        return null;
    }

    if (typeof dati.esito !== 'boolean') return null;

    const superati = intero(dati.superati, 0, 1000);
    const totale = intero(dati.totale, 0, 1000);
    const durataMs = intero(dati.durataMs, 0, MAX_DURATA_MS);
    const indizi = intero(dati.indizi, 0, 100);
    if (superati === null || totale === null || durataMs === null || indizi === null) return null;
    if (superati > totale) return null;

    if (!Array.isArray(dati.errori) || dati.errori.length > MAX_ERRORI) return null;
    const errori: string[] = [];
    for (const errore of dati.errori) {
        if (typeof errore !== 'string') return null;
        errori.push(errore.slice(0, MAX_LUNGHEZZA_ERRORE));
    }

    return {
        esercizioId,
        materia,
        esito: dati.esito,
        superati,
        totale,
        durataMs,
        indizi,
        errori,
        // la data la decide il server: dal browser non è affidabile
        data: new Date().toISOString(),
    };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Metodo non consentito' });
    }
    if (!autorizza(req, res)) return;

    const tentativo = validaTentativo(req.body);
    if (!tentativo) {
        return res.status(400).json({ error: 'Dati del tentativo non validi' });
    }

    try {
        const db = await creaClient();
        const id = await salvaTentativo(db, tentativo);
        return res.status(201).json({ id });
    } catch (errore) {
        console.error(
            'Salvataggio tentativo fallito:',
            errore instanceof Error ? errore.message : String(errore)
        );
        return res.status(503).json({ error: 'Salvataggio non disponibile' });
    }
}
