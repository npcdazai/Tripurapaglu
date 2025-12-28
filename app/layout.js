import './globals.css'

export const metadata = {
  title: 'I love you',
  description: 'I love you ',
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
