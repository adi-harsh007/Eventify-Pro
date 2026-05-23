import React, { useState, useRef, useEffect } from 'react';
import { X, Send, MessageCircle } from 'lucide-react';
import { apiSendChatMessage } from '../apiService';
import { User } from '../types';

interface Message {
  role: 'user' | 'bot';
  text: string;
}

interface ChatbotProps {
  currentUser: User | null;
}

export default function Chatbot({ currentUser }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: 'Hello! I am EventBot, your Eventify Pro assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [limitMessage, setLimitMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || limitReached) return;

    const userText = input.trim();
    setInput('');
    const newHistory = [...messages, { role: 'user' as const, text: userText }];
    setMessages(newHistory);
    setIsLoading(true);

    try {
      // Pass bounded recent-history window
      const MAX_HISTORY = 10;
      const historyToKeep = messages.length > MAX_HISTORY ? [messages[0], ...messages.slice(-(MAX_HISTORY - 1))] : messages;
      const trimmedHistory = historyToKeep.map(m => ({ role: m.role, text: m.text }));

      const res = await apiSendChatMessage(userText, trimmedHistory);
      setMessages([...newHistory, { role: 'bot', text: res.reply }]);
    } catch (err: any) {
      // Use structured flag for limitReached
      if (err.limitReached) {
        setLimitReached(true);
        setLimitMessage(err.message);
        setMessages([...newHistory, { role: 'bot', text: err.message }]);
      } else {
        setMessages([...newHistory, { role: 'bot', text: "I'm having trouble connecting right now. Please try again later." }]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-zinc-800/80 backdrop-blur border-b border-white/10 p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center p-1 overflow-hidden">
                <img src="/eventbot_logo.svg" alt="EventBot" className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">EventBot</h3>
                <p className="text-xs text-white/50">AI Assistant</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/50 hover:text-white transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto min-h-[300px] max-h-[400px] space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-white/10 text-zinc-200 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white/10 rounded-2xl rounded-bl-none px-4 py-3 flex space-x-2">
                  <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-zinc-800/50 border-t border-white/10">
            {limitReached ? (
              <div className="text-center p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-xs text-red-400 font-medium">
                  {limitMessage || (currentUser ? 'Message limit reached for this session.' : 'Guest limit reached. Please log in.')}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={currentUser ? "Ask something..." : "Ask a question (1 message limit)..."}
                  className="w-full bg-black/50 border border-white/10 rounded-full py-2.5 pl-4 pr-12 text-sm text-white placeholder-white/40 focus:outline-none focus:border-blue-500/50 transition-colors"
                  disabled={isLoading || limitReached}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading || limitReached}
                  className="absolute right-1 top-1 bottom-1 w-8 h-8 flex items-center justify-center rounded-full bg-blue-600 text-white disabled:opacity-50 disabled:bg-blue-600/50 transition-colors"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="w-25 h-25 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform drop-shadow-2xl"
        >
          <img src="/eventbot_logo.svg" alt="EventBot" className="w-full h-full object-contain" />
        </button>
      )}
    </div>
  );
}
