'use client';

import { useRef, useEffect, useState } from 'react';

export default function AutoplayReelViewer({ reel, isVisible }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleIntersection = async (entries) => {
      const [entry] = entries;

      if (entry.isIntersecting && isVisible) {
        try {
          // Mute first to allow autoplay
          video.muted = true;
          await video.play();
          setIsPlaying(true);
          setVideoError(false);
        } catch (error) {
          console.error('Autoplay failed:', error);
          setVideoError(true);
        }
      } else {
        video.pause();
        setIsPlaying(false);
      }
    };

    const observer = new IntersectionObserver(handleIntersection, {
      threshold: 0.5 // Play when 50% visible
    });

    observer.observe(video);

    return () => {
      observer.disconnect();
    };
  }, [isVisible]);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
    }
  };

  const handleVideoError = (e) => {
    console.error('Video playback error:', e);
    setVideoError(true);
  };

  // Get video URL from reel data
  const getVideoUrl = () => {
    if (reel.reelData?.videoUrl) {
      return reel.reelData.videoUrl;
    }
    return null;
  };

  const videoUrl = getVideoUrl();

  // If no video URL, show Instagram embed as fallback
  if (!videoUrl && reel.reelData?.sourceUrl) {
    return (
      <div className="bg-gray-900 rounded-lg overflow-hidden relative" style={{ minHeight: '500px' }}>
        <div className="flex items-center justify-center h-full p-8 text-center">
          <div>
            <p className="text-white mb-4">📱 Instagram Embed</p>
            <a
              href={reel.reelData.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              Watch on Instagram →
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (!videoUrl) {
    return (
      <div className="bg-gray-100 rounded-lg p-8 text-center">
        <p className="text-gray-600">Video not available</p>
      </div>
    );
  }

  return (
    <div className="relative bg-black rounded-lg overflow-hidden" style={{ maxWidth: '500px', margin: '0 auto' }}>
      {/* Video Player */}
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-auto"
        loop
        playsInline
        muted
        onError={handleVideoError}
        style={{ maxHeight: '80vh', objectFit: 'contain' }}
      />

      {/* Video Error Overlay */}
      {videoError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80">
          <div className="text-center text-white p-6">
            <p className="text-xl mb-2">⚠️ Video Unavailable</p>
            <p className="text-sm mb-4">Instagram video URLs expire quickly</p>
            {reel.reelData?.sourceUrl && (
              <a
                href={reel.reelData.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-white text-black px-4 py-2 rounded-lg font-semibold hover:bg-gray-200"
              >
                Watch on Instagram →
              </a>
            )}
          </div>
        </div>
      )}

      {/* Controls Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        <div className="flex items-center justify-between">
          <div className="text-white">
            <p className="font-semibold">{reel.reelData?.title || 'Instagram Reel'}</p>
            {reel.reelData?.author && (
              <p className="text-sm text-gray-300">@{reel.reelData.author}</p>
            )}
          </div>

          <button
            onClick={toggleMute}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-full transition-all"
          >
            {videoRef.current?.muted ? '🔇 Unmute' : '🔊 Mute'}
          </button>
        </div>
      </div>

      {/* Playing Indicator */}
      {isPlaying && (
        <div className="absolute top-4 right-4">
          <div className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            PLAYING
          </div>
        </div>
      )}
    </div>
  );
}
