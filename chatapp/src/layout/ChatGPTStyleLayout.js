import React, { useState, useContext, useEffect } from 'react';
import './ChatGPTStyleLayout.css';
import ChatWindow from '../components/ChatWindow';
import Register from '../components/Register';
import Login from '../components/Login';
import { AuthContext } from '../context/AuthContext';

const ChatGPTStyleLayout = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const { token, logout, user } = useContext(AuthContext); // ✅ Use user from context

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
                <button
                  className="menu-item"
                  onClick={() => setActiveTab('register')}
                >
                  Register
                </button>
              </li>
              <li>
                <button
                  className="menu-item"
                  onClick={() => setActiveTab('login')}
                >
                  Login
                </button>
              </li>
            </>
          )}
          {token && (
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
          )}
        </ul>

        {user && <p>Welcome, {user.username || user.email || 'User'}!</p>}

        {activeTab === 'register' && !token && (
          <div className="side-panel-content">
            <Register />
          </div>
        )}
        {activeTab === 'login' && !token && (
          <div className="side-panel-content">
            <Login />
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