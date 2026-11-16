const url = 'https://code-gym-chi.vercel.app/api/ai';

const res = await fetch(url, {
  method: 'POST',
  redirect: 'manual',
  headers: {
    'Content-Type': 'application/json',
    'x-app-password': process.env.APP_PASSWORD,
  },
  body: JSON.stringify({
    messages: [{ role: 'user', content: 'Dimmi ciao in inglese' }],
  }),
});

const body = await res.text();
console.log('POST stato:', res.status);
console.log('POST corpo:', body);

console.log('--- stessa url, ma GET ---');
const resGet = await fetch(url);
console.log('stato:', resGet.status);
console.log('corpo:', (await resGet.text()).slice(0, 150));

console.log('--- header del POST ---');
for (const [k, v] of res.headers) console.log(k + ':', v);