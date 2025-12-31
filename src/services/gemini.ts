import { GoogleGenerativeAI } from "@google/generative-ai";

// Accessing the API key from Vite environment variables
// Make sure you add VITE_GEMINI_API_KEY to your Vercel Environment Variables!
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export const continueStory = async (context: string, lastLines: string) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `你是一个专业的创意写作助手。基于以下背景信息：\n${context}\n\n续写接下来的剧情（约200字），衔接这段话：\n"${lastLines}"`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini continueStory Error:", error);
    return "抱歉，生成续写时出错了。";
  }
};

export const extractCharactersFromText = async (text: string) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `从以下文本中提取主要人物，并以 JSON 格式返回（包含 name, role, description）：\n\n${text}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    // Basic extraction logic - in a real app, you'd want to parse this JSON
    return response.text();
  } catch (error) {
    console.error("Gemini extractCharacters Error:", error);
    return "无法提取人物。";
  }
};

export const generateOutlineFromText = async (text: string) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `基于以下故事内容，生成一个包含四个阶段（开端、发展、高潮、结局）的大纲，并为每个阶段标注 0-100 的紧张度值：\n\n${text}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini generateOutline Error:", error);
    return "无法生成大纲。";
  }
};

export const generateStoryIdea = async (answers: Record<string, string>) => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `根据以下喜好生成一个完整的故事构思：${JSON.stringify(answers)}。
      请提供：故事标题、详细梗概、主角姓名、主角角色、主角冲突。`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("Gemini generateIdea Error:", error);
      return null;
    }
};
