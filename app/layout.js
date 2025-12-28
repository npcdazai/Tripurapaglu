import './globals.css'

export const metadata = {
  title: 'Instagram Reel Viewer',
  description: 'Instagram Reel Viewer - Share and view reels',
  keywords: 'instagram, reel, viewer',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script async src="https://www.instagram.com/embed.js"></script>
      </head>
      <body className="bg-gray-50 min-h-screen">
        {children}
      </body>
    </html>
  )
}
