'use client';

import { useState } from 'react';
import axios from 'axios';
import VideoPlayer from './VideoPlayer';
import ErrorDisplay from './ErrorDisplay';
import LoadingSpinner from './LoadingSpinner';
import { API_URL } from '@/lib/config';

export default function ReelViewer() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [reelData, setReelData] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset state
    setError(null);
    setReelData(null);

    // Validate URL
    if (!url.trim()) {
      setError({
        message: 'Please enter a URL',
        type: 'validation'
      });
      return;
    }

    const reelRegex = /^https?:\/\/(www\.)?instagram\.com\/(reel|reels|p)\/([a-zA-Z0-9_-]+)/;
    if (!reelRegex.test(url)) {
      setError({
        message: 'Invalid Instagram Reel URL format',
        type: 'validation',
        example: 'https://www.instagram.com/reel/ABC123XYZ/'
      });
      return;
    }

    setLoading(true);

    try {
      console.log('Fetching reel from:', `${API_URL}/api/reel`);

      const response = await axios.post(
        `${API_URL}/api/reel`,
        { url: url.trim() },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 20000 // 20 second timeout
        }
      );

      if (response.data.success && response.data.data) {
        setReelData(response.data.data);
        setError(null);
      } else {
        setError({
          message: 'No data received from server',
          type: 'no_data'
        });
      }
    } catch (err) {
      console.error('Error fetching reel:', err);

      if (err.code === 'ECONNABORTED') {
        setError({
          message: 'Request timeout - Instagram took too long to respond',
          type: 'timeout',
          educationalNote: 'Instagram may be blocking or rate-limiting requests'
        });
      } else if (err.code === 'ERR_NETWORK' || err.message.includes('Network Error')) {
        setError({
          message: 'Cannot connect to backend server',
          type: 'network',
          educationalNote: 'Make sure the backend server is running on port 5000'
        });
      } else if (err.response) {
        // Server responded with error
        setError({
          message: err.response.data.error || err.response.data.message || 'Server error',
          type: 'server',
          status: err.response.status,
          educationalNote: err.response.data.educationalNote
        });
      } else {
        setError({
          message: err.message || 'An unexpected error occurred',
          type: 'unknown'
        });
      }

      setReelData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setUrl('');
    setReelData(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <div className="card">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          🔗 Enter Instagram Reel URL
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              Example: https://www.instagram.com/reel/C1a2b3c4d5e/
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="btn-primary flex-grow"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <LoadingSpinner size="small" />
                  Fetching...
                </span>
              ) : (
                '🚀 Fetch Reel'
              )}
            </button>

            {(url || reelData || error) && (
              <button
                type="button"
                onClick={handleClear}
                disabled={loading}
                className="px-6 py-3 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
              >
                Clear
              </button>
            )}
          </div>
        </form>

        {/* Expected Behavior Notice */}
        <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded-r text-sm text-blue-800">
          <p className="font-semibold mb-1">💡 Expected Behavior:</p>
          <p>
            Most attempts will fail due to Instagram's security measures. This is normal
            and demonstrates why scraping is unreliable.
          </p>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="card text-center py-12">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-gray-600">Attempting to fetch reel data...</p>
          <p className="text-sm text-gray-500 mt-2">
            This may take a few seconds or may fail entirely
          </p>
        </div>
      )}

      {/* Error Display */}
      {error && !loading && <ErrorDisplay error={error} />}

      {/* Video Player */}
      {reelData && !loading && <VideoPlayer reelData={reelData} />}

      {/* Common Failure Scenarios */}
      {!loading && !reelData && !error && (
        <div className="card bg-gray-50">
          <h3 className="text-xl font-bold mb-4 text-gray-800">
            🎯 Common Failure Scenarios (Expected)
          </h3>
          <div className="space-y-3">
            <FailureScenario
              icon="🔒"
              title="Video Not Loading"
              reason="Reel requires login to view (private or age-restricted)"
            />
            <FailureScenario
              icon="🚫"
              title="403 / 429 Error"
              reason="Instagram blocked the request (IP ban or rate limiting)"
            />
            <FailureScenario
              icon="⏱️"
              title="Works Once Only"
              reason="Media URLs expire quickly (often within minutes)"
            />
            <FailureScenario
              icon="🔐"
              title="Private Reel"
              reason="Content requires authentication to access"
            />
            <FailureScenario
              icon="💥"
              title="Sudden Breakage"
              reason="Instagram changed HTML structure, breaking the parser"
            />
          </div>
          <p className="text-sm text-gray-600 mt-4 italic">
            These failures demonstrate why production apps must never rely on web scraping.
          </p>
        </div>
      )}
    </div>
  );
}

function FailureScenario({ icon, title, reason }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200">
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="font-semibold text-gray-800">{title}</p>
        <p className="text-sm text-gray-600">{reason}</p>
      </div>
    </div>
  );
}
