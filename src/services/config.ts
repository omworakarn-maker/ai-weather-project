export const AI_CONFIG = {
  GITHUB: {
    TOKEN: import.meta.env.VITE_GITHUB_TOKEN,
    ENDPOINT: "https://models.inference.ai.azure.com/chat/completions",
    MODEL: "gpt-4o-mini",
  },
  GEMINI: {
    API_KEY: import.meta.env.VITE_GEMINI_API_KEY,
    MODEL: "gemini-2.5-flash-lite",
  },
};
