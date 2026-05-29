'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Props {
  backHref?: string
  backLabel?: string
  bound?: boolean
  onBind?: () => void
  onInscribe?: () => void
  compendiumHref?: string
}

export default function TomeBar({
  backHref = '/',
  backLabel = 'The Workshop',
  bound = false,
  onBind,
  onInscribe,
  compendiumHref = '/gallery',
}: Props) {
  const router = useRouter()

  function handleInscribe() {
    if (onInscribe) { onInscribe(); return }
    window.print()
  }

  return (
    <nav className="codex-bar no-print">
      <button className="bar-btn" onClick={() => router.push(backHref)}>
        <span>&#8592;</span>
        {backLabel}
      </button>

      <span className="bar-mark">The Artificer&rsquo;s Codex</span>

      <div className="bar-actions">
        {onBind && (
          <button
            className={`bar-action${bound ? ' bound' : ''}`}
            onClick={onBind}
          >
            {bound ? '✓ Bound' : 'Bind to Compendium'}
          </button>
        )}
        <button className="bar-action" onClick={handleInscribe}>
          Inscribe
        </button>
        <Link href={compendiumHref} className="bar-action" style={{ textDecoration: 'none' }}>
          Compendium
        </Link>
      </div>
    </nav>
  )
}
