import React, { useState } from 'react';
import API from '../api';

const RequestVerification = ({ onClose }) => {
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    zip_code: '',
  });
  const [message, setMessage] = useState(null);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('accounts/request-verification/', formData);
      const serverMessage = res.data?.message;

      setMessage(
        serverMessage ||
          '✅ Your request for verification has been received. A verification code will be mailed via U.S. Postal Service to the address you provided.'
      );

      // Optional: close modal after delay so message is visible
      if (onClose) {
        setTimeout(() => {
          onClose();
        }, 3000); // show message for 3 seconds
      }
    } catch (err) {
      setMessage(
        err.response?.data?.error || '❌ Something went wrong with the request.'
      );
    }
  };

  return (
    <div>
      <h3>Request Verification</h3>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="email"
          placeholder="Email (optional)"
          value={formData.email}
          onChange={handleChange}
        />
        <input
          type="text"
          name="first_name"
          placeholder="First Name"
          value={formData.first_name}
          onChange={handleChange}
        />
        <input
          type="text"
          name="last_name"
          placeholder="Last Name"
          value={formData.last_name}
          onChange={handleChange}
        />
        <input
          type="text"
          name="address_line1"
          placeholder="Address Line 1"
          value={formData.address_line1}
          onChange={handleChange}
        />
        <input
          type="text"
          name="address_line2"
          placeholder="Address Line 2 (optional)"
          value={formData.address_line2}
          onChange={handleChange}
        />
        <input
          type="text"
          name="city"
          placeholder="City"
          value={formData.city}
          onChange={handleChange}
        />
        <input
          type="text"
          name="state"
          placeholder="State"
          value={formData.state}
          onChange={handleChange}
        />
        <input
          type="text"
          name="zip_code"
          placeholder="ZIP Code"
          value={formData.zip_code}
          onChange={handleChange}
        />
        <button type="submit">Send Verification Code</button>
      </form>
    </div>
  );
};

export default RequestVerification;