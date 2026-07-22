import React, { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send, Loader2, Bot, User as UserIcon, Copy, Check } from "lucide-react";
import Markdown from "react-markdown";
import { Message } from "../types";
import { logEvent } from "../lib/analytics";

interface AIHelperModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeClassId?: string;
  activeClassName?: string;
  chatMessages?: Message[];
  onInsertGeneratedText?: (text: string) => void;
}

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export default function AIHelperModal({
  isOpen,
  onClose,
  activeClassName = "Class",
}: AIHelperModalProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: `Greetings. I am your advanced AI Tutor for ${activeClassName}. I am equipped to assist you with any topic, including the most complex subjects. How may I assist you today?` }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    "Explain a complex topic",
    "Help me with my homework",
    "Create a practice quiz"
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!isOpen) return null;

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    logEvent("AI", "Chat Copy");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleSend = async (overrideInput?: string) => {
    const textToSend = overrideInput || input;
    if (!textToSend.trim() || isLoading) return;
    
    logEvent("AI", "Chat Request");
    
    const userMessage = textToSend.trim();
    if (!overrideInput) setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    // Build history for the prompt
    const historyPrompt = messages.map(m => `${m.role === 'user' ? 'Student' : 'Tutor'}: ${m.content}`).join('\n');
    const prompt = `${historyPrompt}\nStudent: ${userMessage}\nTutor:`;

    const systemInstruction = "You are an extremely capable, formal, and highly intelligent AI tutor. You must maintain a strictly professional and respectful tone at all times. NEVER use informal, casual, or condescending greetings such as 'হ্যালো বাচ্চা' (Hello child) or similar phrases in any language. You are designed to answer any question, including the hardest and most complex questions in the world across advanced mathematics, quantum physics, philosophy, coding, and more. Be precise, highly intellectual, and formal, acting like a standard advanced AI. For academic explanations, provide your answers in beautifully structured, easily readable format using Markdown (including headers, bullet points, code blocks, and bold text). Make sure the content is organized, clear, and very easy to digest for anyone reading it. Do not use formatting like 'Tutor:' at the beginning of your reply.";

    try {
      const response = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt, 
          systemInstruction 
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessages(prev => [...prev, { role: "assistant", content: data.result }]);
      } else {
        logEvent("AI", "Chat Error", "API Error");
        setMessages(prev => [...prev, { role: "assistant", content: "I'm sorry, I encountered an error connecting to my brain." }]);
      }
    } catch (err) {
      logEvent("AI", "Chat Error", "Network Error");
      setMessages(prev => [...prev, { role: "assistant", content: "Network error connecting to the AI helper backend." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center md:items-end justify-center md:justify-end z-50 p-0 md:p-6 sm:p-4">
      <div className="bg-white md:rounded-2xl w-full h-full md:h-auto md:w-[400px] md:max-h-[600px] shadow-2xl overflow-hidden border border-gray-100 flex flex-col animate-in slide-in-from-bottom-full duration-300">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 bg-linear-to-r from-blue-50 to-indigo-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm p-1">
              <img src="/logo-small.png" alt="AI Tutor Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                AI Tutor
              </h2>
              <p className="text-[11px] text-gray-500 font-medium tracking-wide uppercase">Always here to help</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-200/60 text-gray-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50" ref={scrollRef}>
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              
              <div className="flex flex-col gap-1 max-w-[80%]">
                <div className={`px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed shadow-sm relative group ${
                  m.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-sm' 
                    : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm markdown-body'
                }`}>
                  {m.role === 'assistant' ? (
                    <div className="prose prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-gray-100 prose-pre:text-gray-800">
                      <Markdown>{m.content}</Markdown>
                    </div>
                  ) : (
                    m.content
                  )}
                  {m.role === 'assistant' && (
                    <button
                      onClick={() => handleCopy(m.content, i)}
                      className="absolute -right-8 top-2 opacity-0 group-hover:opacity-100 p-1.5 bg-white border border-gray-200 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-all"
                      title="Copy message"
                    >
                      {copiedIndex === i ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>

              {m.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center shrink-0">
                  <UserIcon className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
          
          {messages.length === 1 && !isLoading && (
            <div className="flex flex-col gap-2 mt-4">
              <p className="text-xs text-gray-500 font-medium px-1">Suggested:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(prompt)}
                    className="text-xs bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-full hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm text-left"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-white border border-gray-100 text-gray-800 rounded-bl-sm shadow-sm flex flex-col gap-2 min-w-[180px]">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
                  <span className="text-xs text-gray-500 font-medium">Generating response...</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="h-2 bg-gray-100 rounded animate-pulse w-full"></div>
                  <div className="h-2 bg-gray-100 rounded animate-pulse w-[85%]"></div>
                  <div className="h-2 bg-gray-100 rounded animate-pulse w-[65%]"></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-3 bg-white border-t border-gray-100 shrink-0">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex items-end gap-2 bg-gray-50 p-1.5 rounded-2xl border border-gray-200 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask me anything..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm px-3 py-2 max-h-32 resize-none outline-none"
              rows={1}
              style={{ minHeight: '40px' }}
            />
            <button 
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-xl transition-colors shrink-0 mb-0.5 mr-0.5"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
