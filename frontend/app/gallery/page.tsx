'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import ContentCard from '@/components/ContentCard'
import TomeBar from '@/components/TomeBar'
import { Fleuron } from '@/components/Ornaments'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api'
const FILTERS = ['all', 'weapon', 'npc', 'artifact', 'location', 'monster']

export default function CompendiumPage() {
  const [category, setCategory] = useState('all')
  const [items, setItems] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => { setPage(1) }, [category])

  useEffect(() => {
    async function fetchItems() {
      setLoading(true)
      try {
        const params = new URLSearchParams({ page: String(page), page_size: '24' })
        if (category !== 'all') params.set('category', category)
        const res = await fetch(`${API_BASE}/items?${params}`)
        const data = await res.json()
        setItems(data.items)
        setTotal(data.total)
      } catch {
        setItems([])
      } finally {
        setLoading(false)
      }
    }
    fetchItems()
  }, [category, page])

  const totalPages = Math.ceil(total / 24)

  return (
    <>
      <TomeBar backHref="/" backLabel="The Workshop" />

      <div className="stage comp-stage">
        <div className="comp-wrap">
          <header className="comp-head">
            <h1 className="codex-wordmark sm">The Compendium</h1>
            <Fleuron />
            <p className="desk-lede">
              {total} {total === 1 ? 'entry' : 'entries'} bound into the book.
            </p>

            {/* Category filter */}
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1rem' }}>
              {FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => setCategory(f)}
                  style={{
                    fontFamily: 'var(--display)',
                    fontSize: '.7rem',
                    textTransform: 'uppercase',
                    letterSpacing: '.1em',
                    padding: '5px 14px',
                    background: category === f ? 'rgba(106,29,21,.18)' : 'transparent',
                    border: `1px solid ${category === f ? 'var(--crimson)' : 'rgba(138,106,44,.4)'}`,
                    color: category === f ? 'var(--crimson)' : 'var(--gold-pale)',
                    borderRadius: '2px',
                    cursor: 'pointer',
                    transition: 'all .14s',
                  }}
                >
                  {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </header>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 0' }}>
              <div className="ring-stack" style={{ width: 120, height: 120, margin: '0 auto' }}>
                <div className="ring r1" style={{ width: 120, height: 120 }}>
                  <div style={{ width: 60, height: 60, border: '1px solid var(--gold)', borderRadius: '50%', animation: 'spin 3s linear infinite' }} />
                </div>
              </div>
              <p style={{ fontFamily: 'var(--display)', color: 'var(--gold-pale)', letterSpacing: '.12em', textTransform: 'uppercase', fontSize: '.85rem', marginTop: '1rem' }}>
                Consulting the archives…
              </p>
            </div>
          ) : items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 0' }}>
              <p style={{ fontFamily: 'var(--display)', color: 'var(--gold-pale)', letterSpacing: '.1em', fontSize: '1rem', marginBottom: '.75rem' }}>
                The Compendium is empty.
              </p>
              <Link
                href="/"
                style={{ fontFamily: 'var(--display)', color: 'var(--crimson)', fontSize: '.8rem', textTransform: 'uppercase', letterSpacing: '.1em' }}
              >
                Return to the Workshop →
              </Link>
            </div>
          ) : (
            <div className="comp-grid">
              {items.map((item, i) => (
                <ContentCard key={item.id} item={item} pageNumber={i + 1 + (page - 1) * 24} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '2.5rem', alignItems: 'center' }}>
              <button
                className="btn ghost"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{ opacity: page === 1 ? .4 : 1 }}
              >
                ← Previous
              </button>
              <span style={{ fontFamily: 'var(--display)', color: 'var(--gold-pale)', fontSize: '.78rem', letterSpacing: '.1em' }}>
                {page} / {totalPages}
              </span>
              <button
                className="btn ghost"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{ opacity: page === totalPages ? .4 : 1 }}
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
