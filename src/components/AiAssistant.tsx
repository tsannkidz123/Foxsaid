import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Loader2 } from 'lucide-react';
import { assistantChat } from '@/services/gemini';
import { Message } from '@/types';

const AiAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 'initial', 
      role: 'model', 
      content: '你好！我是你的写作助手。需要查找资料、构思情节还是寻找灵感？',
      timestamp: Date.now() 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg: Message = { 
      id: Date.now().toString(),
      role: 'user', 
      content: input,
      timestamp: Date.now()
    };

    const currentMessages = [...messages, userMsg];
    setMessages(currentMessages);
    setInput('');
    setIsLoading(true);

    try {
      const history = currentMessages.length > 1 
        ? currentMessages.slice(0, -1).map(m => ({
            role: m.role === 'model' ? 'model' : 'user',
            parts: [{ text: m.content }]
          }))
        : [];

      const responseText = await assistantChat(history, userMsg.content);
      
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: responseText || "抱歉，我暂时无法回答。",
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (e) {
      console.error("Gemini Error:", e);
      setMessages(prev => [...prev, { 
        id: 'error-' + Date.now(), 
        role: 'model', 
        content: "连接助手失败，请检查网络或 API 设置。",
        timestamp: Date.now() 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center z-50 animate-bounce"
        >
          <Sparkles size={24} />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 sm:w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col z-50 overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-indigo-600 text-white p-4 flex justify-between items-center shadow-md">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-yellow-300" />
              <span className="font-bold tracking-tight">AI 灵感助手</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-indigo-500 p-1 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-br-none shadow-sm' 
                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl rounded-bl-none border border-slate-200 shadow-sm flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-indigo-600" />
                  <span className="text-xs text-slate-400">正在思考...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-white border-t border-slate-100 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="问问助手如何写这个章节..."
              className="flex-1 bg-slate-100 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-
