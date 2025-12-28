'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { API_URL } from '@/lib/config';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function BulkImportPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [reelInput, setReelInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [token, setToken] = useState('');

  // Check if user is logged in
  useState(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setToken(storedToken);
      }
    }
  }, []);

  const extractShortcodes = (input) => {
    // Extract shortcodes from various formats:
    // - Full URLs: https://www.instagram.com/reel/ABC123/
    // - Just shortcodes: ABC123, DEF456
    // - Mixed formats
    const lines = input.split(/[\n,;]/);
    const shortcodes = [];

    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) return;

      // Check if it's a URL
      const urlMatch = trimmed.match(/\/(reel|reels|p)\/([a-zA-Z0-9_-]+)/);
      if (urlMatch) {
        shortcodes.push(urlMatch[2]);
      } else if (/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
        // Just a shortcode
        shortcodes.push(trimmed);
      }
    });

    return [...new Set(shortcodes)]; // Remove duplicates
  };

  const handleBulkImport = async () => {
    if (!token) {
      alert('Please login first');
      router.push('/login');
      return;
    }

    const shortcodes = extractShortcodes(reelInput);

    if (shortcodes.length === 0) {
      alert('No valid reels found. Please paste URLs or shortcodes.');
      return;
    }

    if (shortcodes.length > 50) {
      alert('Maximum 50 reels at once. Please reduce the number.');
      return;
    }

    setLoading(true);
    setResults(null);

    try {
      const response = await axios.post(
        `${API_URL}/api/bulk-import`,
        { shortcodes },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setResults(response.data);
    } catch (error) {
      console.error('Bulk import error:', error);
      alert(error.response?.data?.error || 'Failed to import reels');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-purple-600 hover:text-purple-700 font-semibold"
          >
            ← Back
          </button>
        </div>

        <div className="card mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            📦 Bulk Reel Import
          </h1>
          <p className="text-gray-600">
            Import multiple Instagram reels at once by pasting URLs or shortcodes
          </p>
        </div>

        {/* Instructions */}
        <div className="card bg-blue-50 border-blue-200 mb-6">
          <h2 className="text-xl font-bold text-blue-800 mb-3">
            📋 How to Get Your Reel Shortcodes
          </h2>
          <div className="space-y-2 text-blue-700 text-sm">
            <p><strong>Option 1: Copy URLs from Instagram</strong></p>
            <ol className="list-decimal ml-6 space-y-1">
              <li>Go to your Instagram profile</li>
              <li>Click on each reel and copy the URL from browser</li>
              <li>Paste all URLs below (one per line or comma-separated)</li>
            </ol>

            <p className="mt-3"><strong>Option 2: Use Shortcodes</strong></p>
            <ol className="list-decimal ml-6 space-y-1">
              <li>From reel URL: <code className="bg-white px-1">instagram.com/reel/<strong>ABC123</strong>/</code></li>
              <li>Paste just the shortcode part: <code className="bg-white px-1">ABC123</code></li>
            </ol>

            <div className="mt-3 p-3 bg-white rounded border border-blue-300">
              <p className="font-semibold mb-1">Example formats:</p>
              <code className="text-xs">
                https://www.instagram.com/reel/DPq_tjEgUMf/<br/>
                https://www.instagram.com/reel/ABC123XYZ/<br/>
                DEF456GHI<br/>
                JKL789MNO
              </code>
            </div>
          </div>
        </div>

        {/* Import Form */}
        <div className="card mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Instagram Username (Optional - for reference)
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g., tripura_mandavkar"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Paste Reel URLs or Shortcodes (Max 50)
              </label>
              <textarea
                value={reelInput}
                onChange={(e) => setReelInput(e.target.value)}
                placeholder="Paste URLs or shortcodes here (one per line or comma-separated)&#10;&#10;Examples:&#10;https://www.instagram.com/reel/ABC123/&#10;https://www.instagram.com/reel/DEF456/&#10;GHI789"
                rows={10}
                className="input-field font-mono text-sm"
              />
              <p className="text-sm text-gray-500 mt-1">
                Found: {extractShortcodes(reelInput).length} reels
              </p>
            </div>

            <button
              onClick={handleBulkImport}
              disabled={loading || !reelInput.trim()}
              className="btn-primary w-full py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full spinner" />
                  Importing Reels...
                </span>
              ) : (
                '📥 Import All Reels'
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        {results && (
          <div className="card">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Import Results
            </h2>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <p className="text-3xl font-bold text-green-600">{results.success}</p>
                <p className="text-sm text-green-700">Queued</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <p className="text-3xl font-bold text-red-600">{results.failed}</p>
                <p className="text-sm text-red-700">Failed</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <p className="text-3xl font-bold text-blue-600">{results.total}</p>
                <p className="text-sm text-blue-700">Total</p>
              </div>
            </div>

            {results.errors && results.errors.length > 0 && (
              <div className="bg-red-50 p-4 rounded border border-red-200 mb-4">
                <p className="font-semibold text-red-800 mb-2">Errors:</p>
                <ul className="text-sm text-red-700 space-y-1">
                  {results.errors.map((err, i) => (
                    <li key={i}>• {err}</li>
                  ))}
                </ul>
              </div>
            )}

            <p className="text-gray-600 mb-4">
              Reels are being fetched in the background. They will appear in your feed shortly.
            </p>

            <button
              onClick={() => router.push('/viewer')}
              className="btn-primary"
            >
              View My Reels →
            </button>
          </div>
        )}

        {/* Warning */}
        <div className="card bg-yellow-50 border-yellow-200 mt-6">
          <h3 className="font-bold text-yellow-800 mb-2">⚠️ Important Notes</h3>
          <ul className="text-sm text-yellow-700 space-y-1 list-disc ml-5">
            <li>Only import reels you have permission to view</li>
            <li>Private account reels may not work</li>
            <li>Some reels may fail due to Instagram's restrictions</li>
          </ul>
        </div>
      </main>

      <Footer />
    </div>
  );
}
