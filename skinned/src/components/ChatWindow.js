import React, { useState, useEffect, useRef, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import './ChatWindow.css';

// UUID generator
const generateUUID = () =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (crypto.getRandomValues(new Uint8Array(1))[0] % 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });

const ChatWindow = ({ addToHistory = () => {} }) => {
  const authContext = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const chatDisplayRef = useRef(null);
  const token = authContext?.token;

  const [sessionId] = useState(() => {
    const existing = sessionStorage.getItem('chat_session_id');
    if (existing) return existing;
    const newId = generateUUID();
    sessionStorage.setItem('chat_session_id', newId);
    return newId;
  });

  useEffect(() => {
    if (!token) {
      setMessages([]);
      setCurrentMessage('');
    }
  }, [token]);

  useEffect(() => {
    if (chatDisplayRef.current) {
      chatDisplayRef.current.scrollTop = chatDisplayRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (currentMessage.trim() === '') return;

    setMessages((prev) => [...prev, { type: 'user', content: currentMessage }]);
    addToHistory(currentMessage);
    setCurrentMessage('');

    setMessages((prev) => [...prev, { type: 'bot', content: '...', isThinking: true }]);

    try {
      const response = await fetch('http://localhost:8000/api/chatbot/chat/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ message: currentMessage, session_id: sessionId }),
      });

      const data = await response.json();

      const botContent = (
        <>
          {data.chatbotResponse || data.answer || 'No response'}

          {data.insight && (
            <div className="chat-insight">
              <strong>💡 Insight:</strong> {data.insight}
            </div>
          )}
          {data.categories?.length > 0 && (
            <div className="chat-meta">
              <strong>📚 Categories:</strong> {data.categories.join(', ')}
            </div>
          )}
          {data.question_sentiment?.label && (
            <div className="chat-meta">
              <strong>🙂 Sentiment:</strong> {data.question_sentiment.label}
            </div>
          )}
          {data.question_emotion?.label && (
            <div className="chat-meta">
              <strong>😄 Emotion:</strong> {data.question_emotion.label}
            </div>
          )}
        </>
      );

      setMessages((prev) => [...prev.slice(0, -1), { type: 'bot', content: botContent }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev.slice(0, -1),
        { type: 'bot', content: `Request failed: ${error.message}` },
      ]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="chat-window">
      <div className="chat-meta">
        <p>
          <strong>Personalized Experience</strong> | <strong>Contextual Knowledge</strong> |{' '}
          <strong>Official Transactions</strong>
        </p>
        <p>
          Select Context For Your Interaction • <span>Verified</span>
        </p>
      </div>

      <div className="chat-history" ref={chatDisplayRef}>
        {messages.map((msg, index) => (
          <div key={index} className={msg.type === 'bot' ? 'chat-bot' : 'chat-user'}>
            {msg.isThinking ? '...' : msg.content}
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          type="text"
          placeholder="Message your city mentor…"
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatWindow;