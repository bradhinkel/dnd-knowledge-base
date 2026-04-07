'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import ContentDetail from '@/components/ContentDetail'
import ImageDisplay from '@/components/ImageDisplay'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api'

export default function ItemPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [item, setItem] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
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
    if (id) fetchItem()
  }, [id])

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="inline-block w-8 h-8 border-2 rounded-full animate-spin"
             style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-xl" style={{ color: 'var(--text-muted)' }}>Item not found</p>
        <button onClick={() => router.push('/gallery')}
                className="underline" style={{ color: 'var(--accent)' }}>
          Back to gallery
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button
        onClick={() => router.back()}
        className="text-sm flex items-center gap-2 hover:opacity-80 transition-opacity"
        style={{ color: 'var(--text-muted)' }}
      >
        ← Back
      </button>

      <div className="rounded-lg border overflow-hidden"
           style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}>
        {item.image_url && (
          <div className="flex justify-center p-4">
            <div className="w-48 aspect-square overflow-hidden">
              <ImageDisplay src={item.image_url} alt={item.name} className="w-full h-full object-contain" />
            </div>
          </div>
        )}
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--accent)', fontFamily: 'Georgia, serif' }}>
                {item.name}
              </h1>
              <p className="text-sm capitalize mt-1" style={{ color: 'var(--text-muted)' }}>
                {item.category} {item.rarity ? `· ${item.rarity}` : ''}
              </p>
            </div>
          </div>
          <hr className="gold-divider" />
          <ContentDetail content={item.content} category={item.category} />
        </div>
      </div>
    </div>
  )
}
