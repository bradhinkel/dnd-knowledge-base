/* Decorative SVG components — ported from design_handoff_artificers_codex/ornaments.jsx */

export function CornerFlourish() {
  return (
    <svg viewBox="0 0 96 96" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M6 6 L6 40" strokeWidth="2.2"/>
      <path d="M6 6 L40 6" strokeWidth="2.2"/>
      <path d="M12 12 C12 30 18 44 40 46 C26 44 14 36 12 12 Z" fill="currentColor" stroke="none" opacity=".25"/>
      <path d="M12 12 C40 14 50 26 52 52"/>
      <path d="M12 12 C14 40 26 50 52 52"/>
      <path d="M52 52 C66 50 76 56 80 72"/>
      <path d="M80 72 C84 84 78 90 70 88 C76 86 78 80 74 76 C71 73 66 74 66 79 C66 84 72 85 72 85"/>
      <path d="M52 52 C60 44 70 46 76 56"/>
      <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none"/>
      <circle cx="52" cy="52" r="2.4" fill="currentColor" stroke="none"/>
      <circle cx="40" cy="6" r="1.6" fill="currentColor" stroke="none"/>
      <circle cx="6" cy="40" r="1.6" fill="currentColor" stroke="none"/>
      <path d="M20 6 C30 8 30 0 40 2" opacity=".8"/>
      <path d="M6 20 C8 30 0 30 2 40" opacity=".8"/>
    </svg>
  )
}

export function Fleuron({ wide = false }: { wide?: boolean }) {
  return (
    <div className="fleuron" style={{ margin: wide ? '0' : undefined }}>
      <span className="ln" />
      <svg width="46" height="14" viewBox="0 0 46 14" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M3 7 H16"/><path d="M30 7 H43"/>
        <path d="M23 1 L29 7 L23 13 L17 7 Z" fill="currentColor" stroke="none"/>
        <path d="M23 4 L26 7 L23 10 L20 7 Z" fill="var(--parch)" stroke="none"/>
        <circle cx="13" cy="7" r="1.4" fill="currentColor" stroke="none"/>
        <circle cx="33" cy="7" r="1.4" fill="currentColor" stroke="none"/>
      </svg>
      <span className="ln r" />
    </div>
  )
}

export function FleuronMark({ size = 20, color }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size * 0.42}
      viewBox="0 0 46 14"
      fill="none"
      stroke={color || 'currentColor'}
      strokeWidth="1.2"
      style={{ display: 'block' }}
    >
      <path d="M3 7 H16"/><path d="M30 7 H43"/>
      <path d="M23 1 L29 7 L23 13 L17 7 Z" fill="currentColor" stroke="none"/>
      <circle cx="13" cy="7" r="1.4" fill="currentColor" stroke="none"/>
      <circle cx="33" cy="7" r="1.4" fill="currentColor" stroke="none"/>
    </svg>
  )
}

export function CompassRose({ size = 96, className }: { size?: number; className?: string }) {
  const star = (sc: number, fill: string) => {
    let d = ''
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4
      const long = i % 2 === 0
      const r = (long ? 44 : 18) * sc
      const mid = (long ? 44 : 18) * sc * 0.34
      const x = 50 + Math.cos(a) * r
      const y = 50 + Math.sin(a) * r
      const a2 = a + Math.PI / 8
      const xm = 50 + Math.cos(a2) * mid
      const ym = 50 + Math.sin(a2) * mid
      d += (i === 0 ? 'M' : 'L') + x.toFixed(1) + ' ' + y.toFixed(1) + ' L' + xm.toFixed(1) + ' ' + ym.toFixed(1) + ' '
    }
    return <path d={d + 'Z'} fill={fill} stroke="currentColor" strokeWidth="0.8" />
  }

  return (
    <svg className={className} width={size} height={size} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1">
      <circle cx="50" cy="50" r="46" strokeWidth="1.4"/>
      <circle cx="50" cy="50" r="40" opacity=".5"/>
      {[...Array(32)].map((_, i) => {
        const a = (i * Math.PI) / 16
        const r2 = i % 4 === 0 ? 34 : 37
        return (
          <line
            key={i}
            x1={50 + Math.cos(a) * 40} y1={50 + Math.sin(a) * 40}
            x2={50 + Math.cos(a) * r2} y2={50 + Math.sin(a) * r2}
            opacity=".5"
          />
        )
      })}
      {star(1, 'rgba(138,106,44,.18)')}
      {star(0.5, 'currentColor')}
      <circle cx="50" cy="50" r="3" fill="currentColor" stroke="none"/>
      <text x="50" y="13" textAnchor="middle" fontFamily="Cinzel, serif" fontSize="8" fill="currentColor" stroke="none">N</text>
    </svg>
  )
}

