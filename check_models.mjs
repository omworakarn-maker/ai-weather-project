import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyAXU_iv00ASKtbzNj_OlV5yXCaUAqNmxp8";
const genAI = new GoogleGenerativeAI(API_KEY);

async function listModels() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        // Note: The SDK doesn't expose listModels directly in instances easily without admin rights typically,
        // but usually standard keys can't list models. However, standard integration suggests 'gemini-1.5-flash' is correct.

        // Let's try a simple generation to test connectivity with 'gemini-1.5-flash-001' (specific version)
        console.log("Testing gemini-1.5-flash-001...");
        const modelSpecific = genAI.getGenerativeModel({ model: "gemini-1.5-flash-001" });
        const result = await modelSpecific.generateContent("Hello?");
        console.log("Success with gemini-1.5-flash-001");
    } catch (error) {
        console.error("Error with 001:", error.message);
    }

    try {
        console.log("Testing gemini-pro...");
        const modelPro = genAI.getGenerativeModel({ model: "gemini-pro" });
        await modelPro.generateContent("Test");
        console.log("Success with gemini-pro");
    } catch (e) { console.log("gemini-pro failed"); }
}

listModels();
