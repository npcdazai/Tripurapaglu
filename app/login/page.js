'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'sender'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload = isLogin
        ? { username: formData.username, password: formData.password }
        : formData;

      const response = await axios.post(`${API_URL}${endpoint}`, payload);

      if (response.data.success) {
        // Store token and user data
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        // Redirect based on role
        if (response.data.user.role === 'sender') {
          router.push('/sender');
        } else {
          router.push('/viewer');
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError(err.response?.data?.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen instagram-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            📱 Instagram Reel Viewer
          </h1>
          <p className="text-white/90">Educational Project - Multi-User System</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Toggle */}
          <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 rounded-md font-semibold transition-all ${
                isLogin
                  ? 'bg-white shadow-md text-instagram-primary'
                  : 'text-gray-600'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 rounded-md font-semibold transition-all ${
                !isLogin
                  ? 'bg-white shadow-md text-instagram-primary'
                  : 'text-gray-600'
              }`}
            >
              Register
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                placeholder="Enter username"
                className="input-field"
                required
                minLength={3}
                maxLength={20}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="Enter password"
                className="input-field"
                required
                minLength={6}
              />
            </div>

            {/* Role (only for registration) */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  User Role
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'sender' })}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.role === 'sender'
                        ? 'border-instagram-primary bg-instagram-primary/10'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-2xl mb-1">📤</div>
                    <div className="font-semibold text-gray-800">Sender</div>
                    <div className="text-xs text-gray-600">Share reels</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'viewer' })}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.role === 'viewer'
                        ? 'border-instagram-primary bg-instagram-primary/10'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="text-2xl mb-1">👀</div>
                    <div className="font-semibold text-gray-800">Viewer</div>
                    <div className="text-xs text-gray-600">View reels</div>
                  </button>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="error-box">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading
                ? isLogin
                  ? 'Logging in...'
                  : 'Registering...'
                : isLogin
                ? 'Login'
                : 'Register'}
            </button>
          </form>

          {/* Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Sender:</strong> Can share Instagram Reels via links
              <br />
              <strong>Viewer:</strong> Can view all shared reels
            </p>
          </div>
        </div>

        {/* Educational Note */}
        <div className="mt-6 text-center text-white/80 text-sm">
          <p>⚠️ For educational purposes only</p>
          <p className="mt-2">
            <button
              onClick={() => router.push('/')}
              className="underline hover:text-white"
            >
              ← Back to Single User Mode
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
