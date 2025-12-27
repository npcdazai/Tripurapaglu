'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ReelViewer from '@/components/ReelViewer';
import Disclaimer from '@/components/Disclaimer';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col">
      {/* <Header /> */}

      {/* Multi-User Mode Banner */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-2">
            <strong>🆕 New Feature:</strong> Multi-User System Available!
          </p>
          <button
            onClick={() => router.push('/login')}
            className="bg-white text-purple-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-all"
          >
            Switch to Multi-User Mode →
          </button>
          <p className="text-sm mt-2 text-white/90">
            Sender can share reels • Viewer can see all shared reels
          </p>
        </div>
      </div>

      <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
       

        {/* Main Reel Viewer Component */}
        <ReelViewer />

        {/* Educational Information Section */}
        {/* <div className="mt-12 space-y-6">
          <div className="card">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              📚 Why This Project Exists
            </h2>
            <div className="space-y-3 text-gray-600">
              <p>
                This project demonstrates the <strong>limitations and challenges</strong> of web scraping:
              </p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Instagram actively blocks scraping attempts</li>
                <li>Media URLs expire quickly (often within minutes)</li>
                <li>Private content requires authentication</li>
                <li>HTML structure changes frequently, breaking scrapers</li>
                <li>IP addresses can be banned for excessive requests</li>
              </ul>
            </div>
          </div>

          <div className="card bg-red-50 border-red-200">
            <h2 className="text-2xl font-bold mb-4 text-red-800">
              ⚠️ Legal & Ethical Considerations
            </h2>
            <div className="space-y-3 text-red-700">
              <ul className="list-disc ml-6 space-y-2">
                <li>This violates Instagram's Terms of Service</li>
                <li>Media ownership belongs to original creators</li>
                <li>Scraping can lead to IP/account bans</li>
                <li><strong>Never use this in production</strong></li>
                <li>For real apps, use official APIs or host your own content</li>
              </ul>
            </div>
          </div>

          <div className="card bg-green-50 border-green-200">
            <h2 className="text-2xl font-bold mb-4 text-green-800">
              ✅ Legal Alternative
            </h2>
            <div className="space-y-3 text-green-700">
              <p className="font-semibold">Build Your Own Platform Instead:</p>
              <ul className="list-disc ml-6 space-y-2">
                <li>Create a custom short-form video platform</li>
                <li>Allow users to upload their own content</li>
                <li>Use legally licensed media</li>
                <li>Host videos on your own CDN (AWS S3, Cloudflare R2)</li>
                <li>Implement swipe navigation like TikTok/Reels</li>
                <li>Control your own infrastructure and data</li>
              </ul>
            </div>
          </div>

          <div className="card">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">
              🔧 Technical Learning Points
            </h2>
            <div className="space-y-3 text-gray-600">
              <ul className="list-disc ml-6 space-y-2">
                <li><strong>HTTP Headers:</strong> Browser emulation with User-Agent strings</li>
                <li><strong>HTML Parsing:</strong> Using Cheerio to extract embedded JSON</li>
                <li><strong>API Design:</strong> RESTful endpoints with proper error handling</li>
                <li><strong>Error Handling:</strong> Managing 403, 404, and 429 status codes</li>
                <li><strong>Frontend/Backend:</strong> React + Express architecture</li>
                <li><strong>Rate Limiting:</strong> Understanding platform protections</li>
              </ul>
            </div>
          </div>
        </div> */}
      </main>

      <Footer />
    </div>
  );
}
