import React from 'react';
import { getActiveRole, getActiveToken } from '../../utils/auth';

const TokenDebug = () => {
  const token = getActiveToken();
  const user = sessionStorage.getItem('user');
  const userRole = getActiveRole();

  // Decode JWT token to see payload
  const decodeToken = (token) => {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch (e) {
      return { error: 'Invalid token' };
    }
  };

  const decodedToken = decodeToken(token);

  const clearStorage = () => {
    sessionStorage.clear();
    window.location.reload();
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-2xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Token Debug Information</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Stored Token (first 50 chars):
          </label>
          <div className="p-3 bg-gray-100 rounded border text-sm font-mono">
            {token ? token.substring(0, 50) + '...' : 'No token found'}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Session Storage Keys:
          </label>
          <div className="p-3 bg-gray-100 rounded border text-sm font-mono">
            <pre>{JSON.stringify(Object.keys(sessionStorage), null, 2)}</pre>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Decoded Token Payload:
          </label>
          <div className="p-3 bg-gray-100 rounded border text-sm font-mono">
            <pre>{JSON.stringify(decodedToken, null, 2)}</pre>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Stored User:
          </label>
          <div className="p-3 bg-gray-100 rounded border text-sm font-mono">
            <pre>{user ? JSON.stringify(JSON.parse(user), null, 2) : 'No user found'}</pre>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Stored User Role:
          </label>
          <div className="p-3 bg-gray-100 rounded border text-sm font-mono">
            {userRole || 'No role found'}
          </div>
        </div>

        <button
          onClick={clearStorage}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
        >
          Clear All Storage & Reload
        </button>
      </div>
    </div>
  );
};

export default TokenDebug;