
import { GoogleGenAI } from "@google/genai";
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load env simply
const envPath = resolve('.env.local');
let apiKey = '';
try {
    const envContent = readFileSync(envPath, 'utf-8');
    const match = envContent.match(/GEMINI_API_KEY=(.*)/);
    if (match) apiKey = match[1].trim();
} catch (e) {
    console.error("Could not read .env.local");
}

if (!apiKey) {
    console.error("No API KEY found in .env.local");
    process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

async function main() {
    try {
        console.log("Listing models...");
        const response = await ai.models.list();
        // Assuming response is strict JSON or iterable
        // The new SDK list() returns a paginated list or iterable? 
        // Let's try to iterate or log it.
        // If it returns { models: [...] }
        if (response.models) {
            response.models.forEach(m => console.log(m.name));
        } else {
            // Iterable?
            for (const m of response) {
                console.log(m.name);
            }
        }
    } catch (err) {
        console.error("Error listing models:", err);
        // Print full error object
        console.dir(err, { depth: null });
    }
}

main();
