import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../api';

const VerifyOTP = ({ onClose }) => {
  const { token } = useContext(AuthContext);
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post(
        'accounts/verify-otp/',
        { otp },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      setMessage(
        res.data?.message ||
          '✅ OTP verified successfully! Your account is now verified and you have access to additional features and privileges.'
      );

      // Delay closing so the user can read the message
      if (onClose) {
        setTimeout(() => {
          onClose();
        }, 3000); // Wait 3 seconds
      }
    } catch (err) {
      setMessage(
        err.response?.data?.error || '❌ Invalid OTP or something went wrong.'
      );
    }
  };

  return (
    <div>
      <h3>Verify OTP</h3>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter your OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />
        <button type="submit">Verify</button>
      </form>
    </div>
  );
};

export default VerifyOTP;