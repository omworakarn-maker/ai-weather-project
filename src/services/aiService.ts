import { WeatherData, AIChatSession } from "../types";
import { PhayuChatSession } from "./geminiService";
import { FahsaiChatSession, getAIAnalysis } from "./gptService";

export { getAIAnalysis };

export const createWeatherChat = (weather: WeatherData, mode: 'github' | 'gemini' = 'github'): AIChatSession => {
    return mode === 'github' ? new FahsaiChatSession(weather) : new PhayuChatSession(weather);
};
