export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4">
          <div className="space-y-2">
            <p className="text-lg font-semibold">
              📚 Educational Project
            </p>
            <p className="text-gray-400 text-sm max-w-2xl mx-auto">
              This project demonstrates web scraping challenges and limitations.
              It does not use official APIs and violates Instagram's Terms of Service.
              <strong className="text-white"> Never use this in production.</strong>
            </p>
          </div>

          <div className="border-t border-gray-700 pt-4">
            <p className="text-gray-400 text-sm">
              &copy; {currentYear} Instagram Reel Viewer - Educational Use Only
            </p>
            <p className="text-gray-500 text-xs mt-2">
              Instagram is a trademark of Meta Platforms, Inc.
            </p>
          </div>

          <div className="flex justify-center gap-6 text-sm text-gray-400">
            <a
              href="https://developers.facebook.com/docs/instagram-api"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Official Instagram API
            </a>
            <a
              href="https://help.instagram.com/581066165581870"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Instagram Terms of Use
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
