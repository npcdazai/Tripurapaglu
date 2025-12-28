'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '@/lib/config';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function SetupPage() {
  const [healthStatus, setHealthStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/health`);
      setHealthStatus(response.data);
    } catch (error) {
      setHealthStatus({
        status: 'error',
        message: error.response?.data?.message || error.message,
        details: error.response?.data?.details
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
        <div className="card mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            ⚙️ System Setup & Health Check
          </h1>
          <p className="text-gray-600">
            Verify that all environment variables and services are configured correctly
          </p>
        </div>

        {loading ? (
          <div className="card text-center py-12">
            <div className="inline-block w-12 h-12 border-4 border-gray-300 border-t-purple-600 rounded-full spinner mb-4" />
            <p className="text-gray-600">Checking system health...</p>
          </div>
        ) : (
          <>
            {/* Health Status */}
            <div className={`card mb-6 ${
              healthStatus?.status === 'ok'
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-start gap-4">
                <div className="text-4xl">
                  {healthStatus?.status === 'ok' ? '✅' : '❌'}
                </div>
                <div className="flex-grow">
                  <h2 className={`text-2xl font-bold mb-2 ${
                    healthStatus?.status === 'ok' ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {healthStatus?.status === 'ok' ? 'All Systems Operational' : 'Configuration Error'}
                  </h2>
                  <p className={healthStatus?.status === 'ok' ? 'text-green-700' : 'text-red-700'}>
                    {healthStatus?.message}
                  </p>
                  {healthStatus?.details && (
                    <p className="text-sm mt-2 text-red-600">{healthStatus?.details}</p>
                  )}
                  {healthStatus?.timestamp && (
                    <p className="text-sm text-gray-500 mt-2">
                      Last checked: {new Date(healthStatus.timestamp).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Configuration Checklist */}
            <div className="card mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                📋 Configuration Checklist
              </h2>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                  <span className={healthStatus?.mongodb === 'connected' ? 'text-2xl' : 'text-2xl opacity-30'}>
                    {healthStatus?.mongodb === 'connected' ? '✅' : '⬜'}
                  </span>
                  <div>
                    <p className="font-semibold">MongoDB Connection</p>
                    <p className="text-sm text-gray-600">
                      Status: {healthStatus?.mongodb || 'Not connected'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                  <span className="text-2xl opacity-30">⬜</span>
                  <div>
                    <p className="font-semibold">JWT Secret</p>
                    <p className="text-sm text-gray-600">
                      Required for authentication
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Setup Instructions */}
            {healthStatus?.status !== 'ok' && (
              <div className="card bg-blue-50 border-blue-200">
                <h2 className="text-xl font-bold text-blue-800 mb-4">
                  🛠️ Setup Instructions
                </h2>

                <div className="space-y-4 text-blue-700">
                  <div>
                    <h3 className="font-semibold mb-2">For Vercel Deployment:</h3>
                    <ol className="list-decimal ml-6 space-y-2 text-sm">
                      <li>Go to your Vercel project dashboard</li>
                      <li>Navigate to: <strong>Settings → Environment Variables</strong></li>
                      <li>Add the following variables:</li>
                    </ol>

                    <div className="mt-3 p-4 bg-white rounded border border-blue-300 font-mono text-xs">
                      <div className="mb-3">
                        <strong>MONGODB_URI</strong><br/>
                        <code className="text-gray-600">
                          mongodb+srv://tripura_mandavkar:tripuraholic@cluster0.1u52nd6.mongodb.net/instagram-reel-viewer?retryWrites=true&w=majority
                        </code>
                      </div>

                      <div className="mb-3">
                        <strong>JWT_SECRET</strong><br/>
                        <code className="text-gray-600">
                          dev-secret-key-12345-change-in-production
                        </code>
                      </div>
                    </div>

                    <ol start="4" className="list-decimal ml-6 space-y-2 text-sm mt-3">
                      <li>Click "Save"</li>
                      <li>Redeploy your application</li>
                      <li>Come back to this page and click "Recheck"</li>
                    </ol>
                  </div>

                  <div className="mt-4">
                    <h3 className="font-semibold mb-2">For Local Development:</h3>
                    <ol className="list-decimal ml-6 space-y-2 text-sm">
                      <li>Create a <code className="bg-white px-1">.env.local</code> file in the project root</li>
                      <li>Add the environment variables shown above</li>
                      <li>Restart your development server</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}

            {/* Recheck Button */}
            <div className="card text-center">
              <button
                onClick={checkHealth}
                className="btn-primary"
              >
                🔄 Recheck System Health
              </button>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
