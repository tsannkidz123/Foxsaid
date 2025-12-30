import { GoogleGenerativeAI } from "@google/generative-ai";

// Access the API Key from Vercel Environment Variables
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// Use 1.5-flash for speed and lower cost/latency
const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash",
  systemInstruction: "你是一个名为'胡说八道'的专业小说创作助手。你的任务是帮助作家构思情节、完善人物设定和大纲。请用专业、富有创意且鼓励性的语气回答。",
});

export async function assistantChat(history: any[], msg: string) {
  try {
    // Start a chat session with the existing history
    const chat = model.startChat({
      history: history,
    });

    const result = await chat.sendMessage(msg);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}
