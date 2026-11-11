/* eslint-disable @typescript-eslint/no-explicit-any */
import handler from './api/ai.ts';

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

console.log('--- POST valido ---');
await handler(
  { method: 'POST', body: { messages: [{ role: 'user', content: 'Dimmi ciao in inglese' }] } } as any,
  makeRes()
);

console.log('--- GET (deve dare 405) ---');
await handler({ method: 'GET' } as any, makeRes());

console.log('--- messaggi vuoti (deve dare 400) ---');
await handler({ method: 'POST', body: { messages: [] } } as any, makeRes());