export function MountainSketch({ width = 180, className }: { width?: number; className?: string }) {
  return (
    <svg
      className={className}
      width={width}
      height={width * 0.62}
      viewBox="0 0 200 124"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeLinejoin="round"
    >
      <path d="M2 118 L40 70 L58 92 L86 38 L104 64 L120 46 L150 96 L168 78 L198 118" strokeWidth="1.4"/>
      <path d="M86 38 C90 30 96 26 99 18 C101 26 104 32 108 40" opacity=".8"/>
      {[...Array(7)].map((_, i) => (
        <line key={i} x1={86+i*2} y1={38+i*7} x2={70+i*2} y2={64+i*7} opacity=".35"/>
      ))}
      {[...Array(5)].map((_, i) => (
        <line key={'b'+i} x1={40+i*2} y1={70+i*6} x2={28+i*2} y2={92+i*6} opacity=".3"/>
      ))}
      <path d="M99 14 C94 6 104 2 99 -6" opacity=".5" transform="translate(0,8)"/>
      <line x1="0" y1="119" x2="200" y2="119" opacity=".5"/>
    </svg>
  )
}

export function RuneRing({ size = 240 }: { size?: number }) {
  const glyphs = 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ'.split('')
  const N = 24
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none" stroke="var(--gold-bright)" strokeWidth="1">
      <circle cx="100" cy="100" r="92" opacity=".5"/>
      <circle cx="100" cy="100" r="78"/>
      <circle cx="100" cy="100" r="58" opacity=".7"/>
      <g>
        {[...Array(N)].map((_, i) => {
          const a = (i / N) * 360
          return (
            <text
              key={i}
              x="100"
              y="32"
              textAnchor="middle"
              transform={`rotate(${a} 100 100)`}
              fontSize="9"
              fill="var(--gold-pale)"
              stroke="none"
              fontFamily="serif"
              opacity=".9"
            >
              {glyphs[i % glyphs.length]}
            </text>
          )
        })}
      </g>
      <path d="M100 46 L146 128 L54 128 Z" opacity=".8"/>
      <path d="M100 154 L54 72 L146 72 Z" opacity=".55"/>
      <circle cx="100" cy="100" r="30" opacity=".9"/>
      {[...Array(6)].map((_, i) => {
        const a = (i * Math.PI) / 3
        return (
          <line
            key={i}
            x1={100 + Math.cos(a) * 30} y1={100 + Math.sin(a) * 30}
            x2={100 + Math.cos(a + Math.PI) * 30} y2={100 + Math.sin(a + Math.PI) * 30}
            opacity=".4"
          />
        )
      })}
    </svg>
  )
}

export function CategoryGlyph({ kind, size = 30 }: { kind: string; size?: number }) {
  const p = {
    width: size, height: size, viewBox: '0 0 32 32', fill: 'none',
    stroke: 'currentColor', strokeWidth: '1.4', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
  }
  switch (kind) {
    case 'weapon':
      return (
        <svg {...p}>
          <path d="M7 25 L22 10"/>
          <path d="M19 7 L25 13 L22 16 L16 10 Z" fill="currentColor" opacity=".25"/>
          <path d="M19 7 L25 13"/>
          <path d="M5 27 L9 23"/>
          <path d="M6 22 L10 26"/>
          <path d="M22 6 L26 10"/>
        </svg>
      )
    case 'npc':
      return (
        <svg {...p}>
          <circle cx="16" cy="11" r="5"/>
          <path d="M7 27 C7 19 25 19 25 27"/>
          <path d="M11 8 C13 4 19 4 21 8"/>
        </svg>
      )
    case 'artifact':
      return (
        <svg {...p}>
          <path d="M16 4 L26 12 L16 28 L6 12 Z"/>
          <path d="M6 12 H26"/>
          <path d="M16 4 L11 12 L16 28"/>
          <path d="M16 4 L21 12 L16 28"/>
        </svg>
      )
    case 'location':
      return (
        <svg {...p}>
          <path d="M6 27 V12 L11 8 L16 12 V27"/>
          <path d="M16 27 V14 L22 9 L27 14 V27"/>
          <path d="M3 27 H29"/>
          <path d="M10 16 v3 M19 18 v3"/>
        </svg>
      )
    case 'monster':
      return (
        <svg {...p}>
          <path d="M8 14 C8 7 24 7 24 14 C24 20 19 22 19 26 L13 26 C13 22 8 20 8 14 Z"/>
          <circle cx="13" cy="14" r="1.6" fill="currentColor"/>
          <circle cx="19" cy="14" r="1.6" fill="currentColor"/>
          <path d="M14 26 v-3 M18 26 v-3 M16 26 v-3"/>
          <path d="M8 11 L4 8 M24 11 L28 8"/>
        </svg>
      )
    default:
      return null
  }
}

/* Heading with underline rule (section sub-headers on tome pages) */
export function TomeHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="heading-rule">
      <h3 className="section-h">{children}</h3>
      <span className="line" />
    </div>
  )
}
