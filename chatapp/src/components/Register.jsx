import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../api';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useContext(AuthContext);

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
  
    try {
      const response = await API.post('accounts/register/', { username, password });

      if (response.status === 201) {
        const loginResponse = await API.post('accounts/login/', { username, password });
        const { access } = loginResponse.data;
        login(access);
        setMessage(
          '✅ Registration successful! You’ve been automatically logged in and can now start using all features.'
        );
      }
    } catch (error) {
      if (error.response) {
        setMessage(
          `❌ ${error.response.data.error || 'Registration failed. Please check your input.'}`
        );
      } else {
        setMessage('❌ An error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <div>
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Registering...' : 'Register'}
        </button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Register;