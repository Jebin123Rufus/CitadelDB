import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Bot, User } from 'lucide-react';
import { api } from '../api/client';
import MarkdownView from '../components/MarkdownView';

const STARTERS = [
  'Explain CVE-2024-21413 and its impact',
  'What is MITRE ATT&CK technique T1059?',
  'How do I detect pass-the-hash attacks?',
  'Best practices for ransomware incident response',
];

export default function AiAssistant() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "I'm CitadelDB's cybersecurity assistant. I can help with vulnerabilities, CVEs, MITRE ATT&CK, threat hunting, incident response, and defensive strategies. What would you like to explore?",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function handleSend(e) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user', content: input.trim() };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      const chatHistory = nextMessages
        .slice(1)
        .map((m) => ({ role: m.role, content: m.content }));

      const data = await api.ai.chat({ messages: chatHistory });
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Error: ${err.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] animate-fade-in">
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <MessageSquare className="w-7 h-7 text-citadel-accent" />
          AI Cybersecurity Assistant
        </h1>
        <p className="text-gray-500 text-sm">Cybersecurity-focused • Llama 3.3 70B</p>
      </header>

      <div className="flex flex-wrap gap-2 mb-4">
        {STARTERS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setInput(s)}
            className="text-xs px-3 py-1.5 rounded-full border border-citadel-700 text-gray-400 hover:border-citadel-accent hover:text-citadel-accent transition-colors"
          >
            {s}
          </button>
        ))}
      </div>

      <div className="panel flex-1 flex flex-col overflow-hidden min-h-0">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  msg.role === 'user'
                    ? 'bg-citadel-accent/20 text-citadel-accent'
                    : 'bg-citadel-purple/20 text-citadel-purple'
                }`}
              >
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div
                className={`max-w-[85%] rounded-xl px-4 py-3 text-sm ${
                  msg.role === 'user'
                    ? 'bg-citadel-accent/10 border border-citadel-accent/20 text-gray-200'
                    : 'bg-citadel-950 border border-citadel-700/40'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <MarkdownView content={msg.content} />
                ) : (
                  <p>{msg.content}</p>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-citadel-purple/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-citadel-purple animate-pulse" />
              </div>
              <div className="px-4 py-3 rounded-xl bg-citadel-950 border border-citadel-700/40 text-gray-500 text-sm">
                Analyzing...
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSend} className="p-4 border-t border-citadel-700/50 flex gap-3">
          <input
            className="input-field flex-1"
            placeholder="Ask about vulnerabilities, ATT&CK, defenses..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button type="submit" disabled={loading || !input.trim()} className="btn-primary p-2.5">
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
