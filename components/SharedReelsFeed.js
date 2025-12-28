'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import VideoPlayer from './VideoPlayer';
import { API_URL } from '@/lib/config';

export default function SharedReelsFeed({ token }) {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (token) {
      fetchReels();
    }
  }, [token]);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    if (!autoRefresh || !token) return;

    const interval = setInterval(() => {
      fetchReels(true); // Silent refresh
    }, 10000);

    return () => clearInterval(interval);
  }, [autoRefresh, token]);

  const fetchReels = async (silent = false) => {
    try {
      if (!silent) setLoading(true);

      const response = await axios.get(`${API_URL}/api/shared-reels`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: 100 }
      });

      // Only show successful reels
      const successReels = response.data.reels.filter(r => r.status === 'success');
      setReels(successReels);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch reels:', err);
      if (!silent) {
        setError('Failed to load reels');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-12 h-12 border-4 border-gray-300 border-t-instagram-primary rounded-full spinner mb-4" />
        <p className="text-gray-600">Loading shared reels...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card border-red-200 bg-red-50">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-6xl mb-4">📭</p>
        <p className="text-xl font-bold text-gray-800 mb-2">No Reels Shared Yet</p>
        <p className="text-gray-600">
          Waiting for senders to share some amazing reels!
        </p>
        <div className="mt-4 p-4 bg-blue-50 rounded-lg inline-block">
          <p className="text-sm text-blue-800">
            <strong>Auto-refresh is {autoRefresh ? 'ON' : 'OFF'}</strong>
            <br />
            {autoRefresh ? 'Checking for new reels every 10 seconds...' : 'Toggle auto-refresh to check for updates'}
          </p>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            {autoRefresh ? 'Disable' : 'Enable'} Auto-Refresh
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Auto-refresh indicator */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            🎬 Shared Reels Feed
          </h2>
          <p className="text-sm text-gray-600">
            {reels.length} reel{reels.length !== 1 ? 's' : ''} available
          </p>
        </div>
        <button
          onClick={() => setAutoRefresh(!autoRefresh)}
          className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
            autoRefresh
              ? 'bg-green-100 text-green-800 hover:bg-green-200'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {autoRefresh ? '🔄 Auto-refresh ON' : '⏸️ Auto-refresh OFF'}
        </button>
      </div>

      {/* Reels List */}
      {reels.map((reel, index) => (
        <div key={reel._id} className="space-y-4">
          {/* Reel Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-instagram-tertiary via-instagram-primary to-instagram-secondary flex items-center justify-center text-white font-bold">
                {reel.sharedBy?.username?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-800">
                  Shared by {reel.sharedBy?.username}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(reel.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                ✅ Success
              </span>
              {reel.viewCount > 0 && (
                <span className="text-sm text-gray-600">
                  👁️ {reel.viewCount} views
                </span>
              )}
            </div>
          </div>

          {/* Reel Content */}
          <VideoPlayer reelData={reel.reelData} />

          {/* Separator */}
          {index < reels.length - 1 && (
            <div className="border-t border-gray-200 my-8"></div>
          )}
        </div>
      ))}

      {/* Load More / End Message */}
      <div className="text-center py-8">
        <p className="text-gray-500 text-sm">
          {autoRefresh
            ? '🔄 Auto-refreshing every 10 seconds for new reels...'
            : 'Enable auto-refresh to check for new reels'}
        </p>
      </div>
    </div>
  );
}
