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
}// Add this to your existing src/services/gemini.ts

export async function generateStoryConcept(userPrompt: string): Promise<StoryConcept> {
  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
  // We use a specific model instance with JSON response enabled
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: { responseMimeType: "application/json" } 
  });

  const prompt = `
    你是一个创意无限的故事构思专家。根据用户的要求，生成一个完整的故事核心概念。
    必须返回以下JSON格式：
    {
      "title": "故事标题",
      "synopsis": "故事大纲（100字以内）",
      "characterName": "主角姓名",
      "characterRole": "主角身份",
      "characterDesc": "主角外貌与性格描写",
      "characterConflict": "主角面临的核心冲突"
    }
    用户要求：${userPrompt}
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return JSON.parse(text) as StoryConcept;
  } catch (error) {
    console.error("Concept Gen Error:", error);
    throw error;
  }
}
