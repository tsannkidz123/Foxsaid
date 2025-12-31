import React, { useState, useEffect } from 'react';
import { Save, Wand2, Users, FileText, ChevronLeft, FilePlus, Loader2 } from 'lucide-react';
import { Story, Chapter, Character, OutlinePoint } from '@/types';
import { continueStory, extractCharactersFromText, generateOutlineFromText } from '@/services/gemini';

interface WritingEditorProps {
  story: Story;
  activeChapterId: string | null;
  chapters: Chapter[];
  onSaveChapter: (chapterId: string, content: string, title: string) => void;
  onCreateChapter: () => void;
  onAddCharacters: (chars: Partial<Character>[]) => void;
  onUpdateOutline: (storyId: string, points: OutlinePoint[]) => void;
  onBack: () => void;
  onSelectChapter: (id: string) => void;
}

const WritingEditor: React.FC<WritingEditorProps> = ({
  story,
  activeChapterId,
  chapters,
  onSaveChapter,
  onCreateChapter,
  onAddCharacters,
  onUpdateOutline,
  onBack,
  onSelectChapter
}) => {
  const activeChapter = chapters.find(c => c.id === activeChapterId);
  
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiStatus, setAiStatus] = useState('');

  // Sync internal state when the active chapter changes
  useEffect(() => {
    if (activeChapter) {
      setContent(activeChapter.content);
      setTitle(activeChapter.title);
    } else {
      setContent('');
      setTitle('');
    }
  }, [activeChapterId, activeChapter]);

  const handleSave = () => {
    if (activeChapterId) {
      onSaveChapter(activeChapterId, content, title);
    }
  };

  /**
   * Helper: Extracts JSON from AI strings that might contain markdown blocks
   */
  const parseAiJson = (text: string) => {
    try {
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(text);
    } catch (e) {
      console.error("Failed to parse AI JSON:", e);
      return null;
    }
  };

  const handleAiContinue = async () => {
    if (!content.trim()) return;
    setIsAiProcessing(true);
    setAiStatus('AI 正在续写...');
    try {
      const prevChapter = chapters.find(c => c.order === (activeChapter?.order || 0) - 1);
      const context = (prevChapter?.content || "") + "\n" + content;
      
      const continuedText = await continueStory(context, content);
      setContent(prev => prev + (prev.endsWith('\n') ? '' : '\n') + continuedText);
    } catch (error) {
      alert("AI 续写失败，请检查网络");
    } finally {
      setIsAiProcessing(false);
      setAiStatus('');
    }
  };

  const handleExtractCharacters = async () => {
    if (content.length < 50) return alert("内容太少，AI 无法分析人物");
    setIsAiProcessing(true);
    setAiStatus('分析人物中...');
    try {
      const rawResponse = await extractCharactersFromText(content);
      const chars = parseAiJson(rawResponse);
      if (chars && Array.isArray(chars)) {
        onAddCharacters(chars);
        alert(`成功识别并添加 ${chars.length} 位人物到资料库`);
      } else {
        throw new Error("Invalid Format");
      }
    } catch (error) {
      alert("人物提取失败，请尝试提供更多描写");
    } finally {
      setIsAiProcessing(false);
      setAiStatus('');
    }
  };

  const handleExtractOutline = async () => {
    if (content.length < 50) return alert("内容太少，无法生成大纲");
    setIsAiProcessing(true);
    setAiStatus('梳理大纲中...');
    try {
      const rawResponse = await generateOutlineFromText(content);
      const points = parseAiJson(rawResponse);
      if (points && Array.isArray(points)) {
        onUpdateOutline(story.id, points);
        alert("大纲已同步至‘大纲世界’");
      }
    } catch (error) {
      alert("大纲提取失败");
    } finally {
      setIsAiProcessing(false);
      setAiStatus('');
    }
  };

  if (!activeChapter && chapters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white p-10 text-center">
        <FileText size={48} className="text-slate-200 mb-4" />
        <h2 className="text-xl font-medium text-slate-600 mb-4">开启你的创作之旅</h2>
        <button onClick={onCreateChapter} className="px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-all shadow-md">
          新建第一章
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-slate-50">
      {/* Chapter Sidebar */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div 
          className="p-4 border-b border-slate-100 flex items-center gap-2 text-slate-500 hover:text-indigo-600 cursor-pointer transition-colors" 
          onClick={() => { handleSave(); onBack(); }}
        >
          <ChevronLeft size={20} />
          <span className="font-semibold truncate">{story.title}</span>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {chapters.sort((a, b) => a.order - b.order).map(c => (
            <div 
              key={c.id}
              onClick={() => { handleSave(); onSelectChapter(c.id); }}
              className={`p-3 rounded-xl text-sm cursor-pointer transition-all ${
                c.id === activeChapterId 
                  ? 'bg-indigo-50 text-indigo-700 font-bold shadow-sm' 
                  : 'hover:bg-slate-50 text-slate-600'
              }`}
            >
              {c.title || "未命名章节"}
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-slate-100">
          <button onClick={() => { handleSave(); onCreateChapter(); }} className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-sm font-medium transition-all">
            <FilePlus size={16} />
            新建章节
          </button>
        </div>
      </div>

      {/* Main Editor */}
      <div className="flex-1 flex flex-col h-full bg-white relative">
        {/* Toolbar */}
        <div className="h-16 border-b border-slate-100 flex items-center justify-between px-8">
          <input 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-xl font-bold text-slate-800 bg-transparent border-none outline-none w-1/2 placeholder-slate-300"
            placeholder="请输入章节标题..."
          />
          <div className="flex items-center gap-4">
            {isAiProcessing && (
              <div className="flex items-center gap-2 text-indigo-600 text-xs font-medium bg-indigo-50 px-3 py-1.5 rounded-full animate-pulse">
                <Loader2 size={12} className="animate-spin" />
                {aiStatus}
              </div>
            )}
            <div className="flex items-center bg-slate-50 rounded-xl p-1 border border-slate-100">
              <button onClick={handleAiContinue} disabled={isAiProcessing} className="p-2 hover:bg-white rounded-lg text-slate-500 hover:text-indigo-600 hover:shadow-sm transition-all" title="AI 续写"><Wand2 size={20} /></button>
              <button onClick={handleExtractCharacters} disabled={isAiProcessing} className="p-2 hover:bg-white rounded-lg text-slate-500 hover:text-indigo-600 hover:shadow-sm transition-all" title="提取人物"><Users size={20} /></button>
              <button onClick={handleExtractOutline} disabled={isAiProcessing} className="p-2 hover:bg-white rounded-lg text-slate-500 hover:text-indigo-600 hover:shadow-sm transition-all" title="梳理大纲"><FileText size={20} /></button>
            </div>
            <button onClick={handleSave} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-sm transition-all active:scale-95">
              <Save size={18} /> 保存
            </button>
          </div>
        </div>

        {/* Text Area */}
        <div className="flex-1 overflow-y-auto bg-slate-50/30 p-12 flex justify-center">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="在此开始书写你的故事..."
            className="w-full max-w-3xl h-full min-h-[1000px] bg-white shadow-xl border border-slate-100 rounded-2xl p-12 text-lg text-slate-700 leading-relaxed resize-none outline-none focus:ring-2 focus:ring-indigo-100 transition-all"
          />
        </div>

        {/* Word Count Footer */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-white/80 backdrop-blur-md border border-slate-200 rounded-full text-[10px] text-slate-400 font-medium shadow-sm">
          字数统计: {content.length} | 状态: {activeChapterId ? '已同步' : '编辑中'}
        </div>
      </div>
    </div>
  );
};

export default WritingEditor;
