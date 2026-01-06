export interface WeatherData {
  city: string;
  latitude: number;
  longitude: number;
  temperature: number;
  conditionText: string;
  humidity: number;
  windSpeed: number;
  uvIndex: number;
  weatherCode: number;
  rainChance: number;
  hourly: HourlyPoint[];
  forecast: ForecastDay[];
}

export interface HourlyPoint {
  time: string;
  temp: number;
  rainChance: number;
}

export interface ForecastDay {
  date: string;
  maxTemp: number;
  minTemp: number;
  condition: string;
  weatherCode: number;
  rainChance: number;
}

export interface AIAnalysis {
  summary: string;
  clothingAdvice: string;
  healthAdvice: string;
  activityRecommendation: string;
}

export interface CitySuggestion {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface AIChatSession {
  sendMessage(msg: string): Promise<{ response: { text: () => string } }>;
}
