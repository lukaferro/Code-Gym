const provider = {
    // name: 'gemini',
    // url: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions',
    // model: 'gemini-3.5-flash-lite',
    // apikey: process.env.GEMINI_API_KEY,
    name: 'groq',
    url: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'gemini-3.5-flash-lite',
    apikey: process.env.GROQ_API_KEY,
}
async function callProvider(provider, messages) {
    const res = await fetch(provider.url, {
        method: 'POST',
        headers: {
            'Content-Type' : 'application/json',
            Authorization: `Bearer ${provider.apikey}`,
        },
        body: JSON.stringify({
            model: provider.model,
            messages: messages,
        }),
    });
    if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
    }
    const data = await res.json();
    return data.choices[0].message.content;
}

const text = await callProvider(provider, [{ role: 'user', content: 'Dimmi ciao in inglese'}]);
console.log(text);