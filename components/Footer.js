export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="text-center space-y-4">
          <div className="border-t border-gray-700 pt-4">
            <p className="text-gray-400 text-sm">
              &copy; {currentYear} Instagram Reel Viewer
            </p>
            <p className="text-gray-500 text-xs mt-2">
              Instagram is a trademark of Meta Platforms, Inc.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
