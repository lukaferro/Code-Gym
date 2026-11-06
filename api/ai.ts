// import type { VercelRequest, VercelResponse } from '@vercel/node';

// type Message = { role: 'system' | 'user' | 'assistant'; content: string };

// type Provider = {
//   name: string;
//   url: string;
//   model: string;
//   apiKey: string | undefined;
// };

// // TODO: lista in ordine di priorità: gemini, groq, openrouter
// const providers: Provider[] = [];

// // TODO: memorizza fino a quando ogni provider va saltato
// const cooldownUntil: Record<string, number> = {};

// async function callProvider(p: Provider, messages: Message[]): Promise<string> {
//   // TODO: fetch POST con Authorization: Bearer <chiave>
//   // TODO: body { model, messages }
//   // TODO: timeout con AbortController
//   // TODO: se !res.ok, lancia un errore che contiene lo status
//   // TODO: ritorna data.choices[0].message.content
// }

// export default async function handler(req: VercelRequest, res: VercelResponse) {
//   // TODO: accetta solo POST e valida che messages sia un array non vuoto
//   // TODO: ciclo sui provider: salta chi è in pausa o senza chiave
//   // TODO: se ha successo, rispondi { provider, text }
//   // TODO: se falliscono tutti, rispondi 503 con un messaggio chiaro
// }