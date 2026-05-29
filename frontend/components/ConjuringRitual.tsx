'use client'

import { useEffect, useRef, useState } from 'react'
import { RuneRing, FleuronMark } from './Ornaments'

const RITUAL_STEPS = [
  'Consulting the archives…',
  'Sifting ash, ember, and lore…',
  'Weighing rarity and renown…',
  'Inscribing the page in gilt…',
]

function Embers({ count = 26 }: { count?: number }) {
  const items = useRef<{ l: number; d: number; dur: number; s: number; o: number }[]>([])
  if (items.current.length === 0) {
    items.current = [...Array(count)].map(() => ({
      l: Math.random() * 100,
      d: Math.random() * 6,
      dur: 4 + Math.random() * 5,
      s: 2 + Math.random() * 4,
      o: 0.3 + Math.random() * 0.6,
    }))
  }
  return (
    <div className="embers" aria-hidden="true">
      {items.current.map((e, i) => (
        <span
          key={i}
          style={{
            left: `${e.l}%`,
            width: e.s,
            height: e.s,
            opacity: e.o,
            animationDelay: `${e.d}s`,
            animationDuration: `${e.dur}s`,
          }}
        />
      ))}
    </div>
  )
}

interface Props {
  /** Live status text from the SSE stream — overrides the auto-cycling steps */
  liveStatus?: string
}

export default function ConjuringRitual({ liveStatus }: Props) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (liveStatus) return
    const t = setInterval(() => setStep(s => Math.min(s + 1, RITUAL_STEPS.length - 1)), 850)
    return () => clearInterval(t)
  }, [liveStatus])

  const displayStatus = liveStatus || RITUAL_STEPS[step]

  return (
    <div className="ritual no-print" aria-live="polite" aria-label="Conjuring in progress">
      <Embers count={34} />
      <div className="ritual-core">
        <div className="ring-stack">
          <div className="ring r1"><RuneRing size={300} /></div>
          <div className="ring r2"><RuneRing size={210} /></div>
          <div className="ring-glow" />
        </div>
        <p className="ritual-status">{displayStatus}</p>
        <FleuronMark size={40} color="var(--gold)" />
      </div>
    </div>
  )
}

export { Embers }
