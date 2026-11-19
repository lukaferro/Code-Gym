import type { VercelRequest, VercelResponse } from '@vercel/node';
import { autorizza } from './_auth.ts';
import { creaClient, salvaTentativo } from './_db.ts';
import type { Tentativo } from '../src/tipi.ts';

const MAX_ERRORI = 5;
const MAX_LUNGHEZZA_ERRORE = 300;
const MAX_DURATA_MS = 60 * 60 * 1000;

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
