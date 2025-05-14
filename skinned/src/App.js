import React, { useState } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ChatWindow from './components/ChatWindow';
import ProductBoxes from './components/ProductBoxes';


function App() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="app">
      <Sidebar collapsed={collapsed} toggle={() => setCollapsed(!collapsed)} />
      <div className="main-section">
        <Header />
        <ChatWindow />
        <ProductBoxes />
      </div>
    </div>
  );
}

export default App;