'use client'

import { useState } from 'react'
import CategorySelector from '@/components/CategorySelector'
import GeneratorForm from '@/components/GeneratorForm'
import ContentCard from '@/components/ContentCard'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '/api'

export default function GeneratorPage() {
  const [category, setCategory] = useState('weapon')
  const [generating, setGenerating] = useState(false)
  const [status, setStatus] = useState('')
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  async function handleGenerate(params: Record<string, string>) {
    setGenerating(true)
    setError('')
    setResult(null)
    setStatus('Retrieving references from knowledge base…')

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

        // SSE events are separated by \n\n
        const events = buffer.split('\n\n')
        buffer = events.pop() ?? '' // keep incomplete trailing event

        for (const event of events) {
          if (!event.trim()) continue
          const lines = event.split('\n')
          const eventType = lines.find(l => l.startsWith('event:'))?.slice(7).trim()
          const dataLine = lines.find(l => l.startsWith('data:'))?.slice(5).trim()
          if (!dataLine) continue
          try {
            const data = JSON.parse(dataLine)
            if (eventType === 'done') {
              setResult(data)
              setStatus('')
            } else if (eventType === 'error') {
              setError(data.message)
            } else if (eventType === 'status') {
              setStatus(data.message)
            }
          } catch {
            // ignore malformed events
          }
        }
      }
    } catch (e: any) {
      setError(e.message || 'Generation failed')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1
          className="text-3xl font-bold"
          style={{ color: 'var(--accent)', fontFamily: 'Georgia, serif' }}
        >
          Create D&D Content
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Generate unique weapons, NPCs, artifacts, locations, and monsters using AI
        </p>
      </div>

      <hr className="gold-divider" />

      <div
        className="rounded-lg p-6 border space-y-6"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
      >
        <CategorySelector value={category} onChange={setCategory} />
        <GeneratorForm
          category={category}
          onSubmit={handleGenerate}
          disabled={generating}
        />
      </div>

      {generating && (
        <div className="text-center space-y-3 py-8">
          <div className="inline-block w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
               style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
          <p style={{ color: 'var(--text-muted)' }}>{status || 'Generating…'}</p>
        </div>
      )}

      {error && (
        <div
          className="rounded p-4 border text-sm"
          style={{ background: '#2a0a0a', borderColor: '#6a1a1a', color: '#ff8080' }}
        >
          {error}
        </div>
      )}

      {result && !generating && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold" style={{ color: 'var(--accent)' }}>
            Generated {category.charAt(0).toUpperCase() + category.slice(1)}
          </h2>
          <ContentCard item={result} category={category} expanded />
        </div>
      )}
    </div>
  )
}
