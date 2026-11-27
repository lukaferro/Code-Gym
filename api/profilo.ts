import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { Client } from '@libsql/client';

// Copia di src/tipi.ts: gli endpoint dentro api/ devono essere autosufficienti
// (Vercel non spedisce i file condivisi dentro api/ né li risolve da fuori).
type Messaggio = {
    role: 'user' | 'assistant';
    content: string;
};

type ProfiloTest = {
    materia: string;
    conversazione: Messaggio[];
    profilo: string;
    aggiornato: string;
};

const MAX_MESSAGGI = 30;
const MAX_CARATTERI_MESSAGGIO = 4000;
const MAX_CARATTERI_TOTALI = 40000;
const MAX_PROFILO = 4000;

// Copia di lib/auth.ts: stessa ragione della copia dei tipi qui sopra.
function autorizza(req: VercelRequest, res: VercelResponse): boolean {
    const intestazione = req.headers['x-app-password'];
    const password = Array.isArray(intestazione) ? intestazione[0] : intestazione;

    if (!process.env.APP_PASSWORD || password !== process.env.APP_PASSWORD) {
        res.status(401).json({ error: 'Non autorizzato' });
        return false;
    }

    return true;
}

// Il tipo di client dipende dalla URL (vedi api/tentativi.ts).
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

function leggiMateria(valore: unknown): string | null {
    if (typeof valore !== 'string') return null;
    const pulito = valore.trim();
    if (pulito.length === 0 || pulito.length > 100) return null;
    return pulito;
}

// Controlla il corpo di una PUT e restituisce il profilo pronto da salvare.
function validaProfilo(corpo: unknown): ProfiloTest | null {
    if (typeof corpo !== 'object' || corpo === null) return null;
    const dati = corpo as Record<string, unknown>;

    const materia = leggiMateria(dati.materia);
    if (!materia) return null;

    if (!Array.isArray(dati.conversazione)) return null;
    if (dati.conversazione.length === 0 || dati.conversazione.length > MAX_MESSAGGI) return null;

    let caratteriTotali = 0;
    const conversazione: Messaggio[] = [];
    for (const voce of dati.conversazione) {
        if (typeof voce !== 'object' || voce === null) return null;
        const messaggio = voce as Record<string, unknown>;

        if (messaggio.role !== 'user' && messaggio.role !== 'assistant') return null;
        if (typeof messaggio.content !== 'string') return null;
        if (messaggio.content.trim().length === 0) return null;
        if (messaggio.content.length > MAX_CARATTERI_MESSAGGIO) return null;

        caratteriTotali += messaggio.content.length;
        if (caratteriTotali > MAX_CARATTERI_TOTALI) return null;

        conversazione.push({ role: messaggio.role, content: messaggio.content });
    }

    if (typeof dati.profilo !== 'string' || dati.profilo.length > MAX_PROFILO) return null;

    return {
        materia,
        conversazione,
        profilo: dati.profilo,
        // la data la decide il server: dal browser non è affidabile
        aggiornato: new Date().toISOString(),
    };
}

async function leggiProfilo(db: Client, materia: string): Promise<ProfiloTest | null> {
    const risultato = await db.execute({
        sql: 'SELECT materia, conversazione, profilo, aggiornato FROM profili WHERE materia = ?',
        args: [materia],
    });

    const riga = risultato.rows[0];
    if (!riga) return null;

    return {
        materia: String(riga.materia),
        conversazione: JSON.parse(String(riga.conversazione)) as Messaggio[],
        profilo: String(riga.profilo),
        aggiornato: String(riga.aggiornato),
    };
}

async function salvaProfilo(db: Client, profilo: ProfiloTest): Promise<void> {
    await db.execute({
        sql: `INSERT INTO profili (materia, conversazione, profilo, aggiornato)
              VALUES (?, ?, ?, ?)
              ON CONFLICT(materia) DO UPDATE SET
                conversazione = excluded.conversazione,
                profilo = excluded.profilo,
                aggiornato = excluded.aggiornato`,
        args: [
            profilo.materia,
            JSON.stringify(profilo.conversazione),
            profilo.profilo,
            profilo.aggiornato,
        ],
    });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (!autorizza(req, res)) return;

    if (req.method === 'GET') {
        const grezza = req.query.materia;
        const materia = Array.isArray(grezza) ? grezza[0] : grezza;

        try {
            const db = await creaClient();

            if (materia === undefined) {
                const risultato = await db.execute(
                    'SELECT materia, conversazione, profilo, aggiornato FROM profili ORDER BY aggiornato DESC'
                );
                const profili: ProfiloTest[] = risultato.rows.map((riga) => ({
                    materia: String(riga.materia),
                    conversazione: JSON.parse(String(riga.conversazione)) as Messaggio[],
                    profilo: String(riga.profilo),
                    aggiornato: String(riga.aggiornato),
                }));
                return res.status(200).json({ profili });
            }

            const scelta = leggiMateria(materia);
            if (!scelta) return res.status(400).json({ error: 'Materia non valida' });

            const profilo = await leggiProfilo(db, scelta);
            return res.status(200).json({ profilo });
        } catch (errore) {
            console.error(
                'Lettura profilo fallita:',
                errore instanceof Error ? errore.message : String(errore)
            );
            return res.status(503).json({ error: 'Lettura non disponibile' });
        }
    }

    if (req.method === 'DELETE') {
        const grezza = req.query.materia;
        const materia = leggiMateria(Array.isArray(grezza) ? grezza[0] : grezza);
        if (!materia) return res.status(400).json({ error: 'Materia non valida' });

        try {
            const db = await creaClient();
            const risultato = await db.execute({
                sql: 'DELETE FROM profili WHERE materia = ?',
                args: [materia],
            });
            return res.status(200).json({ eliminati: Number(risultato.rowsAffected ?? 0) });
        } catch (errore) {
            console.error(
                'Cancellazione profilo fallita:',
                errore instanceof Error ? errore.message : String(errore)
            );
            return res.status(503).json({ error: 'Cancellazione non disponibile' });
        }
    }

    if (req.method !== 'PUT') {
        return res.status(405).json({ error: 'Metodo non consentito' });
    }

    const profilo = validaProfilo(req.body);
    if (!profilo) {
        return res.status(400).json({ error: 'Dati del profilo non validi' });
    }

    try {
        const db = await creaClient();
        await salvaProfilo(db, profilo);
        return res.status(200).json({ ok: true });
    } catch (errore) {
        console.error(
            'Salvataggio profilo fallito:',
            errore instanceof Error ? errore.message : String(errore)
        );
        return res.status(503).json({ error: 'Salvataggio non disponibile' });
    }
}
