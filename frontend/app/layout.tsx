import type { Metadata } from 'next'
import IframeResizer from '@/components/IframeResizer'
import './globals.css'

export const metadata: Metadata = {
  title: "The Artificer's Codex",
  description: 'An illuminated tome of AI-conjured D&D content — weapons, monsters, NPCs, artifacts, and locations.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Cinzel+Decorative:wght@400;700;900&family=EB+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <IframeResizer />
        <div className="room">
          {children}
        </div>
      </body>
    </html>
  )
}
