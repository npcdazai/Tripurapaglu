'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import SharedReelsFeed from '@/components/SharedReelsFeed';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { API_URL } from '@/lib/config';

export default function UserPage() {
  const params = useParams();
  const router = useRouter();
  const username = params.username;

  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Auto-login as viewer with this username
    autoLogin();
  }, [username]);

  const autoLogin = async () => {
    try {
      // Get password based on username
      let password;
      if (username === 'tripura_mandavkar') {
        password = 'tripura123';
      } else if (username === 'Pratham') {
        password = 'pratham123';
      } else {
        password = `${username.toLowerCase()}123`; // Default convention
      }

      // Try to login automatically
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        username: username,
        password: password
      });

      if (response.data.token && response.data.user) {
        // Check if user is viewer
        if (response.data.user.role !== 'viewer') {
          setError('This page is only accessible for viewer accounts');
          return;
        }

        // Store token
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        // Set token for feed
        setToken(response.data.token);
        setLoading(false);
      }
    } catch (err) {
      console.error('Auto-login failed:', err);
      setError('User not found or incorrect credentials. Please use the login page.');
      setLoading(false);
    }
  };


  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="card text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Error</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => router.push('/login')}
              className="btn-primary"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-gray-300 border-t-instagram-primary rounded-full spinner mb-4" />
          <p className="text-gray-600">Loading {username}'s feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      {/* User Banner */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-6">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl font-bold mb-1">@{username}</h1>
          <p className="text-white/90">Shared Instagram Reels Feed</p>
          <div className="mt-3 flex gap-3">
            <button
              onClick={() => router.push('/login')}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-semibold transition-colors backdrop-blur-sm"
            >
              Switch User
            </button>
          </div>
        </div>
      </div>

      <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
        <SharedReelsFeed token={token} />
      </main>

      <Footer />
    </div>
  );
}
