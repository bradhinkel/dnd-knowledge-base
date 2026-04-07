'use client'

import { useEffect, useState } from 'react'
import ContentCard from '@/components/ContentCard'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api'
const CATEGORIES = ['all', 'weapon', 'npc', 'artifact', 'location', 'monster']

export default function GalleryPage() {
  const [category, setCategory] = useState('all')
  const [items, setItems] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setPage(1)
  }, [category])

  useEffect(() => {
    async function fetchItems() {
      setLoading(true)
      try {
        const params = new URLSearchParams({ page: String(page), page_size: '20' })
        if (category !== 'all') params.set('category', category)
        const res = await fetch(`${API_BASE}/items?${params}`)
        const data = await res.json()
        setItems(data.items)
        setTotal(data.total)
      } catch (e) {
        setItems([])
      } finally {
        setLoading(false)
      }
    }
    fetchItems()
  }, [category, page])

  const totalPages = Math.ceil(total / 20)

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--accent)', fontFamily: 'Georgia, serif' }}>
          Content Gallery
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Browse all generated D&D content</p>
      </div>

      <hr className="gold-divider" />

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className="px-4 py-1.5 rounded-full text-sm font-medium transition-colors capitalize"
            style={{
              background: category === cat ? 'var(--accent)' : 'var(--bg-card)',
              color: category === cat ? '#000' : 'var(--text-muted)',
              border: `1px solid ${category === cat ? 'var(--accent)' : 'var(--border)'}`,
            }}
          >
            {cat}
          </button>
        ))}
        <span className="ml-auto text-sm" style={{ color: 'var(--text-muted)' }}>
          {total} items
        </span>
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="inline-block w-8 h-8 border-2 rounded-full animate-spin"
               style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
          <p className="text-4xl mb-4">🎲</p>
          <p>No items generated yet. <a href="/" className="underline" style={{ color: 'var(--accent)' }}>Create one!</a></p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(item => (
            <ContentCard key={item.id} item={item} category={item.category} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded text-sm disabled:opacity-30"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            ← Previous
          </button>
          <span className="px-4 py-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded text-sm disabled:opacity-30"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  )
}
