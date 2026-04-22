import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Globe, Loader2 } from "lucide-react";
import { chat as chatApi } from "../../api/client";
import { translations, questionKeywords, languages } from "./translations";
import "./Chatbot.css";

const getResponse = (message, lang) => {
  const t = translations[lang] || translations.en;
  const msg = (message || "").toLowerCase().trim();

  for (const [key, keywords] of Object.entries(questionKeywords)) {
    if (keywords.some((kw) => msg.includes(kw.toLowerCase()))) {
      return t[key] || t.defaultReply;
    }
  }

  return t.defaultReply;
};

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [lang, setLang] = useState("en");
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const t = translations[lang] || translations.en;

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ type: "bot", text: t.greeting }]);
    }
  }, [isOpen, lang]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setMessages((prev) => [...prev, { type: "user", text }]);
    setInput("");
    setLoading(true);

    try {
      const history = messages.map((m) => ({ type: m.type, text: m.text }));
      const { data } = await chatApi.send(text, history, lang);

      if (data.reply) {
        setMessages((prev) => [...prev, { type: "bot", text: data.reply }]);
      } else {
        throw new Error("No reply");
      }
    } catch (err) {
      const fallback = err.response?.data?.fallback ?? true;
      const reply = fallback ? getResponse(text, lang) : (t.defaultReply || "Something went wrong. Please try again.");
      setMessages((prev) => [...prev, { type: "bot", text: reply }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleLangChange = (code) => {
    setLang(code);
    setShowLangPicker(false);
    if (messages.length > 0) {
      const newT = translations[code] || translations.en;
      setMessages((prev) =>
        prev.map((m, i) =>
          i === 0 && m.type === "bot" ? { ...m, text: newT.greeting } : m
        )
      );
    }
  };

  return (
    <>
      <button
        type="button"
        className="chatbot-fab"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {isOpen && (
        <div className="chatbot-panel">
          <div className="chatbot-header">
            <h3>{t.title}</h3>
            <div className="chatbot-header-actions">
              <div className="lang-picker-wrapper">
                <button
                  type="button"
                  className="lang-btn"
                  onClick={() => setShowLangPicker(!showLangPicker)}
                  title={t.language}
                >
                  <Globe size={18} />
                  <span>{languages.find((l) => l.code === lang)?.label || "EN"}</span>
                </button>
                {showLangPicker && (
                  <div className="lang-dropdown">
                    {languages.map((l) => (
                      <button
                        key={l.code}
                        type="button"
                        className={`lang-option ${lang === l.code ? "active" : ""}`}
                        onClick={() => handleLangChange(l.code)}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="button"
                className="chatbot-close"
                onClick={() => setIsOpen(false)}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="chatbot-messages">
            {messages.map((m, i) => (
              <div key={i} className={`chat-message ${m.type}`}>
                <div className="message-bubble">{m.text}</div>
              </div>
            ))}
            {loading && (
              <div className="chat-message bot">
                <div className="message-bubble typing-indicator">
                  <Loader2 size={18} className="spin" />
                  <span>Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chatbot-input-wrap">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t.placeholder}
              className="chatbot-input"
              disabled={loading}
            />
            <button
              type="button"
              className="chatbot-send"
              onClick={handleSend}
              disabled={loading}
              aria-label={t.send}
            >
              {loading ? <Loader2 size={20} className="spin" /> : <Send size={20} />}
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
