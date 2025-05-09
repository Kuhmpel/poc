import React, { useState, useEffect, useRef, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import '../App.css';

// UUID generator
const generateUUID = () => {
  return crypto.randomUUID?.() || ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
};

const ChatWindow = ({ addToHistory = () => {} }) => {
  const authContext = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const token = authContext?.token;
  const chatDisplayRef = useRef(null);

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

    const newMessages = [...messages, { user: currentMessage }];
    setMessages(newMessages);
    addToHistory(currentMessage);
    setCurrentMessage('');

    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      };

      const response = await fetch('http://localhost:8000/api/chatbot/chat/', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: currentMessage,
          session_id: sessionId
        }),
      });

      const data = await response.json();

      const botReply = response.ok
        ? {
            bot: data.chatbotResponse || data.answer || 'No response',
            insight: data.insight,
            categories: data.categories,
            sentiment: data.question_sentiment?.label,
            emotion: data.question_emotion?.label,
          }
        : { bot: `Error: ${data.error || 'Unknown error'}` };

      setMessages([...newMessages, botReply]);
    } catch (error) {
      setMessages([...newMessages, { bot: `Request failed: ${error.message}` }]);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="chat-window">
      <div className="chat-display" ref={chatDisplayRef}>
        {messages.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.user ? 'user' : 'bot'}`}>
            <div className={`chat-bubble ${msg.user ? 'user' : 'bot'}`}>
              {msg.user && <div>{msg.user}</div>}
              {msg.bot && (
                <>
                  <div>{msg.bot}</div>

                  {msg.insight && (
                    <div className="chat-insight">
                      <strong>💡 Insight:</strong> {msg.insight}
                    </div>
                  )}

                  {msg.categories?.length > 0 && (
                    <div className="chat-meta">
                      <strong>📚 Categories:</strong> {msg.categories.join(', ')}
                    </div>
                  )}

                  {msg.sentiment && (
                    <div className="chat-meta">
                      <strong>🙂 Sentiment:</strong> {msg.sentiment}
                    </div>
                  )}

                  {msg.emotion && (
                    <div className="chat-meta">
                      <strong>😄 Emotion:</strong> {msg.emotion}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="chat-input-area">
        <textarea
          className="chat-input"
          placeholder="Type your message..."
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="send-button" onClick={handleSendMessage}>
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;