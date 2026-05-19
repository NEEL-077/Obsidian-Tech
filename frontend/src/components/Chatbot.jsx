import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './Chatbot.css';

// ── Helpers ───────────────────────────────────────────────────────────────────

// Use relative URL — Vite proxy in dev, Express static server in prod
const API_BASE = '';

async function sendMessage(message, history) {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history }),
  });
  if (!res.ok) throw new Error('Network error');
  return res.json();
}

function formatPrice(price) {
  return `₹${Number(price).toLocaleString('en-IN')}`;
}

function getImageSrc(img) {
  if (!img) return null;
  if (img.startsWith('http')) return img;
  return img.startsWith('/') ? img : `/${img}`;
}

function getSpecBadges(product) {
  const specs = product.specs || {};
  const badges = [];
  if (specs.battery) badges.push(specs.battery.replace('mAh', '') + 'mAh');
  if (specs.camera || specs.rear_camera) {
    const cam = (specs.camera || specs.rear_camera || '').split(' ')[0];
    if (cam) badges.push(cam);
  }
  if (specs.processor || specs.chipset) {
    const chip = (specs.processor || specs.chipset || '').split(' ').slice(0, 2).join(' ');
    if (chip) badges.push(chip);
  }
  return badges.slice(0, 3);
}

// Parse markdown-style **bold** in bot messages
function parseBold(text) {
  if (!text) return '';
  return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

// ── Sub-components ────────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="chatbot-typing chatbot-message bot">
      <div className="chatbot-msg-avatar" aria-hidden="true">🤖</div>
      <div className="chatbot-typing-dots" aria-label="Bot is typing">
        <span /><span /><span />
      </div>
    </div>
  );
}

function ProductCard({ product, onClick }) {
  const badges = getSpecBadges(product);
  const imgSrc = getImageSrc(product.image);

  return (
    <div className="chatbot-product-card" onClick={() => onClick(product._id)} role="button" tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onClick(product._id)}>
      {imgSrc && (
        <img
          src={imgSrc}
          alt={product.name}
          className="chatbot-product-img"
          onError={e => { e.target.style.display = 'none'; }}
        />
      )}
      <div className="chatbot-product-info">
        <div className="chatbot-product-name" title={product.name}>{product.name}</div>
        <div className="chatbot-product-price">{formatPrice(product.price)}</div>
        {badges.length > 0 && (
          <div className="chatbot-product-specs">
            {badges.map((b, i) => (
              <span key={i} className="chatbot-spec-badge">{b}</span>
            ))}
          </div>
        )}
      </div>
      <button className="chatbot-product-btn" onClick={e => { e.stopPropagation(); onClick(product._id); }}>
        View →
      </button>
    </div>
  );
}

function BotMessage({ msg, onSuggestion, onProductClick }) {
  return (
    <div className="chatbot-message bot">
      <div className="chatbot-msg-avatar" aria-hidden="true">🤖</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          className="chatbot-bubble"
          dangerouslySetInnerHTML={{ __html: parseBold(msg.text) }}
        />
        {msg.products && msg.products.length > 0 && (
          <div className="chatbot-products">
            {msg.products.map(p => (
              <ProductCard key={p._id} product={p} onClick={onProductClick} />
            ))}
          </div>
        )}
        {msg.suggestions && msg.suggestions.length > 0 && (
          <div className="chatbot-suggestions">
            {msg.suggestions.map((s, i) => (
              <button key={i} className="chatbot-suggestion-chip" onClick={() => onSuggestion(s)}>
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function UserMessage({ text }) {
  return (
    <div className="chatbot-message user">
      <div className="chatbot-bubble">{text}</div>
    </div>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────

const ChatIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const SendIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
  </svg>
);

// ── Main Chatbot Component ────────────────────────────────────────────────────

const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'bot',
  text: "👋 Hi! I'm **Cura**, your OBSIDIAN TECH shopping assistant!\n\nHere's what I can help you with:\n• 🔍 Find the perfect smartphone for your budget\n• 📊 Compare phones side-by-side\n• 📱 Get full specs & price details\n\nWhat are you looking for today?",
  products: [],
  suggestions: [
    'Best phones under ₹30,000',
    'Best camera phone',
    'Gaming phones',
    'Samsung vs iPhone',
    'Best 5G phones',
  ],
};

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, scrollToBottom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  const handleProductClick = useCallback((productId) => {
    navigate(`/product/${productId}`);
    setIsOpen(false);
  }, [navigate]);

  const handleSend = useCallback(async (text) => {
    const trimmed = (text || input).trim();
    if (!trimmed || isTyping) return;

    // Add user message
    const userMsg = { id: Date.now(), role: 'user', text: trimmed };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Build history (last 6 turns)
    const historySlice = messages.slice(-6).map(m => ({ role: m.role, content: m.text }));

    try {
      const data = await sendMessage(trimmed, historySlice);
      const botMsg = {
        id: Date.now() + 1,
        role: 'bot',
        text: data.reply || 'Something went wrong. Please try again.',
        products: data.products || [],
        suggestions: data.suggestions || [],
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error('[Chatbot] Error:', err);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'bot',
        text: "⚠️ I'm having trouble connecting right now. Please check your connection and try again.",
        products: [],
        suggestions: ['Try again', 'Browse all phones'],
      }]);
    } finally {
      setIsTyping(false);
    }
  }, [input, isTyping, messages]);

  const handleSuggestion = useCallback((text) => {
    handleSend(text);
  }, [handleSend]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* ── Floating Trigger Button ── */}
      <button
        id="chatbot-trigger-btn"
        className={`chatbot-trigger ${isOpen ? 'open' : ''}`}
        onClick={isOpen ? handleClose : handleOpen}
        aria-label={isOpen ? 'Close Cura' : 'Open Cura chat assistant'}
        title="Cura — OBSIDIAN TECH Assistant"
      >
        {hasUnread && !isOpen && (
          <span className="chatbot-badge" aria-label="1 new message">1</span>
        )}
        {isOpen ? <CloseIcon /> : <ChatIcon />}
      </button>

      {/* ── Chat Panel ── */}
      <div
        className={`chatbot-panel ${isOpen ? 'visible' : 'hidden'}`}
        role="dialog"
        aria-label="Cura Chat"
        aria-modal="false"
      >
        {/* Header */}
        <div className="chatbot-header">
          <div className="chatbot-avatar" aria-hidden="true">🤖</div>
          <div className="chatbot-header-info">
            <div className="chatbot-header-name">Cura</div>
            <div className="chatbot-header-status">
              <span className="chatbot-status-dot" />
              Online · Ready to help
            </div>
          </div>
          <button className="chatbot-close-btn" onClick={handleClose} aria-label="Close chat">
            <CloseIcon />
          </button>
        </div>

        {/* Messages */}
        <div className="chatbot-messages" role="log" aria-live="polite" aria-label="Chat messages">
          {messages.map(msg =>
            msg.role === 'user'
              ? <UserMessage key={msg.id} text={msg.text} />
              : <BotMessage key={msg.id} msg={msg} onSuggestion={handleSuggestion} onProductClick={handleProductClick} />
          )}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="chatbot-input-area">
          <textarea
            ref={inputRef}
            id="chatbot-message-input"
            className="chatbot-input"
            placeholder="Ask about phones, compare, get recommendations…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            disabled={isTyping}
            aria-label="Type your message"
          />
          <button
            id="chatbot-send-btn"
            className="chatbot-send-btn"
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            aria-label="Send message"
          >
            <SendIcon />
          </button>
        </div>
      </div>
    </>
  );
}
