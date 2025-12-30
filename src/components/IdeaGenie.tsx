import React, { useState } from 'react';
import { Sparkles, Send, BookOpen, UserCircle } from 'lucide-react';
import { generateStoryConcept } from '../services/gemini';
import { StoryConcept } from '../types';

const IdeaGenie: React.FC<{ onApply: (concept: StoryConcept) => void }> = ({ onApply }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StoryConcept | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const concept = await generateStoryConcept(input);
      setResult(concept);
    } catch (error) {
      console.error("Failed to fetch inspiration", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-slate-800 flex items-center justify-center gap-2">
          <Sparkles className="text-indigo-600" /> 点子精灵
        </h2>
        <p className="text-slate-500">输入几个关键词，让我为你编织故事的雏形</p>
      </div>

      <div className="relative">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="例如：一个能看见未来的厨师，或者一部关于火星殖民地的惊悚小说..."
          className="w-full h-32 p-4 rounded-2xl border-2 border-indigo-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50/50 outline-none transition-all resize-none text-lg"
        />
        <button
          onClick={handleGenerate}
          disabled={loading || !input.trim()}
          className="absolute bottom-4 right-4 bg-indigo-600 text-white px-6 py-2 rounded-full font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 shadow-lg"
        >
          {loading ? "灵感孵化中..." : "捕捉灵感"}
          <Send size={18} />
        </button>
      </div>

      {result && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in duration-300">
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3 text-indigo-600 border-b pb-4">
              <BookOpen size={24} />
              <h3 className="text-2xl font-bold">{result.title}</h3>
            </div>
            
            <p className="text-slate-600 leading-relaxed italic">"{result.synopsis}"</p>

            <div className="bg-slate-50 rounded-2xl p-4 flex gap-4">
              <div className="bg-indigo-100 p-3 rounded-xl h-fit">
                <UserCircle className="text-indigo-600" size={32} />
              </div>
              <div>
                <h4 className="font-bold text-slate-800">{result.characterName} — {result.characterRole}</h4>
                <p className="text-sm text-slate-500 mt-1">{result.characterDesc}</p>
                <div className="mt-3 text-sm font-medium text-rose-600 bg-rose-50 px-3 py-1 rounded-full w-fit">
                  核心冲突：{result.characterConflict}
                </div>
              </div>
            </div>

            <button
              onClick={() => onApply(result)}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-colors mt-4"
            >
              使用这个点子创建故事
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IdeaGenie;
