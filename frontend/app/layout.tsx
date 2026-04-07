import type { Metadata } from 'next'
import './globals.css'
import IframeResizer from '@/components/IframeResizer'

export const metadata: Metadata = {
  title: 'D&D Content Generator',
  description: 'AI-powered Dungeons & Dragons content generator powered by RAG',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <IframeResizer />
        <main className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
          <nav
            className="border-b px-6 py-4 flex items-center justify-between"
            style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚔️</span>
              <span
                className="text-xl font-bold tracking-wide"
                style={{ color: 'var(--accent)', fontFamily: 'Georgia, serif' }}
              >
                D&D Content Generator
              </span>
            </div>
            <nav className="flex gap-6 text-sm" style={{ color: 'var(--text-muted)' }}>
              <a href="/" className="hover:text-white transition-colors">Generate</a>
              <a href="/gallery" className="hover:text-white transition-colors">Gallery</a>
            </nav>
          </nav>
          <div className="px-4 py-6 max-w-5xl mx-auto">
            {children}
          </div>
        </main>
      </body>
    </html>
  )
}
