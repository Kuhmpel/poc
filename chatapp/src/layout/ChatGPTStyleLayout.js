import React, { useState, useContext, useEffect } from 'react';
import ChatWindow from '../components/ChatWindow';
import Register from '../components/Register';
import Login from '../components/Login';
import RequestVerification from '../components/RequestVerification';
import VerifyOTP from '../components/VerifyOTP';
import VerifiedInfoPanel from '../components/VerifiedInfoPanel';
import { AuthContext } from '../context/AuthContext';
import ConversationHistory from '../components/ConversationHistory'; // Import the conversation history component
import '../App.css';

const ChatGPTStyleLayout = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const { token, logout, user } = useContext(AuthContext);

  useEffect(() => {
    if (token) {
      setActiveTab('chat');
    }
  }, [token]);

  return (
    <div className="layout">
      <aside className="side-panel">
        <h2>Menu</h2>
        <ul>
          {!token && (
            <>
              <li>
                <button className="menu-item" onClick={() => setActiveTab('register')}>
                  Register
                </button>
              </li>
              <li>
                <button className="menu-item" onClick={() => setActiveTab('login')}>
                  Login
                </button>
              </li>
            </>
          )}

          {token && (
            <>
              <li>
                <button className="menu-item" onClick={() => setActiveTab('request-verification')}>
                  Request Verification
                </button>
              </li>
              <li>
                <button className="menu-item" onClick={() => setActiveTab('verify-otp')}>
                  Verify OTP
                </button>
              </li>
              <li>
                <button className="menu-item" onClick={() => setActiveTab('verified-info')}>
                  View Verified Info
                </button>
              </li>
              <li>
                <button
                  className="menu-item"
                  onClick={() => {
                    logout();
                    setActiveTab('login');
                  }}
                >
                  Logout
                </button>
              </li>
            </>
          )}
        </ul>

        {user && (
          <p>
            Welcome,{' '}
            {user.first_name
              ? `${user.first_name} ${user.last_name || ''}`
              : user.username || user.email || 'User'}
            !
          </p>
        )}

        {/* Side-panel content logic */}
        {!token && activeTab === 'register' && (
          <div className="side-panel-content">
            <Register />
          </div>
        )}
        {!token && activeTab === 'login' && (
          <div className="side-panel-content">
            <Login />
          </div>
        )}
        {token && activeTab === 'request-verification' && (
          <div className="side-panel-content">
            <RequestVerification onClose={() => setActiveTab('chat')} />
          </div>
        )}
        {token && activeTab === 'verify-otp' && (
          <div className="side-panel-content">
            <VerifyOTP onClose={() => setActiveTab('chat')} />
          </div>
        )}
        {token && activeTab === 'verified-info' && (
          <div className="side-panel-content">
            <VerifiedInfoPanel />
          </div>
        )}

        {/* Conversation History Section */}
        {token && (
          <div className="side-panel-content">
            <ConversationHistory />
          </div>
        )}
      </aside>

      <main className="main-area">
        <ChatWindow />
      </main>
    </div>
  );
};

export default ChatGPTStyleLayout;