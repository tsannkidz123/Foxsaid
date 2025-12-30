import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export async function assistantChat(history: any[], msg: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const chat = model.startChat({ history });
  const result = await chat.sendMessage(msg);
  return result.response.text();
}

export async function generateCharacter(prompt: string) {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: { responseMimeType: "application/json" }
  });
  const systemPrompt = `你是一个金牌编剧。请按JSON格式生成人物：{name, role, appearance, description, conflict, obstacle, action, ending}`;
  const result = await model.generateContent(`${systemPrompt}\n\n要求：${prompt}`);
  return JSON.parse(result.response.text());
}

export async function generateStoryConcept(prompt: string) {
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: { responseMimeType: "application/json" }
  });
  const systemPrompt = `你是一个创意专家。请按JSON格式生成故事：{title, synopsis, characterName, characterRole, characterDesc, characterConflict}`;
  const result = await model.generateContent(`${systemPrompt}\n\n要求：${prompt}`);
  return JSON.parse(result.response.text());
}
