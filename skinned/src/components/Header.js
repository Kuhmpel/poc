import React, { useState, useContext } from 'react';
import API from '../api';
import { AuthContext } from '../context/AuthContext';
import './Header.css';

const Header = () => {
  const { login } = useContext(AuthContext);

  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // Separate states for login and register
  const [registerData, setRegisterData] = useState({ username: '', password: '', message: '', isLoading: false });
  const [loginData, setLoginData] = useState({ username: '', password: '', message: '', isLoading: false });

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegisterData(prev => ({ ...prev, isLoading: true, message: '' }));

    try {
      const response = await API.post('accounts/register/', {
        username: registerData.username,
        password: registerData.password,
      });

      if (response.status === 201) {
        const loginResponse = await API.post('accounts/login/', {
          username: registerData.username,
          password: registerData.password,
        });
        const { access, refresh } = loginResponse.data;
        login(access);
        localStorage.setItem('refresh', refresh);
        setRegisterData(prev => ({ ...prev, message: '✅ Registered and logged in!' }));
        setIsRegisterOpen(false);
      }
    } catch (error) {
      setRegisterData(prev => ({
        ...prev,
        message: `❌ ${error.response?.data?.error || 'Registration failed.'}`
      }));
    } finally {
      setRegisterData(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginData(prev => ({ ...prev, isLoading: true, message: '' }));

    try {
      const response = await API.post('accounts/login/', {
        username: loginData.username,
        password: loginData.password,
      });

      if (response.status === 200) {
        const { access, refresh } = response.data;
        login(access);
        localStorage.setItem('refresh', refresh);
        setLoginData(prev => ({ ...prev, message: '✅ Login successful!' }));
        setIsLoginOpen(false);
      }
    } catch (error) {
      setLoginData(prev => ({
        ...prev,
        message: `❌ ${error.response?.data?.error || 'Login failed.'}`
      }));
    } finally {
      setLoginData(prev => ({ ...prev, isLoading: false }));
    }
  };

  const renderModal = (type) => {
    const isRegister = type === 'register';
    const data = isRegister ? registerData : loginData;
    const setData = isRegister ? setRegisterData : setLoginData;
    const handleSubmit = isRegister ? handleRegister : handleLogin;

    return (
      <div className="modal-backdrop">
        <div className="modal-content">
          <button
            className="modal-close"
            onClick={() => {
              if (isRegister) {
                setIsRegisterOpen(false);
                setRegisterData({ username: '', password: '', message: '', isLoading: false });
              } else {
                setIsLoginOpen(false);
                setLoginData({ username: '', password: '', message: '', isLoading: false });
              }
            }}
          >
            ×
          </button>
          <h2>{isRegister ? 'Register' : 'Login'}</h2>
          <form onSubmit={handleSubmit}>
            <label>Username:</label>
            <input
              type="text"
              value={data.username}
              onChange={(e) => setData(prev => ({ ...prev, username: e.target.value }))}
              required
            />
            <label>Password:</label>
            <input
              type="password"
              value={data.password}
              onChange={(e) => setData(prev => ({ ...prev, password: e.target.value }))}
              required
            />
            <button type="submit" disabled={data.isLoading}>
              {data.isLoading ? (isRegister ? 'Registering...' : 'Logging in...') : isRegister ? 'Register' : 'Login'}
            </button>
          </form>
          {data.message && <p>{data.message}</p>}
        </div>
      </div>
    );
  };

  return (
    <header className="app-header">

      <h1>MyCityMentor</h1>
      <nav>
        <button onClick={() => setIsLoginOpen(true)}>Login</button>
        <button onClick={() => setIsRegisterOpen(true)}>Register</button>
      </nav>
      {isRegisterOpen && renderModal('register')}
      {isLoginOpen && renderModal('login')}
    </header>
  );
};

export default Header;