
import { GoogleGenerativeAI } from "@google/generative-ai";

// API Key ที่เราใช้อยู่จริง
const API_KEY = "AIzaSyCdxo8zwL1ivCtf4M5HYa8IFVOru3rY4Xs";

const genAI = new GoogleGenerativeAI(API_KEY);

async function listModels() {
    try {
        console.log("Fetching available models...");
        // ใช้ API ดิบๆ เพื่อดึง list ถ้า SDK มีปัญหา หรือลองเรียกผ่าน SDK
        // SDK ไม่มี method listModels โดยตรงใน version บางตัว แต่เราลองใช้ fetch ตรงๆ ได้

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
        const data = await response.json();

        if (data.models) {
            console.log("\n=== รายชื่อโมเดลที่ใช้ได้ ===");
            data.models.forEach(m => {
                if (m.supportedGenerationMethods.includes("generateContent")) {
                    console.log(`- ${m.name.replace('models/', '')} \t(Version: ${m.version})`);
                }
            });
            console.log("\n==========================");
        } else {
            console.error("ไม่พบโมเดล หรือเกิดข้อผิดพลาด:", data);
        }

    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
