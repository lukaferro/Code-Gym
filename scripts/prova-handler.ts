/* eslint-disable @typescript-eslint/no-explicit-any */
import handler from '../api/ai.ts';

function makeRes() {
  const res: any = {
    status(code: number) {
      console.log('status:', code);
      return res;
    },
    json(data: unknown) {
      console.log('risposta:', data);
      return res;
    },
  };
  return res;
}

const messages = [{ role: 'user', content: 'Dimmi ciao in inglese' }];

console.log('--- password giusta (deve dare 200) ---');
await handler(
  {
    method: 'POST',
    headers: { 'x-app-password': process.env.APP_PASSWORD },
    body: { messages },
  } as any,
  makeRes()
);

console.log('--- password sbagliata (deve dare 401) ---');
await handler(
  {
    method: 'POST',
    headers: { 'x-app-password': 'sbagliata' },
    body: { messages },
  } as any,
  makeRes()
);

console.log('--- senza password (deve dare 401) ---');
await handler(
  { method: 'POST', headers: {}, body: { messages } } as any,
  makeRes()
);

console.log('--- GET (deve dare 405) ---');
await handler({ method: 'GET', headers: {} } as any, makeRes());

console.log('--- messaggi vuoti con password giusta (deve dare 400) ---');
await handler(
  {
    method: 'POST',
    headers: { 'x-app-password': process.env.APP_PASSWORD },
    body: { messages: [] },
  } as any,
  makeRes()
);

console.log('--- APP_PASSWORD non impostata (deve dare 401, non 200) ---');
const passwordSalvata = process.env.APP_PASSWORD;
delete process.env.APP_PASSWORD;
await handler({ method: 'POST', headers: {}, body: { messages } } as any, makeRes());
process.env.APP_PASSWORD = passwordSalvata;