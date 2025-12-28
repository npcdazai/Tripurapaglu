'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { API_URL } from '@/lib/config';

export default function ViewerPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [reels, setReels] = useState([]);
  const [filteredReels, setFilteredReels] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, success, pending, failed
  const [selectedReel, setSelectedReel] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'viewer') {
      router.push('/login');
      return;
    }

    setUser(parsedUser);
    fetchReels(token);
    fetchStats(token);
  }, []);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    if (!autoRefresh || !user) return;

    const interval = setInterval(() => {
      const token = localStorage.getItem('token');
      fetchReels(token, true); // Silent refresh
    }, 10000);

    return () => clearInterval(interval);
  }, [autoRefresh, user]);

  // Apply filter
  useEffect(() => {
    if (filter === 'all') {
      setFilteredReels(reels);
    } else {
      setFilteredReels(reels.filter(r => r.status === filter));
    }
  }, [filter, reels]);

  const fetchReels = async (token, silent = false) => {
    try {
      if (!silent) setLoading(true);

      const response = await axios.get(`${API_URL}/api/shared-reels`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: 100 }
      });

      setReels(response.data.reels || []);
    } catch (err) {
      console.error('Failed to fetch reels:', err);
    } finally {
      if (!silent) setLoading(false);
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

  const handleViewReel = async (reel) => {
    setSelectedReel(reel);

    // Increment view count
    try {
      const token = localStorage.getItem('token');
      await axios.get(`${API_URL}/api/shared-reels/${reel._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Failed to update view count:', err);
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
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                👀 Viewer Dashboard
              </h1>
              <p className="text-sm text-gray-600">
                Welcome, <strong>{user.username}</strong>
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm ${
                  autoRefresh
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {autoRefresh ? '🔄 Auto-refresh ON' : '🔄 Auto-refresh OFF'}
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <StatCard
              label="Available Reels"
              value={stats.totalReelsAvailable}
              icon="🎬"
              color="blue"
            />
            <StatCard
              label="Total Senders"
              value={stats.totalSenders}
              icon="📤"
              color="purple"
            />
            <StatCard
              label="Recent (24h)"
              value={stats.recentReels}
              icon="🆕"
              color="green"
            />
          </div>
        )}

        {/* Filters */}
        <div className="card mb-6">
          <div className="flex flex-wrap gap-2">
            <FilterButton
              active={filter === 'all'}
              onClick={() => setFilter('all')}
              label="All"
              count={reels.length}
            />
            <FilterButton
              active={filter === 'success'}
              onClick={() => setFilter('success')}
              label="Success"
              count={reels.filter(r => r.status === 'success').length}
              color="green"
            />
            <FilterButton
              active={filter === 'pending'}
              onClick={() => setFilter('pending')}
              label="Pending"
              count={reels.filter(r => r.status === 'pending').length}
              color="yellow"
            />
            <FilterButton
              active={filter === 'failed'}
              onClick={() => setFilter('failed')}
              label="Failed"
              count={reels.filter(r => r.status === 'failed').length}
              color="red"
            />
          </div>
        </div>

        {/* Reels Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-gray-300 border-t-instagram-primary rounded-full spinner" />
            <p className="text-gray-600 mt-4">Loading reels...</p>
          </div>
        ) : filteredReels.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-gray-600">No reels available</p>
            <p className="text-sm text-gray-500 mt-2">
              Wait for senders to share reels
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReels.map((reel) => (
              <ReelCard
                key={reel._id}
                reel={reel}
                onView={() => handleViewReel(reel)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modal for viewing reel */}
      {selectedReel && (
        <ReelModal reel={selectedReel} onClose={() => setSelectedReel(null)} />
      )}
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-800 border-blue-200',
    green: 'bg-green-50 text-green-800 border-green-200',
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

function FilterButton({ active, onClick, label, count, color = 'gray' }) {
  const colors = {
    gray: active ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
    green: active ? 'bg-green-600 text-white' : 'bg-green-100 text-green-700 hover:bg-green-200',
    yellow: active ? 'bg-yellow-600 text-white' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
    red: active ? 'bg-red-600 text-white' : 'bg-red-100 text-red-700 hover:bg-red-200'
  };

  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-semibold transition-all ${colors[color]}`}
    >
      {label} ({count})
    </button>
  );
}

function ReelCard({ reel, onView }) {
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
    <div
      onClick={reel.status === 'success' ? onView : undefined}
      className={`card ${
        reel.status === 'success' ? 'cursor-pointer hover:shadow-lg transition-shadow' : 'opacity-75'
      }`}
    >
      {/* Thumbnail */}
      {reel.reelData?.thumbnail ? (
        <div className="relative w-full h-48 bg-gray-200 rounded-lg overflow-hidden mb-3">
          <img
            src={reel.reelData.thumbnail}
            alt="Reel thumbnail"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className="hidden absolute inset-0 bg-gray-300 items-center justify-center">
            <span className="text-4xl">🎬</span>
          </div>
          {reel.status === 'success' && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <div className="bg-white/90 rounded-full p-4">
                <svg className="w-8 h-8 text-instagram-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center mb-3">
          <span className="text-6xl">{statusIcons[reel.status]}</span>
        </div>
      )}

      {/* Status Badge */}
      <div className="flex justify-between items-start mb-2">
        <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColors[reel.status]}`}>
          {statusIcons[reel.status]} {reel.status.toUpperCase()}
        </span>
        {reel.viewCount > 0 && (
          <span className="text-xs text-gray-600">
            👁️ {reel.viewCount}
          </span>
        )}
      </div>

      {/* Caption */}
      {reel.reelData?.caption && (
        <p className="text-sm text-gray-700 mb-2 line-clamp-2">
          {reel.reelData.caption}
        </p>
      )}

      {/* Metadata */}
      {reel.reelData?.owner && (
        <p className="text-xs text-gray-600 mb-1">
          By @{reel.reelData.owner.username}
        </p>
      )}

      {reel.reelData?.likes && (
        <div className="flex gap-3 text-xs text-gray-600">
          <span>❤️ {formatNumber(reel.reelData.likes)}</span>
          {reel.reelData.views > 0 && (
            <span>▶️ {formatNumber(reel.reelData.views)}</span>
          )}
        </div>
      )}

      {/* Shared by */}
      <p className="text-xs text-gray-500 mt-2 pt-2 border-t">
        Shared by <strong>{reel.sharedBy?.username}</strong>
        <br />
        {new Date(reel.createdAt).toLocaleString()}
      </p>

      {/* Error Message */}
      {reel.error && (
        <p className="text-xs text-red-600 mt-2 p-2 bg-red-50 rounded">
          {reel.error.message}
        </p>
      )}
    </div>
  );
}

function ReelModal({ reel, onClose }) {
  const [videoError, setVideoError] = useState(false);

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center z-10">
          <h3 className="font-bold text-lg">Reel Details</h3>
          <button
            onClick={onClose}
            className="text-2xl hover:text-red-600 transition-colors"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {/* Video Player */}
          {reel.reelData?.videoUrl && !videoError ? (
            <div className="bg-black rounded-lg overflow-hidden mb-4">
              <video
                controls
                className="w-full max-h-[500px] object-contain"
                poster={reel.reelData.thumbnail}
                onError={() => setVideoError(true)}
              >
                <source src={reel.reelData.videoUrl} type="video/mp4" />
              </video>
            </div>
          ) : reel.reelData?.thumbnail ? (
            <img
              src={reel.reelData.thumbnail}
              alt="Reel"
              className="w-full rounded-lg mb-4"
            />
          ) : null}

          {videoError && (
            <div className="error-box mb-4">
              <p className="text-sm text-red-700">
                Video playback failed. The media URL may have expired.
              </p>
            </div>
          )}

          {/* Caption */}
          {reel.reelData?.caption && (
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Caption:</h4>
              <p className="text-gray-700 whitespace-pre-wrap">{reel.reelData.caption}</p>
            </div>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-3">
            {reel.reelData?.owner && (
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-xs text-gray-600">Owner</p>
                <p className="font-semibold">@{reel.reelData.owner.username}</p>
              </div>
            )}
            {reel.reelData?.likes > 0 && (
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-xs text-gray-600">Likes</p>
                <p className="font-semibold">{formatNumber(reel.reelData.likes)}</p>
              </div>
            )}
            {reel.reelData?.views > 0 && (
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-xs text-gray-600">Views</p>
                <p className="font-semibold">{formatNumber(reel.reelData.views)}</p>
              </div>
            )}
            <div className="p-3 bg-gray-50 rounded">
              <p className="text-xs text-gray-600">Shared by</p>
              <p className="font-semibold">{reel.sharedBy?.username}</p>
            </div>
          </div>

          {/* Original URL */}
          <div className="mt-4 p-3 bg-blue-50 rounded text-xs">
            <p className="text-blue-800 break-all">
              <strong>Original URL:</strong> {reel.url}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatNumber(num) {
  if (!num) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}
