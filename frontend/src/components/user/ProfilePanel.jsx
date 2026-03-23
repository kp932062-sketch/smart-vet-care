import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { getActiveToken } from '../../utils/auth';

const ProfilePanel = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError('');
      try {
        const token = getActiveToken();
        if (!token) throw new Error('Not logged in');
        const localUser = JSON.parse(sessionStorage.getItem('user'));
        const userId = localUser?._id || localUser?.id;
        if (!userId) throw new Error('User info missing');
        const res = await api.get(`/users/${userId}`);
        setUser(res.data);
        setEditForm(res.data);
      } catch (err) {
        console.error('ProfilePanel error:', err);
        setError('Failed to load user info: ' + (err?.message || ''));
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
    setEditForm(user);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm(user);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const userId = user._id || user.id;
      const res = await api.put(`/users/${userId}`, editForm);
      setUser(res.data);
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update profile');
    }
    setSaving(false);
  };

  const handleInputChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value
    });
  };

  const getSubscriptionColor = (tier) => {
    switch (tier?.toLowerCase()) {
      case 'premium': return 'from-purple-500 to-purple-600';
      case 'basic': return 'from-blue-500 to-blue-600';
      case 'pro': return 'from-emerald-500 to-emerald-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getSubscriptionBadge = (tier) => {
    switch (tier?.toLowerCase()) {
      case 'premium': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'basic': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'pro': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="bg-white/20 backdrop-blur-lg rounded-2xl border border-white/30 shadow-xl p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/20 backdrop-blur-lg rounded-2xl border border-white/30 shadow-xl p-6">
        <div className="p-6 bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-xl">
          <div className="flex items-center space-x-2 text-red-700">
            <span>❌</span>
            <span className="font-medium">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-white/20 backdrop-blur-lg rounded-2xl border border-white/30 shadow-xl p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <span className="text-6xl text-gray-400">👤</span>
            <p className="text-gray-600 text-lg font-medium">User info not found</p>
            <p className="text-gray-500 text-sm">Please log in again</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/20 backdrop-blur-lg rounded-2xl border border-white/30 shadow-xl p-3 sm:p-4 lg:p-6 max-h-[90vh] overflow-y-auto">
      {/* Header - Mobile Optimized */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="p-1.5 sm:p-2 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-lg sm:rounded-xl shadow-lg">
            <span className="text-white text-base sm:text-xl">👤</span>
          </div>
          <h3 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
            My Profile
          </h3>
        </div>
        <div className="flex items-center space-x-2">
          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="flex items-center space-x-1 sm:space-x-2 bg-white/30 backdrop-blur-sm border border-white/20 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 text-gray-700 hover:bg-white/40 transition-all duration-300 text-sm sm:text-base"
            >
              <span>✏️</span>
              <span className="font-medium">Edit</span>
            </button>
          ) : (
            <div className="flex space-x-1 sm:space-x-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className={`flex items-center space-x-1 sm:space-x-2 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 font-medium transition-all duration-300 text-xs sm:text-sm ${
                  saving 
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
                }`}
              >
                <span>💾</span>
                <span>{saving ? 'Saving...' : 'Save'}</span>
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center space-x-1 sm:space-x-2 bg-red-500 hover:bg-red-600 text-white rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 font-medium transition-all duration-300 text-xs sm:text-sm"
              >
                <span>❌</span>
                <span>Cancel</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Content */}
      <div className="space-y-4 sm:space-y-6">
        {/* Enhanced Avatar Section */}
        <div className="bg-gradient-to-br from-blue-50 to-emerald-50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-blue-100/50">
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full flex items-center justify-center shadow-xl">
                <span className="text-3xl sm:text-4xl text-white">👤</span>
              </div>
              <button className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 bg-white/90 backdrop-blur-sm rounded-full p-1.5 sm:p-2 border border-white/50 hover:bg-white transition-all duration-300 shadow-lg">
                <span className="text-gray-600 text-sm sm:text-base">📷</span>
              </button>
            </div>
            <div className="text-center sm:text-left flex-1 min-w-0">
              <h4 className="text-xl sm:text-2xl font-bold text-gray-800 mb-1 truncate">{user.name}</h4>
              <p className="text-gray-600 text-sm sm:text-base mb-2 break-all">{user.email}</p>
              {user.subscriptionTier && (
                <div className={`inline-flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-1 rounded-full border ${getSubscriptionBadge(user.subscriptionTier)}`}>
                  <span className="text-sm sm:text-base">👑</span>
                  <span className="text-xs sm:text-sm font-medium">{user.subscriptionTier} Member</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Information Grid - Enhanced */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Personal Information */}
          <div className="bg-white/40 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/30 shadow-lg">
            <h5 className="text-base sm:text-lg font-semibold text-gray-700 mb-3 sm:mb-4 flex items-center space-x-2">
              <span className="text-blue-600 text-lg sm:text-xl">👤</span>
              <span>Personal Information</span>
            </h5>
            <div className="space-y-3 sm:space-y-4">
              <div className="bg-white/30 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2">Full Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={editForm.name || ''}
                    onChange={handleInputChange}
                    className="w-full rounded-xl px-4 py-3 border border-gray-300 bg-white text-gray-800 placeholder-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500"
                  />
                ) : (
                  <p className="text-gray-800 font-medium text-sm sm:text-base break-words">{user.name}</p>
                )}
              </div>
              
              <div className="bg-white/30 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2 flex items-center gap-1">
                  <span>📧</span>
                  <span>Email Address</span>
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={editForm.email || ''}
                    onChange={handleInputChange}
                    className="w-full rounded-xl px-4 py-3 border border-gray-300 bg-white text-gray-800 placeholder-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500"
                  />
                ) : (
                  <p className="text-gray-800 font-medium text-sm sm:text-base break-all">{user.email}</p>
                )}
              </div>
              
              <div className="bg-white/30 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2 flex items-center gap-1">
                  <span>📱</span>
                  <span>Mobile Number</span>
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="mobile"
                    value={editForm.mobile || ''}
                    onChange={handleInputChange}
                    placeholder="Enter mobile number"
                    className="w-full rounded-xl px-4 py-3 border border-gray-300 bg-white text-gray-800 placeholder-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500"
                  />
                ) : (
                  <p className="text-gray-800 font-medium text-sm sm:text-base">{user.mobile || 'Not provided'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="bg-white/40 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/30 shadow-lg">
            <h5 className="text-base sm:text-lg font-semibold text-gray-700 mb-3 sm:mb-4 flex items-center space-x-2">
              <span className="text-emerald-600 text-lg sm:text-xl">🛡️</span>
              <span>Account Information</span>
            </h5>
            <div className="space-y-3 sm:space-y-4">
              <div className="bg-white/30 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2">Role</label>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <p className="text-gray-800 font-medium capitalize text-sm sm:text-base">{user.role}</p>
                </div>
              </div>
              
              {user.subscriptionTier && (
                <div className="bg-white/30 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2 flex items-center gap-1">
                    <span>👑</span>
                    <span>Subscription Plan</span>
                  </label>
                  <div className={`inline-flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-1 sm:py-2 rounded-lg bg-gradient-to-r ${getSubscriptionColor(user.subscriptionTier)} text-white font-medium text-sm sm:text-base`}>
                    <span>👑</span>
                    <span>{user.subscriptionTier}</span>
                  </div>
                </div>
              )}
              
              {user.subscriptionExpiry && (
                <div className="bg-white/30 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                  <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2 flex items-center gap-1">
                    <span>📅</span>
                    <span>Expiry Date</span>
                  </label>
                  <p className="text-gray-800 font-medium text-sm sm:text-base">{new Date(user.subscriptionExpiry).toLocaleDateString()}</p>
                </div>
              )}
              
              <div className="bg-white/30 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2 flex items-center gap-1">
                  <span>🗓️</span>
                  <span>Member Since</span>
                </label>
                <p className="text-gray-800 font-medium text-sm sm:text-base">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Not available'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information - Enhanced for Mobile */}
        {isEditing && (
          <div className="bg-white/40 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/30 shadow-lg">
            <h5 className="text-base sm:text-lg font-semibold text-gray-700 mb-3 sm:mb-4 flex items-center space-x-2">
              <span className="text-purple-600 text-lg sm:text-xl">📍</span>
              <span>Additional Information</span>
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-white/30 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2 flex items-center gap-1">
                  <span>🏠</span>
                  <span>Address</span>
                </label>
                <textarea
                  name="address"
                  value={editForm.address || ''}
                  onChange={handleInputChange}
                  placeholder="Enter your address"
                  rows={3}
                  className="w-full rounded-xl px-4 py-3 border border-gray-300 bg-white text-gray-800 placeholder-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500 resize-none"
                />
              </div>
              <div className="bg-white/30 backdrop-blur-sm rounded-lg p-3 border border-white/20">
                <label className="block text-xs sm:text-sm font-medium text-gray-600 mb-1 sm:mb-2 flex items-center gap-1">
                  <span>🚨</span>
                  <span>Emergency Contact</span>
                </label>
                <input
                  type="tel"
                  name="emergencyContact"
                  value={editForm.emergencyContact || ''}
                  onChange={handleInputChange}
                  placeholder="Emergency contact number"
                  className="w-full rounded-xl px-4 py-3 border border-gray-300 bg-white text-gray-800 placeholder-gray-400 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder-gray-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Account Stats Section - New Addition */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-purple-100/50 shadow-lg">
          <h5 className="text-base sm:text-lg font-semibold text-gray-700 mb-3 sm:mb-4 flex items-center space-x-2">
            <span className="text-purple-600 text-lg sm:text-xl">📊</span>
            <span>Account Activity</span>
          </h5>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="text-center bg-white/40 backdrop-blur-sm rounded-lg p-3 border border-white/30">
              <div className="text-lg sm:text-2xl mb-1">🏥</div>
              <div className="text-xs sm:text-sm text-gray-600 mb-1">Total Visits</div>
              <div className="text-sm sm:text-lg font-bold text-purple-600">12</div>
            </div>
            <div className="text-center bg-white/40 backdrop-blur-sm rounded-lg p-3 border border-white/30">
              <div className="text-lg sm:text-2xl mb-1">📅</div>
              <div className="text-xs sm:text-sm text-gray-600 mb-1">Appointments</div>
              <div className="text-sm sm:text-lg font-bold text-blue-600">8</div>
            </div>
            <div className="text-center bg-white/40 backdrop-blur-sm rounded-lg p-3 border border-white/30">
              <div className="text-lg sm:text-2xl mb-1">⭐</div>
              <div className="text-xs sm:text-sm text-gray-600 mb-1">Reviews</div>
              <div className="text-sm sm:text-lg font-bold text-emerald-600">4</div>
            </div>
            <div className="text-center bg-white/40 backdrop-blur-sm rounded-lg p-3 border border-white/30">
              <div className="text-lg sm:text-2xl mb-1">🎯</div>
              <div className="text-xs sm:text-sm text-gray-600 mb-1">Points</div>
              <div className="text-sm sm:text-lg font-bold text-orange-600">240</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePanel;

