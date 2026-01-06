import { GoogleGenerativeAI } from "@google/generative-ai";
import { WeatherData, AIChatSession } from "../types";
import { AI_CONFIG } from "./config";

const genAI = new GoogleGenerativeAI(AI_CONFIG.GEMINI.API_KEY);

// น้องพายุ (Gemini)
export class PhayuChatSession implements AIChatSession {
  private chat: any;
  constructor(private weather: WeatherData) {
    const model = genAI.getGenerativeModel({ model: AI_CONFIG.GEMINI.MODEL });
    this.chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [
            {
              text: `คุณคือ \"น้องพายุ\" ผู้ช่วยหนุ่มมาดเท่ ลุยๆ คุยภาษาไทยเป็นกันเอง ข้อมูลอากาศ: ${weather.city}, ${weather.temperature}°C`
            }
          ]
        },
        {
          role: "model",
          parts: [
            {
              text: "ยินดีที่ได้รู้จักครับ ผมน้องพายุพร้อมลุย! มีอะไรให้ช่วยไหม?"
            }
          ]
        }
      ]
    });
  }

  async sendMessage(msg: string) {
    try {
      if (!this.chat) {
        throw new Error("Chat session is not initialized");
      }

      console.log("Sending message to Gemini:", msg);
      const result = await this.chat.sendMessage(msg);
      
      if (!result || !result.response) {
        throw new Error("Invalid response structure from API");
      }

      const responseText = result.response.text();
      console.log("Received response from Gemini:", responseText);

      if (!responseText || typeof responseText !== "string") {
        throw new Error("Invalid response text from Gemini API");
      }

      return {
        response: {
          text: () => responseText
        }
      };
    } catch (error) {
      console.error("Error during Gemini API call:", error);
      return {
        response: {
          text: () => "ขออภัยค่ะ ระบบขัดข้องชั่วคราว ลองใหม่อีกครั้งนะคะ"
        }
      };
    }
  }

  async debugAPI() {
    try {
      const testResponse = await genAI.getGenerativeModel({ model: AI_CONFIG.GEMINI.MODEL }).generateContent("Test Debugging");
      console.log("Debugging Response:", testResponse);
    } catch (error) {
      console.error("Debugging Error:", error);
    }
  }
}
