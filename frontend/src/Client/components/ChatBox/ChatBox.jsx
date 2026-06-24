/* eslint-disable no-unused-vars */
import "./ChatBox.css";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, Send, Loader2, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getCurrentUserSync } from "../../../services/userService";
import { sendMessage, getChatHistory, sendMessageWithMovies } from "../../../services/chatService";
import MovieSuggestionCard from "./MovieSuggestionCard";

const ChatBox = () => {
  const { t } = useTranslation();
  const user = getCurrentUserSync();
  const userId = user?.id || user?._id || user?.userId || user?.email;
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const quickQuestions = [
    { text: t("What movies are playing today?"), value: t("What movies are playing today?") },
    { text: t("Suggest some action movies"), value: t("Suggest some action movies") },
    { text: t("Suggest some horror movies"), value: t("Suggest some horror movies") },
    { text: t("How to book movie tickets?"), value: t("How to book movie tickets?") },
    { text: t("What are the ticket prices?"), value: t("What are the ticket prices?") }
  ];

  // Scroll down
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Reload chat history 
  useEffect(() => {
    if (isOpen) {
      if (!userId) {
        setMessages([]);
        return;
      }
      getChatHistory(userId).then((history) => {
        const formattedHistory = history.map(msg => ({
          sender: msg.sender || (msg.role === "user" ? "user" : "bot"),
          message: msg.content || msg.message || "",
          movies: msg.movies || null
        }));
        setMessages(formattedHistory);
      });
    }
  }, [isOpen, userId]);

  // Check if message is movie-related
  const isMovieRelated = (text) => {
    const movieKeywords = [
      'phim', 'movie', 'film', 'gợi ý', 'suggest', 'recommend',
      'xem gì', 'phim hay', 'chiếu rạp', 'cinema', 'thể loại', 'types',
      'genre', 'diễn viên', 'actor', 'đạo diễn', 'director'
    ];
    const lowerText = text.toLowerCase();
    return movieKeywords.some(keyword => lowerText.includes(keyword));
  };

  // Send message text
  const sendMessageText = async (text) => {
    if (!text.trim() || isLoading) return;

    const userMessage = { sender: "user", message: text };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Check if query is movie-related
      if (isMovieRelated(text)) {
        const response = await sendMessageWithMovies(text, userId);
        const botMessage = {
          sender: "bot",
          message: response.reply || response.message || "",
          movies: response.movies || null
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        const reply = await sendMessage(text, userId);
        const botMessage = { sender: "bot", message: reply };
        setMessages((prev) => [...prev, botMessage]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", message: t("Cannot connect to server.") },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Send message from input
  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendMessageText(input);
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter")
      handleSend();
  };

  return (
    <>
      {!isOpen && (
        <button
          className="chat-toggle-btn"
          onClick={() => setIsOpen(true)}
          aria-label={t('Open chat')}
        >
          <MessageCircle size={28} strokeWidth={2} />
        </button>
      )}

      {isOpen && (
        <div className="chat-popup">
          <div className="chat-header">
            <MessageCircle size={22} strokeWidth={2} aria-hidden />
            <span className="chat-header-title">{t('Chat Movie Assistant')}</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="btn-close"
              aria-label={t('Close')}
            >
              <X size={18} />
            </button>
          </div>

          <div className="chat-body">
            {messages.length === 0 && (
              <div className="chat-welcome">
                <MessageCircle size={40} strokeWidth={1.5} className="chat-welcome-icon" aria-hidden />
                <p>{t('Hi, I\'m HAK cinema\'s Chat Assistant. How can I help you today?')}</p>
                <p className="welcome-hint">
                  {t('Try asking:')} "{t('Suggest some action movies')}" {t('or')} "{t('What movies are playing today?')}"
                </p>
                <div className="welcome-quick-questions">
                  {quickQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="quick-question-btn"
                      onClick={() => sendMessageText(q.value)}
                      disabled={isLoading}
                    >
                      <span>{q.text}</span>
                      <span className="arrow-icon">→</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {messages.map((msg, index) => (
              <div key={index} className="message-wrapper">
                <div
                  className={`chat-message ${msg.sender === "user" ? "user-msg" : "bot-msg"
                    }`}
                >
                  {msg.message && <div className="message-text">{msg.message}</div>}
                  {msg.movies && msg.movies.length > 0 && (
                    <div className="movie-suggestions">
                      <div className="suggestions-label">{t('Movie suggestions:')}</div>
                      {msg.movies.map((movie) => (
                        <MovieSuggestionCard key={movie.id} movie={movie} onMovieClick={() => setIsOpen(false)} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="chat-message bot-msg loading-msg">
                <Loader2 size={18} className="chat-loading-icon" aria-hidden />
                <span>{t('Searching...')}</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {messages.length > 0 && !isLoading && (
            <div className="chat-quick-suggestions">
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="quick-suggestion-pill"
                  onClick={() => sendMessageText(q.value)}
                >
                  {q.text}
                </button>
              ))}
            </div>
          )}

          <div className="chat-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('Type your message...')}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              aria-label={t('Send message')}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBox;
