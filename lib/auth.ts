import type { VercelRequest, VercelResponse } from '@vercel/node';

// Controlla l'header x-app-password.
// Se la richiesta non è autorizzata risponde 401 e restituisce false,
// così l'endpoint può uscire subito senza duplicare il controllo.
export function autorizza(req: VercelRequest, res: VercelResponse): boolean {
    const intestazione = req.headers['x-app-password'];
    const password = Array.isArray(intestazione) ? intestazione[0] : intestazione;

    if (!process.env.APP_PASSWORD || password !== process.env.APP_PASSWORD) {
        res.status(401).json({ error: 'Non autorizzato' });
        return false;
    }

    return true;
}
