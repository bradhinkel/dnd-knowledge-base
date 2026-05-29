'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import TomeBar from '@/components/TomeBar'
import TomePage from '@/components/TomePage'
import { RuneRing } from '@/components/Ornaments'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api'

export default function ItemPage() {
  const { id } = useParams<{ id: string }>()
  const [item, setItem] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [bound, setBound] = useState(false)

  useEffect(() => {
    if (!id) return
    async function fetchItem() {
      try {
        const res = await fetch(`${API_BASE}/items/${id}`)
        if (!res.ok) throw new Error('Item not found')
        setItem(await res.json())
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    fetchItem()
  }, [id])

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '1.5rem' }}>
        <div className="ring r1" style={{ width: 120, height: 120, animation: 'spin 4s linear infinite' }}>
          <RuneRing size={120} />
        </div>
        <p style={{ fontFamily: 'var(--display)', color: 'var(--gold-pale)', letterSpacing: '.12em', textTransform: 'uppercase', fontSize: '.85rem' }}>
          Opening the tome…
        </p>
      </div>
    )
  }

  if (error || !item) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '1rem' }}>
        <p style={{ fontFamily: 'var(--display)', color: 'var(--gold-pale)', letterSpacing: '.1em', fontSize: '1rem' }}>
          {error || 'This page was not found in the archives.'}
        </p>
        <a href="/" style={{ fontFamily: 'var(--display)', color: 'var(--crimson)', fontSize: '.8rem', textTransform: 'uppercase', letterSpacing: '.1em' }}>
          Return to the Workshop →
        </a>
      </div>
    )
  }

  return (
    <>
      <TomeBar
        backHref="/"
        backLabel="The Workshop"
        bound={bound}
        onBind={() => setBound(true)}
      />
      <div className="stage" style={{ paddingTop: 34 }}>
        <TomePage item={item} />
      </div>
    </>
  )
}
