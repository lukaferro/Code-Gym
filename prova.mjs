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

const providers = [gemini, groq];

async function callProvider(provider, messages) {
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
    return data.choices[0].message.content;
}
async function askAI(messages) {
    for (const provider of providers) {
        try {
            const response = await callProvider(provider, messages);
            return response;
        } catch (error) {
            console.warn('Provider fallito:', provider.name, error.message);
        }
    }
    throw new Error('No provider available');
}

const result = await askAI([{ role: 'user', content: 'Dimmi ciao in inglese' }]);
console.log(result);