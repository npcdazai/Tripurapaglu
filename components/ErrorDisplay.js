'use client';

export default function ErrorDisplay({ error }) {
  const getErrorIcon = (type) => {
    switch (type) {
      case 'validation':
        return '⚠️';
      case 'network':
        return '🌐';
      case 'timeout':
        return '⏱️';
      case 'server':
        return '🔴';
      case 'no_data':
        return '📭';
      default:
        return '❌';
    }
  };

  const getErrorTitle = (type) => {
    switch (type) {
      case 'validation':
        return 'Validation Error';
      case 'network':
        return 'Network Error';
      case 'timeout':
        return 'Request Timeout';
      case 'server':
        return 'Server Error';
      case 'no_data':
        return 'No Data';
      default:
        return 'Error';
    }
  };

  return (
    <div className="card border-red-200 bg-red-50">
      <div className="space-y-4">
        {/* Error Header */}
        <div className="flex items-start gap-3">
          <span className="text-4xl">{getErrorIcon(error.type)}</span>
          <div className="flex-grow">
            <h3 className="text-xl font-bold text-red-800 mb-1">
              {getErrorTitle(error.type)}
            </h3>
            <p className="text-red-700 font-medium">
              {error.message}
            </p>
          </div>
        </div>

        {/* Status Code */}
        {error.status && (
          <div className="p-3 bg-red-100 rounded-lg border border-red-300">
            <p className="text-sm text-red-800">
              <strong>HTTP Status:</strong> {error.status}
            </p>
          </div>
        )}

        {/* Example URL */}
        {error.example && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-300">
            <p className="text-sm text-blue-800 mb-1">
              <strong>Example Format:</strong>
            </p>
            <code className="text-xs bg-blue-100 px-2 py-1 rounded">
              {error.example}
            </code>
          </div>
        )}

        {/* Educational Note */}
        {error.educationalNote && (
          <div className="info-box">
            <div className="flex items-start gap-2">
              <span className="text-xl">💡</span>
              <div>
                <p className="font-semibold text-blue-800 mb-1">Educational Note</p>
                <p className="text-sm text-blue-700">
                  {error.educationalNote}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Common Solutions */}
        <div className="bg-white rounded-lg p-4 border border-red-200">
          <h4 className="font-semibold text-gray-800 mb-3">
            🔧 Possible Solutions:
          </h4>
          <ul className="space-y-2 text-sm text-gray-700">
            {error.type === 'network' && (
              <>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>Ensure the backend server is running on port 5000</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>Check CORS settings in backend configuration</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>Verify the API_URL in frontend environment variables</span>
                </li>
              </>
            )}

            {error.type === 'validation' && (
              <>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>Use a public Instagram Reel URL</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>Ensure the URL starts with https://instagram.com/reel/</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>Copy the URL directly from Instagram</span>
                </li>
              </>
            )}

            {(error.type === 'server' || error.type === 'timeout') && (
              <>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>Try a different Instagram Reel (this one may be private)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>Wait a few minutes before trying again (rate limiting)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>This demonstrates why scraping is unreliable</span>
                </li>
              </>
            )}

            {error.type === 'no_data' && (
              <>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>Instagram may have changed their HTML structure</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>The Reel might require authentication to view</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">•</span>
                  <span>Try a different public Reel</span>
                </li>
              </>
            )}

            {/* Generic fallback */}
            {!['network', 'validation', 'server', 'timeout', 'no_data'].includes(error.type) && (
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-1">•</span>
                <span>Check browser console for detailed error logs</span>
              </li>
            )}
          </ul>
        </div>

        {/* Why This Happens */}
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-300">
          <h4 className="font-semibold text-yellow-900 mb-2">
            📚 Why This Happens:
          </h4>
          <p className="text-sm text-yellow-800">
            Instagram actively prevents scraping to protect user privacy and platform
            integrity. Failures are <strong>expected and normal</strong> - this is exactly
            why production applications must never rely on web scraping.
          </p>
        </div>

        {/* Retry Button */}
        <div className="text-center pt-2">
          <p className="text-sm text-gray-600">
            You can try again with a different URL or after waiting a few minutes
          </p>
        </div>
      </div>
    </div>
  );
}
