'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import CategorySelector from '@/components/CategorySelector'
import GeneratorForm from '@/components/GeneratorForm'
import ConjuringRitual, { Embers } from '@/components/ConjuringRitual'
import AboutBox from '@/components/AboutBox'
import { Fleuron, CornerFlourish } from '@/components/Ornaments'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api'

export default function GeneratorPage() {
  const router = useRouter()
  const [category, setCategory] = useState('weapon')
  const [generating, setGenerating] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  async function handleGenerate(params: Record<string, string>) {
    setGenerating(true)
    setError('')
    setStatus('')

    try {
      const response = await fetch(`${API_BASE}/generate/${category}/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })

      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const reader = response.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

        const events = buffer.split('\n\n')
        buffer = events.pop() ?? ''

        for (const event of events) {
          if (!event.trim()) continue
          const lines = event.split('\n')
          const eventType = lines.find(l => l.startsWith('event:'))?.slice(7).trim()
          const dataLine = lines.find(l => l.startsWith('data:'))?.slice(5).trim()
          if (!dataLine) continue
          try {
            const data = JSON.parse(dataLine)
            if (eventType === 'done') {
              router.push(`/item/${data.id}`)
              return
            } else if (eventType === 'error') {
              setError(data.message)
              setGenerating(false)
            } else if (eventType === 'status') {
              setStatus(data.message)
            }
          } catch {
            // ignore malformed SSE events
          }
        }
      }
    } catch (e: any) {
      setError(e.message || 'Generation failed')
      setGenerating(false)
    }
  }

  return (
    <>
      {generating && <ConjuringRitual liveStatus={status} />}

      <div className="stage desk-stage">
        <div className="desk-panel parchment parch-edge">
          <div className="corner tl"><CornerFlourish /></div>
          <div className="corner tr"><CornerFlourish /></div>
          <div className="corner bl"><CornerFlourish /></div>
          <div className="corner br"><CornerFlourish /></div>
          <div className="gilt" />

          <div className="tome-inner desk-inner">
            <p className="eyebrow desk-eyebrow">A Dungeon Master&rsquo;s Workshop</p>
            <h1 className="codex-wordmark">The Artificer&rsquo;s Codex</h1>
            <Fleuron />
            <p className="desk-lede">
              Name a thing, and the archives will conjure it &mdash; weapons, wanderers,
              monsters and relics, each set down as a page of the great book.
            </p>

            <CategorySelector value={category} onChange={setCategory} />
            <GeneratorForm
              category={category}
              onSubmit={handleGenerate}
              disabled={generating}
              onOpenCompendium={() => router.push('/gallery')}
            />

            {error && (
              <p style={{ color: '#c04040', marginTop: '1rem', fontStyle: 'italic', fontSize: '.92rem' }}>
                {error}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="ember-gap no-print" aria-hidden="true">
        <Embers count={22} />
      </div>

      <AboutBox />
    </>
  )
}
