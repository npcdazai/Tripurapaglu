'use client';

import { useState, useRef, useEffect } from 'react';

export default function VideoPlayer({ reelData }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef(null);

  // Load Instagram embed script
  useEffect(() => {
    if (reelData?.type === 'embed' && window.instgrm) {
      window.instgrm.Embeds.process();
    }
  }, [reelData]);

  // Safety check
  if (!reelData) {
    return (
      <div className="card">
        <p className="text-gray-600">No reel data available</p>
      </div>
    );
  }

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVideoError = (e) => {
    console.error('Video playback error:', e);
    setVideoError(true);
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="card space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">
          ✅ Reel Data Retrieved
        </h2>
        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
          Success
        </span>
      </div>

      {/* Warning Banner */}
      <div className="warning-box">
        <div className="flex items-start gap-2">
          <span className="text-xl">⚠️</span>
          <div>
            <p className="font-semibold text-yellow-800 mb-1">Video May Not Play</p>
            <p className="text-sm text-yellow-700">
              {reelData?.warning || 'Media URLs often expire within minutes or require authentication.'}
            </p>
          </div>
        </div>
      </div>

      {/* oEmbed Embed Display with Instagram Widget */}
      {reelData.type === 'embed' && reelData.sourceUrl && (
        <div className="space-y-4">
          {/* Instagram Embedded Player */}
          <div className="bg-white rounded-lg overflow-hidden">
            <blockquote
              className="instagram-media"
              data-instgrm-permalink={reelData.sourceUrl}
              data-instgrm-version="14"
              style={{
                background: '#FFF',
                border: '0',
                borderRadius: '3px',
                boxShadow: '0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15)',
                margin: '1px',
                maxWidth: '540px',
                minWidth: '326px',
                padding: '0',
                width: 'calc(100% - 2px)'
              }}
            >
              <div style={{ padding: '16px' }}>
                <a
                  href={reelData.sourceUrl}
                  style={{
                    background: '#FFFFFF',
                    lineHeight: '0',
                    padding: '0 0',
                    textAlign: 'center',
                    textDecoration: 'none',
                    width: '100%'
                  }}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <div style={{ backgroundColor: '#F4F4F4', borderRadius: '50%', flexGrow: 0, height: '40px', marginRight: '14px', width: '40px' }}></div>
                    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'center' }}>
                      <div style={{ backgroundColor: '#F4F4F4', borderRadius: '4px', flexGrow: 0, height: '14px', marginBottom: '6px', width: '100px' }}></div>
                      <div style={{ backgroundColor: '#F4F4F4', borderRadius: '4px', flexGrow: 0, height: '14px', width: '60px' }}></div>
                    </div>
                  </div>
                  <div style={{ padding: '19% 0' }}></div>
                  <div style={{ display: 'block', height: '50px', margin: '0 auto 12px', width: '50px' }}>
                    <svg width="50px" height="50px" viewBox="0 0 60 60" version="1.1" xmlns="http://www.w3.org/2000/svg">
                      <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                        <g transform="translate(-511.000000, -20.000000)" fill="#000000">
                          <g>
                            <path d="M556.869,30.41 C554.814,30.41 553.148,32.076 553.148,34.131 C553.148,36.186 554.814,37.852 556.869,37.852 C558.924,37.852 560.59,36.186 560.59,34.131 C560.59,32.076 558.924,30.41 556.869,30.41 M541,60.657 C535.114,60.657 530.342,55.887 530.342,50 C530.342,44.114 535.114,39.342 541,39.342 C546.887,39.342 551.658,44.114 551.658,50 C551.658,55.887 546.887,60.657 541,60.657 M541,33.886 C532.1,33.886 524.886,41.1 524.886,50 C524.886,58.899 532.1,66.113 541,66.113 C549.9,66.113 557.115,58.899 557.115,50 C557.115,41.1 549.9,33.886 541,33.886 M565.378,62.101 C565.244,65.022 564.756,66.606 564.346,67.663 C563.803,69.06 563.154,70.057 562.106,71.106 C561.058,72.155 560.06,72.803 558.662,73.347 C557.607,73.757 556.021,74.244 553.102,74.378 C549.944,74.521 548.997,74.552 541,74.552 C533.003,74.552 532.056,74.521 528.898,74.378 C525.979,74.244 524.393,73.757 523.338,73.347 C521.94,72.803 520.942,72.155 519.894,71.106 C518.846,70.057 518.197,69.06 517.654,67.663 C517.244,66.606 516.755,65.022 516.623,62.101 C516.479,58.943 516.448,57.996 516.448,50 C516.448,42.003 516.479,41.056 516.623,37.899 C516.755,34.978 517.244,33.391 517.654,32.338 C518.197,30.938 518.846,29.942 519.894,28.894 C520.942,27.846 521.94,27.196 523.338,26.654 C524.393,26.244 525.979,25.756 528.898,25.623 C532.057,25.479 533.004,25.448 541,25.448 C548.997,25.448 549.943,25.479 553.102,25.623 C556.021,25.756 557.607,26.244 558.662,26.654 C560.06,27.196 561.058,27.846 562.106,28.894 C563.154,29.942 563.803,30.938 564.346,32.338 C564.756,33.391 565.244,34.978 565.378,37.899 C565.522,41.056 565.552,42.003 565.552,50 C565.552,57.996 565.522,58.943 565.378,62.101 M570.82,37.631 C570.674,34.438 570.167,32.258 569.425,30.349 C568.659,28.377 567.633,26.702 565.965,25.035 C564.297,23.368 562.623,22.342 560.652,21.575 C558.743,20.834 556.562,20.326 553.369,20.18 C550.169,20.033 549.148,20 541,20 C532.853,20 531.831,20.033 528.631,20.18 C525.438,20.326 523.257,20.834 521.349,21.575 C519.376,22.342 517.703,23.368 516.035,25.035 C514.368,26.702 513.342,28.377 512.574,30.349 C511.834,32.258 511.326,34.438 511.181,37.631 C511.035,40.831 511,41.851 511,50 C511,58.147 511.035,59.17 511.181,62.369 C511.326,65.562 511.834,67.743 512.574,69.651 C513.342,71.625 514.368,73.296 516.035,74.965 C517.703,76.634 519.376,77.658 521.349,78.425 C523.257,79.167 525.438,79.673 528.631,79.82 C531.831,79.965 532.853,80.001 541,80.001 C549.148,80.001 550.169,79.965 553.369,79.82 C556.562,79.673 558.743,79.167 560.652,78.425 C562.623,77.658 564.297,76.634 565.965,74.965 C567.633,73.296 568.659,71.625 569.425,69.651 C570.167,67.743 570.674,65.562 570.82,62.369 C570.966,59.17 571,58.147 571,50 C571,41.851 570.966,40.831 570.82,37.631"></path>
                          </g>
                        </g>
                      </g>
                    </svg>
                  </div>
                  <div style={{ paddingTop: '8px' }}>
                    <div style={{ color: '#3897f0', fontFamily: 'Arial,sans-serif', fontSize: '14px', fontStyle: 'normal', fontWeight: '550', lineHeight: '18px' }}>
                      View this post on Instagram
                    </div>
                  </div>
                </a>
                <p style={{ color: '#c9c8cd', fontFamily: 'Arial,sans-serif', fontSize: '14px', lineHeight: '17px', marginBottom: '0', marginTop: '8px', overflow: 'hidden', padding: '8px 0 7px', textAlign: 'center', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <a
                    href={reelData.sourceUrl}
                    style={{ color: '#c9c8cd', fontFamily: 'Arial,sans-serif', fontSize: '14px', fontStyle: 'normal', fontWeight: 'normal', lineHeight: '17px', textDecoration: 'none' }}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    A post shared by {reelData.author || 'Instagram'}
                  </a>
                </p>
              </div>
            </blockquote>
          </div>

          {/* Success Info Box */}
          <div className="success-box">
            <div className="flex items-start gap-2">
              <span className="text-xl">✅</span>
              <div>
                <p className="font-semibold text-green-800 mb-1">Instagram Embed Loaded!</p>
                <p className="text-sm text-green-700">
                  The reel is embedded using Instagram's official embed player.
                  Click play on the video above to watch it!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Container */}
      {reelData.type === 'video' && reelData.videoUrl && !videoError ? (
        <div className="relative bg-black rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            className="w-full max-h-[600px] object-contain"
            poster={reelData.thumbnail}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onError={handleVideoError}
            controls
            playsInline
          >
            <source src={reelData.videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          {/* Custom Play Button Overlay */}
          {!isPlaying && !videoError && (
            <div
              className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
              onClick={handlePlayPause}
            >
              <div className="bg-white/90 rounded-full p-6 hover:scale-110 transition-transform">
                <svg className="w-12 h-12 text-instagram-primary" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          )}
        </div>
      ) : (
        // Fallback to thumbnail if video fails
        <div className="relative bg-gray-100 rounded-lg overflow-hidden">
          {reelData.thumbnail || reelData.imageUrl ? (
            <img
              src={reelData.thumbnail || reelData.imageUrl}
              alt="Reel thumbnail"
              className="w-full max-h-[600px] object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div className="hidden flex-col items-center justify-center p-12 text-center bg-gray-50">
            <span className="text-6xl mb-4">🖼️</span>
            <p className="text-gray-600">Thumbnail not available</p>
          </div>
        </div>
      )}

      {videoError && (
        <div className="error-box">
          <div className="flex items-start gap-2">
            <span className="text-xl">❌</span>
            <div>
              <p className="font-semibold text-red-800 mb-1">Video Playback Failed</p>
              <p className="text-sm text-red-700 mb-2">
                The video URL has likely expired or requires authentication.
              </p>
              <p className="text-sm text-red-600">
                This is expected behavior and demonstrates why scraping is unreliable.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Metadata */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-800">📊 Metadata</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Type */}
          <MetadataItem
            label="Type"
            value={
              reelData.type === 'video'
                ? '🎥 Video'
                : reelData.type === 'embed'
                ? '📺 Embed (oEmbed)'
                : '🖼️ Image'
            }
          />

          {/* Method */}
          {reelData.method && (
            <MetadataItem
              label="Fetch Method"
              value={reelData.method === 'oembed' ? 'oEmbed API' : reelData.method.toUpperCase()}
            />
          )}

          {/* Shortcode */}
          {reelData.shortcode && (
            <MetadataItem label="Shortcode" value={reelData.shortcode} />
          )}

          {/* Author (for oEmbed) */}
          {reelData.author && (
            <MetadataItem label="Author" value={reelData.author} />
          )}

          {/* Title (for oEmbed) */}
          {reelData.title && (
            <MetadataItem label="Title" value={reelData.title} />
          )}

          {/* Views */}
          {reelData.views > 0 && (
            <MetadataItem label="Views" value={formatNumber(reelData.views)} />
          )}

          {/* Likes */}
          {reelData.likes > 0 && (
            <MetadataItem label="Likes" value={formatNumber(reelData.likes)} />
          )}

          {/* Comments */}
          {reelData.comments > 0 && (
            <MetadataItem label="Comments" value={formatNumber(reelData.comments)} />
          )}

          {/* Dimensions */}
          {reelData.dimensions && (
            <MetadataItem
              label="Dimensions"
              value={`${reelData.dimensions.width} × ${reelData.dimensions.height}`}
            />
          )}
        </div>

        {/* Owner Info */}
        {reelData.owner && reelData.owner.username && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              {reelData.owner.profilePic && (
                <img
                  src={reelData.owner.profilePic}
                  alt={reelData.owner.username}
                  className="w-12 h-12 rounded-full"
                  onError={(e) => e.target.style.display = 'none'}
                />
              )}
              <div>
                <p className="text-sm text-gray-600">Owner</p>
                <p className="font-semibold text-gray-800">@{reelData.owner.username}</p>
              </div>
            </div>
          </div>
        )}

        {/* Caption */}
        {reelData.caption && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Caption</p>
            <p className="text-gray-800 whitespace-pre-wrap break-words">
              {reelData.caption.length > 300
                ? reelData.caption.substring(0, 300) + '...'
                : reelData.caption}
            </p>
          </div>
        )}

        {/* Scraped At */}
        {reelData.scrapedAt && (
          <div className="text-xs text-gray-500 text-center pt-2 border-t">
            Data retrieved at: {new Date(reelData.scrapedAt).toLocaleString()}
          </div>
        )}
      </div>

      {/* Raw Data (for debugging) */}
      <details className="bg-gray-50 rounded-lg p-4">
        <summary className="cursor-pointer font-semibold text-gray-700 hover:text-gray-900">
          🔍 View Raw Data (for debugging)
        </summary>
        <pre className="mt-3 text-xs bg-gray-800 text-green-400 p-4 rounded overflow-x-auto">
          {JSON.stringify(reelData, null, 2)}
        </pre>
      </details>
    </div>
  );
}

function MetadataItem({ label, value }) {
  return (
    <div className="p-3 bg-gray-50 rounded-lg">
      <p className="text-sm text-gray-600">{label}</p>
      <p className="font-semibold text-gray-800">{value}</p>
    </div>
  );
}
