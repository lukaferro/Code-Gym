import type { Client } from '@libsql/client';
import type { Tentativo } from '../src/tipi.ts';

// Il tipo di client dipende dalla URL:
// - libsql://... -> Turso via HTTP: funziona su Vercel, nessun binario nativo da caricare
// - file:...     -> file SQLite locale, solo per gli script di prova sul PC
export async function creaClient(): Promise<Client> {
    const url = process.env.TURSO_DATABASE_URL;
    if (!url) throw new Error('TURSO_DATABASE_URL non impostata');

    if (url.startsWith('file:')) {
        const { createClient } = await import('@libsql/client');
        return createClient({ url });
    }

    const { createClient } = await import('@libsql/client/web');
    return createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
}

export async function creaTabella(db: Client): Promise<void> {
    await db.execute(`
        CREATE TABLE IF NOT EXISTS tentativi (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            esercizio_id TEXT NOT NULL,
            materia TEXT NOT NULL DEFAULT 'javascript',
            tipo TEXT NOT NULL DEFAULT 'consegna',
            esito INTEGER NOT NULL,
            superati INTEGER NOT NULL,
            totale INTEGER NOT NULL,
            durata_ms INTEGER NOT NULL,
            indizi INTEGER NOT NULL DEFAULT 0,
            lezioni INTEGER NOT NULL DEFAULT 0,
            errori TEXT NOT NULL,
            data TEXT NOT NULL
        )
    `);

    // Le tabelle create prima dell'arrivo delle materie non hanno la colonna:
    // la aggiungiamo senza perdere le righe esistenti.
    const colonne = await db.execute("SELECT name FROM pragma_table_info('tentativi')");
    const haMateria = colonne.rows.some((riga) => riga.name === 'materia');
    if (!haMateria) {
        await db.execute("ALTER TABLE tentativi ADD COLUMN materia TEXT NOT NULL DEFAULT 'javascript'");
    }

    const haLezioni = colonne.rows.some((riga) => riga.name === 'lezioni');
    if (!haLezioni) {
        await db.execute('ALTER TABLE tentativi ADD COLUMN lezioni INTEGER NOT NULL DEFAULT 0');
    }

    const haTipo = colonne.rows.some((riga) => riga.name === 'tipo');
    if (!haTipo) {
        // Le righe salvate prima delle prove automatiche sono tutte consegne.
        await db.execute("ALTER TABLE tentativi ADD COLUMN tipo TEXT NOT NULL DEFAULT 'consegna'");
    }

    await db.execute('CREATE INDEX IF NOT EXISTS idx_tentativi_esercizio ON tentativi(esercizio_id)');
    await db.execute('CREATE INDEX IF NOT EXISTS idx_tentativi_data ON tentativi(data)');
}

export async function salvaTentativo(db: Client, tentativo: Tentativo): Promise<number> {
    const risultato = await db.execute({
        sql: `INSERT INTO tentativi
              (esercizio_id, materia, tipo, esito, superati, totale, durata_ms, indizi, lezioni, errori, data)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
            tentativo.esercizioId,
            tentativo.materia,
            tentativo.tipo,
            tentativo.esito ? 1 : 0,
            tentativo.superati,
            tentativo.totale,
            tentativo.durataMs,
            tentativo.indizi,
            tentativo.lezioni,
            JSON.stringify(tentativo.errori),
            tentativo.data,
        ],
    });

    return Number(risultato.lastInsertRowid ?? 0);
}

export async function leggiTentativi(db: Client, limite = 50): Promise<Tentativo[]> {
    const risultato = await db.execute({
        sql: `SELECT id, esercizio_id, materia, tipo, esito, superati, totale, durata_ms, indizi, lezioni, errori, data
              FROM tentativi ORDER BY id DESC LIMIT ?`,
        args: [limite],
    });

    return risultato.rows.map((riga) => ({
        id: Number(riga.id),
        esercizioId: String(riga.esercizio_id),
        materia: String(riga.materia),
        tipo: String(riga.tipo) === 'prova' ? 'prova' : 'consegna',
        esito: Number(riga.esito) === 1,
        superati: Number(riga.superati),
        totale: Number(riga.totale),
        durataMs: Number(riga.durata_ms),
        indizi: Number(riga.indizi),
        lezioni: Number(riga.lezioni),
        errori: JSON.parse(String(riga.errori)) as string[],
        data: String(riga.data),
    }));
}
