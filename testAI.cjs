const fetch = require('node-fetch');

const AI_CONFIG = {
    GEMINI: {
        API_KEY: 'AIzaSyCdxo8zwL1ivCtf4M5HYa8IFVOru3rY4Xs',
        ENDPOINT: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent'
    }
};

async function testGemini() {
    try {
        const response = await fetch(AI_CONFIG.GEMINI.ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-goog-api-key': AI_CONFIG.GEMINI.API_KEY
            },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            {
                                text: 'Explain how AI works in a few words'
                            }
                        ]
                    }
                ]
            })
        });

        if (!response.ok) {
            console.error('API Error:', response.status, response.statusText);
            const errorText = await response.text();
            console.error('Error Details:', errorText);
            return;
        }

        const data = await response.json();
        console.log('Gemini Response:', data);
    } catch (error) {
        console.error('Error during API call:', error);
    }
}

testGemini();