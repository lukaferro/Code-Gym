import type { VercelRequest, VercelResponse } from '@vercel/node';

type Message = { role: 'system' | 'user' | 'assistant'; content: string };

type Provider = {
    name: string;
    url: string;
    model: string;
    apikey: string | undefined;
};

const gemini = {
    name: 'gemini',
    url: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
    model: 'gemini-3.5-flash-lite',
    apikey: process.env.GEMINI_API_KEY,
};
const groq = {
    name: 'groq',
    url: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'openai/gpt-oss-20b',
    apikey: process.env.GROQ_API_KEY,
};
const openrouter = {
    name: 'openrouter',
    url: 'https://openrouter.ai/api/v1/chat/completions',
    model: 'google/gemma-4-31b-it:free',
    apikey: process.env.OPENROUTER_API_KEY,
};

const providers: Provider[] = [gemini, groq, openrouter];

async function callProvider(provider: Provider, messages: Message[]): Promise<string> {
    const res = await fetch(provider.url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${provider.apikey}`,
        },
        body: JSON.stringify({
            model: provider.model,
            messages: messages,
        }),
    });
    if (!res.ok) {
        const detail = await res.text();
        throw new Error(`HTTP error! status: ${res.status} - ${detail}`);
    }
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content;
    if (!text) throw new Error('Risposta vuota');
    return text;
}

async function askAI(messages: Message[]) {
    for (const provider of providers) {
        if (!provider.apikey) continue;
        try {
            const text = await callProvider(provider, messages);
            return { provider: provider.name, text };
        } catch (error) {
            console.warn(
                'Provider fallito:',
                provider.name,
                error instanceof Error ? error.message : String(error)
            );
        }
    }
    throw new Error('No provider available');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Metodo non consentito' });
    }

    const messages = req.body?.messages;
    if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'Servono dei messaggi' });
    }

    try {
        const result = await askAI(messages);
        return res.status(200).json(result);
    } catch {
        return res.status(503).json({ error: 'Servizio al momento non disponibile' });
    }
}