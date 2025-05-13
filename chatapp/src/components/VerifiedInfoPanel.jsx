import React, { useEffect, useState } from 'react';
import API from '../api'; // Make sure this path is correct

const VerifiedInfoPanel = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVerifiedInfo = async () => {
      try {
        const response = await API.get('accounts/verified-info/');
        setUserInfo(response.data);
      } catch (err) {
        setError('Failed to load verified info.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchVerifiedInfo();
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;
  if (!userInfo) return null;

  const {
    first_name,
    last_name,
    email,
    is_verified,
    address_line1,
    address_line2,
    city,
    state,
    zip_code,
    zoning_context,
  } = userInfo;

  return (
    <div className="p-4 bg-white rounded-lg shadow-md text-sm">
      <h2 className="text-lg font-semibold mb-2">Verified Info</h2>
      <div><strong>Name:</strong> {first_name} {last_name}</div>
      <div><strong>Email:</strong> {email}</div>
      <div><strong>Status:</strong> {is_verified ? '✅ Verified' : '❌ Not Verified'}</div>
      <div className="mt-2">
        <strong>Address:</strong>
        <div>{address_line1}</div>
        {address_line2 && <div>{address_line2}</div>}
        <div>{city}, {state} {zip_code}</div>
      </div>

      {zoning_context && (
        <div className="mt-4">
          <h3 className="font-medium">Zoning Info</h3>
          {Object.entries(zoning_context).map(([key, value]) => (
            <div key={key}>
              <strong>{key.replace(/_/g, ' ')}:</strong>{' '}
              {typeof value === 'object' ? JSON.stringify(value) : value}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VerifiedInfoPanel;