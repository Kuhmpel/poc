import React from 'react';
import { AuthProvider } from './context/AuthContext';  // Make sure the path is correct
import './App.css';
import ChatGPTStyleLayout from './layout/ChatGPTStyleLayout';

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <ChatGPTStyleLayout></ChatGPTStyleLayout>
      </div>
    </AuthProvider>
  );
}

export default App;