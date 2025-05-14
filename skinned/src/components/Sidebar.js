import React, { useContext } from 'react';
import './Sidebar.css';
import { FaHome, FaComments, FaFileAlt, FaChartBar, FaBars, FaSun, FaMoon } from 'react-icons/fa';
import { ThemeContext } from '../ThemeContext';


const navItems = [
  { icon: <FaHome />, label: 'Home' },
  { icon: <FaComments />, label: 'Chat' },
  { icon: <FaFileAlt />, label: 'Forms' },
  { icon: <FaChartBar />, label: 'Reports' },
];

const Sidebar = ({ collapsed, toggle }) => {
  const { theme, setTheme } = useContext(ThemeContext);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <button className="toggle-btn" onClick={toggle} title="Toggle menu">
        <FaBars />
      </button>
      <ul>
        {navItems.map((item, index) => (
          <li key={index} title={collapsed ? item.label : ''}>
            <span className="icon">{item.icon}</span>
            {!collapsed && <span className="label">{item.label}</span>}
          </li>
        ))}
        <li onClick={toggleTheme} title="Toggle theme">
          <span className="icon">{theme === 'light' ? <FaMoon /> : <FaSun />}</span>
          {!collapsed && <span className="label">Theme</span>}
        </li>
      </ul>
    </aside>
  );
};

export default Sidebar;