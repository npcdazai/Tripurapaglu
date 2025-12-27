'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function SenderPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [myReels, setMyReels] = useState([]);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'sender') {
      router.push('/login');
      return;
    }

    setUser(parsedUser);
    fetchMyReels(token);
    fetchStats(token);
  }, []);

  const fetchMyReels = async (token) => {
    try {
      const response = await axios.get(`${API_URL}/api/shared-reels/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyReels(response.data.reels || []);
    } catch (err) {
      console.error('Failed to fetch reels:', err);
    }
  };

  const fetchStats = async (token) => {
    try {
      const response = await axios.get(`${API_URL}/api/shared-reels/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data.stats);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleShare = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_URL}/api/shared-reels`,
        { url },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSuccess(response.data.message);
      setUrl('');

      // Refresh lists
      setTimeout(() => {
        fetchMyReels(token);
        fetchStats(token);
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to share reel');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this shared reel?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/shared-reels/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMyReels(myReels.filter(r => r._id !== id));
      fetchStats(token);
    } catch (err) {
      alert('Failed to delete reel');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                📤 Sender Dashboard
              </h1>
              <p className="text-sm text-gray-600">
                Welcome, <strong>{user.username}</strong>
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard
              label="Total Shared"
              value={stats.totalShared}
              icon="📊"
              color="blue"
            />
            <StatCard
              label="Successful"
              value={stats.successfulShares}
              icon="✅"
              color="green"
            />
            <StatCard
              label="Pending"
              value={stats.pendingShares}
              icon="⏳"
              color="yellow"
            />
            <StatCard
              label="Total Views"
              value={stats.totalViews}
              icon="👁️"
              color="purple"
            />
          </div>
        )}

        {/* Share Reel Form */}
        <div className="card mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-800">
            📎 Share New Reel
          </h2>

          <form onSubmit={handleShare} className="space-y-4">
            <div>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.instagram.com/reel/ABC123XYZ/"
                className="input-field"
                disabled={loading}
              />
              <p className="text-sm text-gray-500 mt-2">
                Paste a public Instagram Reel URL
              </p>
            </div>

            {error && (
              <div className="error-box">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {success && (
              <div className="success-box">
                <p className="text-sm text-green-700">{success}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !url}
              className="btn-primary"
            >
              {loading ? 'Sharing...' : '🚀 Share Reel'}
            </button>
          </form>
        </div>

        {/* My Shared Reels */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              📋 My Shared Reels
            </h2>
            <button
              onClick={() => fetchMyReels(localStorage.getItem('token'))}
              className="text-sm text-instagram-primary hover:underline"
            >
              🔄 Refresh
            </button>
          </div>

          {myReels.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-4xl mb-3">📭</p>
              <p>No reels shared yet</p>
              <p className="text-sm mt-2">Share your first reel above!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myReels.map((reel) => (
                <ReelCard key={reel._id} reel={reel} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-800 border-blue-200',
    green: 'bg-green-50 text-green-800 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    purple: 'bg-purple-50 text-purple-800 border-purple-200'
  };

  return (
    <div className={`card border ${colors[color]}`}>
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm opacity-80">{label}</div>
    </div>
  );
}

function ReelCard({ reel, onDelete }) {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    success: 'bg-green-100 text-green-800',
    failed: 'bg-red-100 text-red-800'
  };

  const statusIcons = {
    pending: '⏳',
    success: '✅',
    failed: '❌'
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex justify-between items-start">
        <div className="flex-grow">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[reel.status]}`}>
              {statusIcons[reel.status]} {reel.status.toUpperCase()}
            </span>
            {reel.viewCount > 0 && (
              <span className="text-xs text-gray-600">
                👁️ {reel.viewCount} views
              </span>
            )}
          </div>

          <p className="text-sm text-gray-600 mb-1">
            <strong>Shortcode:</strong> {reel.shortcode}
          </p>

          <p className="text-xs text-gray-500 break-all">
            {reel.url}
          </p>

          {reel.reelData?.caption && (
            <p className="text-sm text-gray-700 mt-2 line-clamp-2">
              {reel.reelData.caption}
            </p>
          )}

          {reel.error && (
            <p className="text-xs text-red-600 mt-2">
              Error: {reel.error.message}
            </p>
          )}

          <p className="text-xs text-gray-400 mt-2">
            Shared {new Date(reel.createdAt).toLocaleString()}
          </p>
        </div>

        <button
          onClick={() => onDelete(reel._id)}
          className="ml-4 text-red-500 hover:text-red-700"
          title="Delete"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
