import { GoogleGenerativeAI } from "@google/generative-ai";

// Vercel uses VITE_ prefix for environment variables in Vite projects
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

export const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash",
  systemInstruction: "你是一个名为'胡说八道'的专业小说创作助手。你的任务是帮助作家构思情节、完善人物设定和大纲。请用专业、富有创意且鼓励性的语气回答。",
});

// Helper for simple chat
export async function askGemini(prompt: string) {
  const result = await model.generateContent(prompt);
  return result.response.text();
}
