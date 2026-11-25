import React, { useEffect, useRef, useState } from 'react';
import { Bot, Send, X, MessageCircle, Mail, Loader2, Sparkles } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  isError?: boolean;
}

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string | null;
}

const QUICK_PROMPTS = [
  'Apa saja yang bisa dilakukan di website EVORA?',
  'Cara daftar, login & verifikasi OTP Gmail?',
  'Cara buka rute event ke Google Maps?',
  'Cara atur avatar di kamar ganti & kontak CS?',
];

function renderBoldSegments(line: string): React.ReactNode {
  const parts = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={idx} className="font-extrabold text-[#1E3A8A]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 rounded bg-[#E8F5FA] text-[#377EC0] font-mono text-[11px] font-bold"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

function FormattedBotText({ text }: { text: string }) {
  const lines = text.split('\n');
  return (
    <div className="space-y-1.5">
      {lines.map((rawLine, idx) => {
        const line = rawLine.trim();
        if (!line) {
          return <div key={idx} className="h-1" />;
        }

        // Headings like ### Title or **1. Section**
        if (line.startsWith('### ') || line.startsWith('## ')) {
          const cleanHeading = line.replace(/^#{2,3}\s+/, '').replace(/\*\*/g, '');
          return (
            <p key={idx} className="font-extrabold text-[#377EC0] text-xs sm:text-sm pt-1">
              {cleanHeading}
            </p>
          );
        }

        // Numbered item: 1. ...
        const numMatch = line.match(/^(\d+\.)\s+(.*)$/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-0.5">
              <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1 rounded-md bg-[#E8F5FA] text-[#377EC0] text-[11px] font-extrabold shrink-0 mt-0.5">
                {numMatch[1]}
              </span>
              <span className="flex-1">{renderBoldSegments(numMatch[2])}</span>
            </div>
          );
        }

        // Bullet item: - ... or * ... or • ...
        const bulletMatch = line.match(/^[-*•]\s+(.*)$/);
        if (bulletMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#12BAAA] shrink-0 mt-2" />
              <span className="flex-1">{renderBoldSegments(bulletMatch[1])}</span>
            </div>
          );
        }

        return <p key={idx}>{renderBoldSegments(line)}</p>;
      })}
    </div>
  );
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  userName,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      text: `Halo${userName ? ` ${userName}` : ''}! Aku **Bot AI EVORA**. Aku siap menjelaskan secara sistematis:\n1. **Daftar Fitur & Apa yang Bisa Dilakukan** di EVORA\n2. **Cara Daftar & Verifikasi OTP Gmail** (plus Broadcast sambutan)\n3. **Panduan Rute Google Maps, Avatar & Kontak CS**\n\nKlik salah satu topik cepat di bawah atau ketik pertanyaanmu ya!`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [isOpen, messages, loading]);

  if (!isOpen) return null;

  const sendMessage = async (rawText: string) => {
    const trimmed = rawText.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text: trimmed,
    };

    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextHistory
            .filter((m) => !m.isError)
            .map((m) => ({ role: m.role, text: m.text })),
        }),
      });

      const data = (await res.json()) as { reply?: string; error?: string };

      if (!res.ok || !data.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: 'assistant',
            text:
              data.error ||
              'Maaf, Bot AI sedang tidak dapat merespons. Silakan cek API key atau hubungi Customer Service via WhatsApp 089603963329.',
            isError: true,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            role: 'assistant',
            text: data.reply!,
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          text: 'Koneksi ke server Bot AI terputus. Coba lagi sebentar atau hubungi WA CS 089603963329.',
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end p-4 sm:p-6 bg-slate-900/40 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="evora-bot-title"
    >
      <div className="w-full max-w-md bg-white rounded-[30px] shadow-2xl border border-[#9FD2D6] overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#377EC0] to-[#5460AC] px-5 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5 text-[#FBDF54]" />
            </div>
            <div>
              <h2 id="evora-bot-title" className="font-pixel text-lg leading-tight">
                Bot AI EVORA
              </h2>
              <p className="text-[11px] font-bold text-[#E8F5FA]/90">
                Panduan Sistematis Daftar & Fitur
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup Bot AI"
            className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F4FAFC] min-h-[260px]"
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-[13px] font-semibold leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#377EC0] text-white rounded-br-md'
                    : msg.isError
                    ? 'bg-[#FDECEC] text-[#B91C1C] border border-[#F04F52]/40 rounded-bl-md'
                    : 'bg-white text-slate-800 border border-[#9FD2D6]/60 shadow-xs rounded-bl-md'
                }`}
              >
                {msg.role === 'assistant' && !msg.isError ? (
                  <FormattedBotText text={msg.text} />
                ) : (
                  msg.text
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-[#9FD2D6]/60 rounded-2xl rounded-bl-md px-3.5 py-2.5 text-xs font-bold text-[#377EC0] inline-flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Menyusun panduan sistematis...
              </div>
            </div>
          )}
        </div>

        {/* Quick Prompts + Direct CS Links */}
        <div className="px-4 py-2.5 bg-white border-t border-slate-100 space-y-2">
          <div className="flex flex-wrap gap-1.5">
            {QUICK_PROMPTS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => sendMessage(q)}
                disabled={loading}
                className="px-2.5 py-1 rounded-xl bg-[#E8F5FA] hover:bg-[#9FD2D6]/40 text-[#377EC0] text-[11px] font-extrabold inline-flex items-center gap-1 cursor-pointer transition-colors disabled:opacity-60 text-left"
              >
                <Sparkles className="w-3 h-3 text-[#F7891F] shrink-0" />
                {q}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 pt-0.5">
            <a
              href="https://wa.me/6289603963329"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#12BAAA] hover:underline inline-flex items-center gap-1 font-extrabold"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              CS WA: 089603963329
            </a>
            <a
              href="mailto:msriotss@gmail.com?subject=Keluh%20Kesah%20%26%20Masukan%20EVORA"
              className="text-[#377EC0] hover:underline inline-flex items-center gap-1 font-extrabold"
            >
              <Mail className="w-3.5 h-3.5" />
              msriotss@gmail.com
            </a>
          </div>
        </div>

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="p-3 bg-white border-t border-[#9FD2D6]/50 flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tanya Bot AI EVORA..."
            aria-label="Tanya Bot AI EVORA"
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#E8F5FA]/70 text-xs sm:text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#377EC0]"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            aria-label="Kirim pesan"
            className="w-10 h-10 rounded-xl bg-[#377EC0] hover:bg-[#5460AC] disabled:opacity-50 text-white flex items-center justify-center shrink-0 cursor-pointer transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
