import { GoogleGenerativeAI } from "@google/generative-ai";

// Accessing the API key from Vite environment variables
// Ensure VITE_GEMINI_API_KEY is set in Vercel Project Settings
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * Chat Assistant - Used by AiAssistant.tsx
 */
export const assistantChat = async (history: any[], msg: string) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const chat = model.startChat({
      history: history,
      generationConfig: {
        maxOutputTokens: 1000,
      },
    });

    const result = await chat.sendMessage(msg);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Assistant Chat Error:", error);
    return "我的思维暂时卡壳了，请稍后再试。";
  }
};

/**
 * Story Continuation - Used by WritingEditor.tsx
 */
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

/**
 * Character Extraction - Used by WritingEditor.tsx
 */
export const extractCharactersFromText = async (text: string) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `从以下文本中提取主要人物，并以 JSON 数组格式返回，包含字段: name, role, description, conflict, obstacle, action, ending。只需返回 JSON 代码块：\n\n${text}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini extractCharacters Error:", error);
    return "[]";
  }
};

/**
 * Outline Generation - Used by WritingEditor.tsx
 */
export const generateOutlineFromText = async (text: string) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `分析以下故事内容，生成一个包含四个阶段（开端、发展、高潮、结局）的大纲。为每个阶段提供：stage(阶段名称), tension(0-100的数值), description(描述)。只需返回 JSON 代码块：\n\n${text}`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini generateOutline Error:", error);
    return "[]";
  }
};

/**
 * Idea Generation - Used by IdeaGenie.tsx
 */
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
