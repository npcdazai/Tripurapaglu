import './globals.css'

export const metadata = {
  title: 'Instagram Reel Viewer',
  description: 'Educational demonstration of web scraping limitations and challenges',
  keywords: 'instagram, reel, viewer, educational, web scraping',
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
