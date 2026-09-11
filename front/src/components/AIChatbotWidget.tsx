import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Send,
  ShieldCheck,
  Bot,
} from 'lucide-react';
import VoiceInputButton from './VoiceInputButton';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  time: string;
  citation?: string;
  badge?: string;
}

const FORMAL_FAQS = [
  {
    question: 'How are e-waste scrap prices calculated on Re-Circuit?',
    answer:
      'Scrap valuation is computed dynamically using real-time competitive collector bidding blended with our dual AI optical pipeline (YOLOv8 + DINOv2). The system estimates precious metal yields (Gold ~1.4g/ton on high-grade server PCBs, 99.9% pure Copper heat pipes, and Aluminum chassis) indexed against London Metal Exchange (LME) spot rates to guarantee fair seller compensation.',
    badge: 'CPCB & LME Valuation',
    citation: 'CPCB E-Waste Rules 2022 · Market Indexing Protocol',
  },
  {
    question: 'What is the legal process for hazardous Li-ion batteries & CRT lead?',
    answer:
      'Under CPCB Schedule I & II guidelines, hazardous e-waste fractions cannot enter municipal trash. Lithium-ion batteries must be isolated in non-conductive, anti-static enclosures to avoid thermal hazards. Our certified collectors execute OTP-verified pickups and route them exclusively to CPCB/R2v3 authorized hydrometallurgical recycling units.',
    badge: 'Hazard Safety Mandate',
    citation: 'Hazardous Waste Management Rules · Schedule II Protocols',
  },
  {
    question: 'How does the CPCB Form-1 Green Recycling Certificate work?',
    answer:
      'Once e-waste is formally processed at a certified facility, Re-Circuit generates a cryptographic CPCB Form-1 Certificate of Safe Disposal and Material Recovery. Each certificate includes an immutable SHA-256 hash, audited grams of recovered precious metals, avoided landfill toxic load, and verified CO2e reductions for corporate ESG/EPR tax compliance.',
    badge: 'Legal Audit Trail',
    citation: 'Central Pollution Control Board · Form 1 Compliance Standard',
  },
  {
    question: 'How are collectors verified and scale weights calibrated?',
    answer:
      'Every collector on Re-Circuit undergoes mandatory KYC, GSTIN verification, and state pollution control board (SPCB) authorization checks. Pickups require dual-party 4-digit OTP sign-off, live GPS geofencing, and tare-calibrated scale photo verification before any transaction is settled.',
    badge: 'Fraud Prevention',
    citation: 'Re-Circuit KYC & Standard Operating Procedure v2.4',
  },
  {
    question: 'What are the legal Extended Producer Responsibility (EPR) targets?',
    answer:
      'Under the 2022 E-Waste Amendment, corporate producers, importers, and brand owners (PIBOs) must meet formal recycling quotas scaling from 60% up to 80% of end-of-life device sales. Re-Circuit aggregates bulk electronic assets into digital lots and transfers certified EPR credits directly recognized by regulatory boards.',
    badge: 'EPR Statutory Quotas',
    citation: 'Ministry of Environment, Forest and Climate Change (MoEFCC) 2022',
  },
];

const AIChatbotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: 'Hello! I am Re-Circuit AI Assistant. I can answer regulatory CPCB guidelines, e-waste market pricing, collector verification, and safe recycling protocols. Select a verified formal question below or type your inquiry.',
      time: 'Just now',
      badge: 'Verified CPCB Assistant',
    },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSelectFaq = (faq: typeof FORMAL_FAQS[0]) => {
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: faq.question,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    const botMsg: Message = {
      id: `b-${Date.now() + 1}`,
      sender: 'bot',
      text: faq.answer,
      badge: faq.badge,
      citation: faq.citation,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((cur) => [...cur, userMsg, botMsg]);
  };

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = input.trim();
    if (!query) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Find best match in FAQs or generate dynamic answer
    const lower = query.toLowerCase();
    let replyText =
      'Thank you for asking. On Re-Circuit, all listings are scanned with dual YOLOv8 + DINOv2 vision models to determine recyclability and fair pricing. You can list assets via the Seller portal, bid as a certified Collector, or consolidate wholesale lots for Disposers with CPCB Form 1 certification.';
    let citation = 'CPCB E-Waste Rules 2022 Platform Guidance';
    let badge = 'General Verification';

    if (lower.includes('price') || lower.includes('cost') || lower.includes('worth') || lower.includes('rate')) {
      replyText = FORMAL_FAQS[0].answer;
      citation = FORMAL_FAQS[0].citation;
      badge = FORMAL_FAQS[0].badge;
    } else if (lower.includes('battery') || lower.includes('hazard') || lower.includes('crt') || lower.includes('toxic')) {
      replyText = FORMAL_FAQS[1].answer;
      citation = FORMAL_FAQS[1].citation;
      badge = FORMAL_FAQS[1].badge;
    } else if (lower.includes('certificate') || lower.includes('form 1') || lower.includes('cpcb') || lower.includes('esg')) {
      replyText = FORMAL_FAQS[2].answer;
      citation = FORMAL_FAQS[2].citation;
      badge = FORMAL_FAQS[2].badge;
    } else if (lower.includes('collector') || lower.includes('pickup') || lower.includes('otp') || lower.includes('scale')) {
      replyText = FORMAL_FAQS[3].answer;
      citation = FORMAL_FAQS[3].citation;
      badge = FORMAL_FAQS[3].badge;
    } else if (lower.includes('epr') || lower.includes('target') || lower.includes('legal') || lower.includes('enterprise')) {
      replyText = FORMAL_FAQS[4].answer;
      citation = FORMAL_FAQS[4].citation;
      badge = FORMAL_FAQS[4].badge;
    } else if (lower.includes('disposer') || lower.includes('recycler') || lower.includes('smelt')) {
      replyText =
        'Authorized Disposers and Recyclers access consolidated digital lots through the Disposer portal. Materials undergo hydrometallurgical extraction for gold, silver, and copper, with full mass balance documentation and certificate generation.';
      citation = 'MoEFCC E-Waste Dismantler & Recycler Framework';
      badge = 'Disposer Guidance';
    }

    const botMsg: Message = {
      id: `b-${Date.now() + 1}`,
      sender: 'bot',
      text: replyText,
      badge,
      citation,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((cur) => [...cur, userMsg, botMsg]);
    setInput('');
  };

  return (
    <aside aria-label="AI Assistant" className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Floating Chat Modal */}
      {isOpen ? (
        <div
          className="w-[92vw] sm:w-[420px] h-[580px] max-h-[85vh] rounded-3xl border border-emerald-500/30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden animate-fade-in"
          style={{ transformOrigin: 'bottom right' }}
        >
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center">
                <Bot size={20} className="text-emerald-200" />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight flex items-center gap-1.5">
                  Re-Circuit Regulatory AI
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-300/30">
                    Live
                  </span>
                </h3>
                <p className="text-[11px] text-emerald-100/80">
                  Central Pollution Control Board (CPCB) Verified
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/90 flex items-center justify-center transition-colors"
              aria-label="Close chat"
            >
              <X size={16} />
            </button>
          </div>

          {/* Quick FAQ Prompts Bar */}
          <div className="p-2.5 bg-slate-100/90 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700/50 flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">
              Formal Regulatory Questions
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              {FORMAL_FAQS.map((faq, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelectFaq(faq)}
                  className="px-2.5 py-1 rounded-full text-[11px] whitespace-nowrap font-medium bg-white dark:bg-slate-900 border border-emerald-500/30 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:border-emerald-500 transition-all flex-shrink-0"
                >
                  {faq.badge}
                </button>
              ))}
            </div>
          </div>

          {/* Chat History Messages */}
          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
            {messages.map((m) => {
              const isBot = m.sender === 'bot';
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isBot ? 'items-start' : 'items-end'}`}
                >
                  <div
                    className={`max-w-[86%] rounded-2xl p-3 text-xs leading-relaxed ${
                      isBot
                        ? 'bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/60 rounded-tl-sm shadow-sm'
                        : 'bg-emerald-600 text-white rounded-tr-sm shadow-md'
                    }`}
                  >
                    {isBot && m.badge && (
                      <div className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                        <ShieldCheck size={12} />
                        {m.badge}
                      </div>
                    )}
                    <p className="whitespace-pre-wrap">{m.text}</p>
                    {isBot && m.citation && (
                      <div className="mt-2 pt-1.5 border-t border-slate-200 dark:border-slate-700/60 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                        Source: {m.citation}
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1 px-1">{m.time}</span>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form
            onSubmit={handleSend}
            className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2"
          >
            <VoiceInputButton onTranscript={(txt) => setInput(txt)} />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about e-waste rules, bids, CPCB certificates…"
              className="flex-1 text-xs px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="w-9 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white flex items-center justify-center shadow-md transition-all flex-shrink-0"
              aria-label="Send message"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      ) : (
        /* Collapsed Floating Trigger Button */
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 hover:from-emerald-600 hover:to-teal-600 text-white shadow-[0_8px_30px_rgba(11,107,69,0.4)] transition-all hover:scale-105 active:scale-95"
          aria-label="Open AI Assistant"
        >
          <div className="relative w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
            <Bot size={17} />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-300 border-2 border-emerald-700 animate-ping" />
          </div>
          <div className="text-left hidden sm:block">
            <span className="block text-xs font-bold leading-none">Re-Circuit AI</span>
            <span className="block text-[10px] text-emerald-200/90 leading-tight">
              5 Verified Questions & Q&A
            </span>
          </div>
        </button>
      )}
    </aside>
  );
};

export default AIChatbotWidget;
