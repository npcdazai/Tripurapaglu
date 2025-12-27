'use client';

import { useState } from 'react';

export default function Disclaimer() {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="mb-8">
      <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-xl shadow-lg overflow-hidden">
        <div
          className="p-6 cursor-pointer flex justify-between items-start"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex-grow">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">⚠️</span>
              <h2 className="text-2xl font-bold">Educational Disclaimer</h2>
            </div>
            <p className="text-white/90">
              Click to {isExpanded ? 'collapse' : 'expand'} important information
            </p>
          </div>
          <button className="text-2xl ml-4 hover:scale-110 transition-transform">
            {isExpanded ? '−' : '+'}
          </button>
        </div>

        {isExpanded && (
          <div className="px-6 pb-6 space-y-4 text-white/95">
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <h3 className="font-bold text-lg mb-2">🎓 This is a Learning Project</h3>
              <ul className="list-disc ml-6 space-y-1 text-sm">
                <li>Created to understand web scraping limitations</li>
                <li>Demonstrates why third-party viewers are unreliable</li>
                <li>Shows platform security mechanisms in action</li>
                <li>Teaches proper API usage and ethical development</li>
              </ul>
            </div>

            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <h3 className="font-bold text-lg mb-2">🚫 What This Does NOT Do</h3>
              <ul className="list-disc ml-6 space-y-1 text-sm">
                <li>Does NOT use official Instagram APIs</li>
                <li>Does NOT log into Instagram accounts</li>
                <li>Does NOT guarantee video playback</li>
                <li>Does NOT bypass authentication intentionally</li>
                <li>Does NOT work reliably (failures are expected)</li>
              </ul>
            </div>

            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <h3 className="font-bold text-lg mb-2">⚖️ Legal Notice</h3>
              <p className="text-sm">
                <strong className="text-yellow-300">This violates Instagram's Terms of Service.</strong>
                {' '}It is provided strictly for educational purposes to demonstrate web scraping
                challenges. Media ownership belongs to original creators. Never use this in
                production or for commercial purposes.
              </p>
            </div>

            <div className="bg-green-500/20 rounded-lg p-4 border-2 border-green-300">
              <h3 className="font-bold text-lg mb-2">✅ Recommended Alternative</h3>
              <p className="text-sm">
                Instead of scraping Instagram, build your own video platform with user-uploaded
                content, host videos on your own CDN, and use legally licensed media.
              </p>
            </div>

            <div className="text-center text-sm italic pt-2 border-t border-white/20">
              By using this tool, you acknowledge this is for educational purposes only.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
