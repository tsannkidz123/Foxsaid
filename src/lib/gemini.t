import { GoogleGenerativeAI } from "@google/generative-ai";

// We use import.meta.env for Vite projects
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

export const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash" 
});

export async function generateStory(prompt: string) {
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}
