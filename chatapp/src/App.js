import React from 'react';
import { AuthProvider } from './context/AuthContext';  // Make sure the path is correct
import ChatGPTStyleLayout from './layout/ChatGPTStyleLayout';  // Your existing layout component

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <ChatGPTStyleLayout />
      </div>
    </AuthProvider>
  );
}

export default App;