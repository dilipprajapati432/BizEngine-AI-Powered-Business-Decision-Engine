import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';
import api from '../services/api';

const SUGGESTIONS = [
  "What's my total revenue?",
  "Which product sells the most?",
  "How is the sales trend?",
  "Compare regions by revenue",
  "What should I focus on?",
];

/**
 * ChatWidget Component
 * 
 * A site-wide, global floating conversational AI assistant.
 * 
 * Features:
 * - Real-time dataset interaction (grounds answers in uploaded CSV context).
 * - Premium Framer Motion animations (Scale-up on open, Slide-down on close).
 * - Optimized glassmorphism UI for high-end dashboards.
 * - Dynamic message suggestions and typing state indicators.
 */
export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hi! I'm BizEngine AI 🤖\nAsk me anything about your uploaded dataset — revenue breakdowns, product performance, trends, or business strategies." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, loading]);

  useEffect(() => {
    if (open && !closing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open, closing]);

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, 250);
  };

  const handleToggle = () => {
    if (open) {
      handleClose();
    } else {
      setOpen(true);
    }
  };

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;

    setMessages(prev => [...prev, { role: 'user', text: msg }]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/chat', { message: msg });
      setMessages(prev => [...prev, { role: 'bot', text: res.data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', text: 'Sorry, something went wrong. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        className="chat-fab"
        onClick={handleToggle}
        style={{
          position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 1000,
          width: 56, height: 56, borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366f1, #22d3ee)',
          border: 'none', cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 24px rgba(99,102,241,0.4)',
          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          transform: 'scale(1)',
        }}
      >
        <MessageCircle size={24} color="#fff" />
      </button>

      {/* Chat Panel */}
      {open && (
        <div style={{
          position: 'fixed', bottom: '5.5rem', right: '1.5rem', zIndex: 999,
          width: 400, height: 520, borderRadius: '16px',
          background: 'var(--bg-chat)', border: '1px solid var(--border)',
          backdropFilter: 'blur(24px)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.6), inset 0 0 0 1px rgba(255,255,255,0.05)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          animation: closing ? 'chatSlideDown 0.25s ease-in forwards' : 'chatSlideUp 0.3s ease-out'
        }}>
          <style>{`
            @keyframes chatSlideUp {
              from { opacity: 0; transform: translateY(20px) scale(0.95); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }
            @keyframes chatSlideDown {
              from { opacity: 1; transform: translateY(0) scale(1); }
              to { opacity: 0; transform: translateY(20px) scale(0.95); }
            }
            @keyframes msgFadeIn {
              from { opacity: 0; transform: translateY(8px); }
              to { opacity: 1; transform: translateY(0); }
            }
            @keyframes pulse {
              0%, 100% { box-shadow: 0 4px 24px rgba(99,102,241,0.4); }
              50% { box-shadow: 0 4px 32px rgba(99,102,241,0.7); }
            }
            @keyframes dotBounce {
              0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
              40% { transform: scale(1); opacity: 1; }
            }
            .chat-msg { animation: msgFadeIn 0.3s ease-out both; }
            .chat-input:focus { outline: none; border-color: var(--accent) !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.15) !important; }
            .chat-suggestion { transition: all 0.2s ease !important; }
            .chat-suggestion:hover { background: rgba(99,102,241,0.15) !important; border-color: var(--accent) !important; transform: translateY(-1px); }
            .chat-close:hover { background: rgba(255,255,255,0.15) !important; }
            .chat-send:hover:not(:disabled) { transform: scale(1.05); box-shadow: 0 2px 12px rgba(99,102,241,0.4); }
            .chat-fab { animation: pulse 3s ease-in-out infinite; }
            .chat-fab:hover { transform: scale(1.1) !important; }
            .chat-scrollbar::-webkit-scrollbar { width: 4px; }
            .chat-scrollbar::-webkit-scrollbar-track { background: transparent; }
            .chat-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
            .chat-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
          `}</style>

          {/* Header */}
          <div style={{
            padding: '1rem 1.25rem', borderBottom: '1px solid var(--border)',
            background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(34,211,238,0.05))',
            display: 'flex', alignItems: 'center', gap: '0.75rem'
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <img src="/logo.png" alt="Bot Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>BizEngine AI</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                Ask anything about your data
              </div>
            </div>
            <div style={{
              width: 8, height: 8, borderRadius: '50%', background: '#10b981',
              boxShadow: '0 0 6px rgba(16,185,129,0.6)'
            }} />
            <button className="chat-close" onClick={handleClose} style={{
              background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: '8px',
              width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', transition: 'all 0.2s ease', marginLeft: '0.25rem'
            }}>
              <X size={14} color="var(--text-secondary)" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="chat-scrollbar" style={{
            flex: 1, overflowY: 'auto', padding: '1rem',
            display: 'flex', flexDirection: 'column', gap: '0.75rem'
          }}>
            {messages.map((msg, i) => (
              <div key={i} className="chat-msg" style={{
                display: 'flex', gap: '0.5rem',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                alignItems: 'flex-start'
              }}>
                {msg.role === 'bot' && (
                  <div style={{
                    width: 28, height: 28, borderRadius: '8px', flexShrink: 0,
                    background: 'rgba(99,102,241,0.1)', overflow: 'hidden',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <img src="/logo.png" alt="Bot" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
                <div style={{
                  maxWidth: '80%', padding: '0.6rem 0.85rem', borderRadius: '12px',
                  fontSize: '0.83rem', lineHeight: 1.6, whiteSpace: 'pre-wrap',
                  background: msg.role === 'user'
                    ? 'linear-gradient(135deg, #6366f1, #818cf8)'
                    : 'rgba(255,255,255,0.05)',
                  color: msg.role === 'user' ? '#fff' : 'var(--text-primary)',
                  border: msg.role === 'bot' ? '1px solid var(--border)' : 'none',
                  borderTopRightRadius: msg.role === 'user' ? '4px' : '12px',
                  borderTopLeftRadius: msg.role === 'bot' ? '4px' : '12px',
                }}>
                  {msg.text}
                </div>
                {msg.role === 'user' && (
                  <div style={{
                    width: 28, height: 28, borderRadius: '8px', flexShrink: 0,
                    background: 'rgba(34,211,238,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <User size={14} color="#22d3ee" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="chat-msg" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '8px',
                  background: 'rgba(99,102,241,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Bot size={14} color="var(--accent)" />
                </div>
                <div style={{
                  padding: '0.6rem 0.85rem', borderRadius: '12px', borderTopLeftRadius: '4px',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  fontSize: '0.82rem', color: 'var(--text-secondary)'
                }}>
                  <span style={{ display: 'flex', gap: '3px' }}>
                    {[0, 1, 2].map(d => (
                      <span key={d} style={{
                        width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)',
                        animation: `dotBounce 1.4s ease-in-out ${d * 0.16}s infinite`
                      }} />
                    ))}
                  </span>
                  Thinking...
                </div>
              </div>
            )}

            {/* Quick Suggestions — show only if there's only the welcome message */}
            {messages.length === 1 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.25rem' }}>
                {SUGGESTIONS.map((s, i) => (
                  <button key={i} className="chat-suggestion" onClick={() => sendMessage(s)} style={{
                    background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
                    borderRadius: '20px', padding: '0.35rem 0.75rem', fontSize: '0.75rem',
                    color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 0.2s',
                    whiteSpace: 'nowrap'
                  }}>
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <div style={{
            padding: '0.75rem 1rem', borderTop: '1px solid var(--border)',
            display: 'flex', gap: '0.5rem', alignItems: 'center'
          }}>
            <input
              ref={inputRef}
              className="chat-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your data..."
              disabled={loading}
              style={{
                flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)',
                borderRadius: '10px', padding: '0.6rem 0.85rem', color: 'var(--text-primary)',
                fontSize: '0.85rem', transition: 'border-color 0.2s'
              }}
            />
            <button
              className="chat-send"
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              style={{
                width: 38, height: 38, borderRadius: '10px',
                background: input.trim() ? 'linear-gradient(135deg, #6366f1, #22d3ee)' : 'rgba(255,255,255,0.05)',
                border: 'none', cursor: input.trim() ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)', opacity: input.trim() ? 1 : 0.4
              }}
            >
              <Send size={16} color="#fff" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
