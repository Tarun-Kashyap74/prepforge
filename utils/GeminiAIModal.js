import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from "@google/generative-ai";

const apiKey =
  process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

const modelName =
  process.env.NEXT_PUBLIC_GEMINI_MODEL ||
  process.env.GEMINI_MODEL ||
  "gemini-1.5-flash";

const generationConfig = {
  temperature: 0.8,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
};

const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

const createModel = () => {
  if (!apiKey) {
    throw new Error(
      "Gemini API key is missing. Add NEXT_PUBLIC_GEMINI_API_KEY to .env.local."
    );
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  return genAI.getGenerativeModel({
    model: modelName,
  });
};

export const createChatSession = () =>
  createModel().startChat({
    generationConfig,
    safetySettings,
  });

// Keep the current import contract while avoiding shared stale chat history.
export const chatSession = {
  sendMessage: async (prompt) => {
    const session = createChatSession();
    return session.sendMessage(prompt);
  },
};
