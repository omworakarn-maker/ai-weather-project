import { WeatherData, AIAnalysis, AIChatSession } from "../types";
import { AI_CONFIG } from "./config";

// ================= วิเคราะห์อากาศ (ใช้ GitHub/GPT เป็นหลัก) =================
export const getAIAnalysis = async (weather: WeatherData): Promise<AIAnalysis> => {
    const fallbackData: AIAnalysis = {
        summary: `วันนี้ที่ ${weather.city} อากาศ${weather.conditionText} อุณหภูมิ ${weather.temperature}°C`,
        clothingAdvice: "แต่งกายตามปกติ ระบายอากาศได้ดี",
        healthAdvice: "ดื่มน้ำบ่อยๆ ดูแลสุขภาพด้วยนะคะ",
        activityRecommendation: "ทำกิจกรรมสันทนาการได้ตามปกติ"
    };

    try {
        const response = await fetch(AI_CONFIG.GITHUB.ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${AI_CONFIG.GITHUB.TOKEN}`
            },
            body: JSON.stringify({
                messages: [
                    { role: "system", content: "You are a weather assistant. Respond in Thai JSON." },
                    { role: "user", content: `วิเคราะห์อากาศ ${weather.city}: ${weather.temperature}°C, ${weather.conditionText}. JSON fields: summary, clothingAdvice, healthAdvice, activityRecommendation` }
                ],
                model: AI_CONFIG.GITHUB.MODEL,
                response_format: { type: "json_object" }
            })
        });

        if (!response.ok) return fallbackData;
        const data = await response.json();
        return JSON.parse(data.choices[0].message.content);
    } catch (error) {
        return fallbackData;
    }
};

// น้องฟ้าใส (GitHub/GPT)
export class FahsaiChatSession implements AIChatSession {
    private history: any[] = [];
    
    constructor(private weather: WeatherData) {
        this.history = [{
            role: "system",
            content: `คุณคือ "น้องฟ้าใส" ผู้ช่วยสาวน้อยร่าเริง คุยภาษาไทย มีหางเสียง นะคะ/ค่าา ✨ ข้อมูลอากาศ: ${weather.city}, ${weather.temperature}°C`
        }];
        console.log("FahsaiChatSession initialized with weather:", weather.city);
    }
    
    async sendMessage(msg: string) {
        try {
            if (!this.history) {
                throw new Error("Chat history is not initialized");
            }

            console.log("Sending message to GPT:", msg);
            this.history.push({ role: "user", content: msg });
            
            const res = await fetch(AI_CONFIG.GITHUB.ENDPOINT, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json", 
                    "Authorization": `Bearer ${AI_CONFIG.GITHUB.TOKEN}` 
                },
                body: JSON.stringify({ 
                    messages: this.history, 
                    model: AI_CONFIG.GITHUB.MODEL 
                })
            });

            if (!res.ok) {
                const errorData = await res.text();
                throw new Error(`API Error: ${res.status} ${errorData}`);
            }

            const data = await res.json();
            
            if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                throw new Error("Invalid response structure from GPT API");
            }

            const text = data.choices[0].message.content;
            
            if (!text || typeof text !== "string") {
                throw new Error("Invalid response text from GPT API");
            }

            console.log("Received response from GPT:", text);
            this.history.push({ role: "assistant", content: text });
            
            return { response: { text: () => text } };
        } catch (error) {
            console.error("Error during GPT API call:", error);
            const fallbackMessage = "ขออภัยค่ะ ระบบขัดข้องชั่วคราว ลองใหม่อีกครั้งนะคะ";
            this.history.push({ role: "assistant", content: fallbackMessage });
            return { response: { text: () => fallbackMessage } };
        }
    }
}
