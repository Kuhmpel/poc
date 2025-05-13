import React, { useState, useEffect, useContext, useCallback } from 'react';
import API from '../api'; // Assuming you are using the `API` instance from axios
import { AuthContext } from '../context/AuthContext';

const ConversationHistory = () => {
  const { token } = useContext(AuthContext); // To get token for authenticated user
  const [conversationHistory, setConversationHistory] = useState([]);

  const fetchConversationHistory = useCallback(async () => {
    try {
      let response;
      if (token) {
        // Fetch conversation history for authenticated users
        response = await API.get('chatbot/messages/');
      } else {
        // Fetch conversation history for anonymous users
        const sessionId = localStorage.getItem('chat_session_id');
        response = await API.get(`chatbot/messages/anonymous/?session_id=${sessionId}`);
      }
      setConversationHistory(response.data); // Update the conversation history with the response
    } catch (error) {
      console.error('Error fetching conversation history:', error);
    }
  }, [token]); // Add `token` as a dependency

  useEffect(() => {
    // Fetch the conversation history when the component mounts
    fetchConversationHistory();

    // Optional: Set up an interval to refetch conversation history periodically (every 5 seconds)
    const interval = setInterval(fetchConversationHistory, 5000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [fetchConversationHistory]); // Use the `fetchConversationHistory` as a dependency

  return (
    <div className="conversation-history">
      <h3>Conversation History</h3>
      <ul>
        {conversationHistory.map((message, index) => (
          <li key={index}>
            <strong>{message.user_message}</strong>: {message.chatbot_response}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ConversationHistory;