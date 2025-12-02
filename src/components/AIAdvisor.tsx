
import React, { useState, useRef, useEffect } from 'react';
import { askLaborLawAdvisor } from '../services/geminiService';
import { Send, Bot, User, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  time: Date;
}

export const AIAdvisor: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
      {
          id: '1',
          sender: 'ai',
          text: 'أهلاً بك. أنا المستشار القانوني لنقابة المهندسين. اسألني أي سؤال يخص قانون العمل المصري، التأمينات، أو الإجازات.',
          time: new Date()
      }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
        id: Date.now().toString(),
        sender: 'user',
        text: input,
        time: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const answer = await askLaborLawAdvisor(input);

    const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: answer,
        time: new Date()
    };

    setMessages(prev => [...prev, aiMsg]);
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSend();
      }
  }

  return (
    <div className="h-screen p-8 flex flex-col">
       <header className="mb-6">
        <h2 className="text-3xl font-bold text-emerald-900 flex items-center gap-3">
            <Bot className="text-emerald-600" size={32} />
            المستشار القانوني الذكي
        </h2>
        <p className="text-emerald-600 mt-1">مدعوم بالذكاء الاصطناعي للإجابة على استفسارات قانون العمل المصري</p>
      </header>

      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-emerald-100 flex flex-col overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-emerald-50/30" ref={scrollRef}>
            {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-start' : 'justify-end'}`}>
                    <div className={`flex gap-3 max-w-[80%] ${msg.sender === 'user' ? 'flex-row' : 'flex-row-reverse'}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${msg.sender === 'user' ? 'bg-slate-200 text-slate-600' : 'bg-emerald-100 text-emerald-600'}`}>
                            {msg.sender === 'user' ? <User size={20} /> : <Bot size={20} />}
                        </div>
                        <div className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
                            msg.sender === 'user' 
                            ? 'bg-white text-slate-800 rounded-tr-none border border-emerald-100' 
                            : 'bg-emerald-600 text-white rounded-tl-none'
                        }`}>
                            {msg.text.split('\n').map((line, i) => <p key={i} className="mb-1">{line}</p>)}
                            <span className={`text-[10px] block mt-2 opacity-70 ${msg.sender === 'user' ? 'text-left' : 'text-right'}`}>
                                {msg.time.toLocaleTimeString('ar-EG', {hour: '2-digit', minute:'2-digit'})}
                            </span>
                        </div>
                    </div>
                </div>
            ))}
            {isLoading && (
                 <div className="flex justify-end">
                    <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl rounded-tl-none">
                        <Loader2 className="animate-spin" size={16} />
                        <span className="text-sm">جاري صياغة الرد القانوني...</span>
                    </div>
                 </div>
            )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-emerald-100">
            <div className="relative">
                <textarea 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="اكتب سؤالك هنا... (مثال: ما هو رصيد الإجازات السنوي للموظف بعد سن الخمسين؟)"
                    className="w-full bg-slate-50 border border-emerald-100 focus:bg-white focus:border-emerald-500 rounded-xl pl-12 pr-4 py-3 min-h-[60px] max-h-[120px] resize-none outline-none transition-all"
                />
                <button 
                    onClick={handleSend}
                    disabled={isLoading || !input.trim()}
                    className="absolute left-2 bottom-2 p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                >
                    <Send size={20} />
                </button>
            </div>
            <p className="text-xs text-center text-emerald-400 mt-2">
                ملاحظة: الردود تعتمد على الذكاء الاصطناعي وقد تحتاج لمراجعة مختص بشري في الحالات المعقدة.
            </p>
        </div>
      </div>
    </div>
  );
};
