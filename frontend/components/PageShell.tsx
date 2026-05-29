import { CornerFlourish } from './Ornaments'

/* Rarity palette — drives the wax seal and rarity tag */
export const RARITIES: Record<string, { label: string; accent: string; bright: string }> = {
  common:      { label: 'Common',    accent: '#5c5040', bright: '#7a6a52' },
  uncommon:    { label: 'Uncommon',  accent: '#2f6b34', bright: '#3f8c46' },
  rare:        { label: 'Rare',      accent: '#1f4f8a', bright: '#2f6cb0' },
  'very rare': { label: 'Very Rare', accent: '#5e2f8a', bright: '#7d44b0' },
  legendary:   { label: 'Legendary', accent: '#9c6a1e', bright: '#caa14a' },
  artifact:    { label: 'Artifact',  accent: '#7a1f1f', bright: '#a83228' },
}

export function isLux(rarity: string) {
  return rarity === 'legendary' || rarity === 'artifact'
}

export function rarityVars(rarity: string): React.CSSProperties {
  const r = RARITIES[rarity?.toLowerCase()] ?? RARITIES.common
  return {
    '--accent': '#6a1d15',
    '--accent-bright': '#9c2a1e',
    '--rarity': r.accent,
    '--rarity-bright': r.bright,
  } as React.CSSProperties
}

/* ---- Wax seal ---- */
export function WaxSeal({ rarity, lux }: { rarity: string; lux?: boolean }) {
  const r = RARITIES[rarity?.toLowerCase()] ?? RARITIES.common
  return (
    <div
      className={`seal title-seal ${lux ? 'lux-seal' : ''}`}
      style={{ '--rarity': r.accent, '--rarity-bright': r.bright } as React.CSSProperties}
    >
      {r.label}
    </div>
  )
}

/* ---- Rarity tag (inline) ---- */
export function RarityTag({ rarity }: { rarity: string }) {
  const r = RARITIES[rarity?.toLowerCase()] ?? RARITIES.common
  return (
    <span
      className="rarity-tag"
      style={{ '--rarity': r.accent } as React.CSSProperties}
    >
      <span className="dot" />
      {r.label}
    </span>
  )
}

/* ---- Title block ---- */
export function TitleBlock({
  name,
  subtitle,
  rarity,
}: {
  name: string
  subtitle?: string
  rarity: string
}) {
  const lux = isLux(rarity)
  const showSeal = rarity?.toLowerCase() !== 'common'
  return (
    <header className="title-block">
      {showSeal && <WaxSeal rarity={rarity} lux={lux} />}
      <h1 className="tome-title">{name}</h1>
      {subtitle && <h2 className="tome-sub">{subtitle}</h2>}
    </header>
  )
}

/* ---- Shared page shell ---- */
interface PageShellProps {
  rarity: string
  page?: number
  children: React.ReactNode
}

export default function PageShell({ rarity, page, children }: PageShellProps) {
  const lux = isLux(rarity)
  return (
    <div
      className={`tome-page parchment parch-edge${lux ? ' lux' : ''}`}
      style={rarityVars(rarity)}
    >
      <div className="corner tl"><CornerFlourish /></div>
      <div className="corner tr"><CornerFlourish /></div>
      <div className="corner bl"><CornerFlourish /></div>
      <div className="corner br"><CornerFlourish /></div>
      <div className="gilt" />
      <div className="tome-inner">{children}</div>
      {page != null && (
        <div className="page-no">&mdash; {page} &mdash;</div>
      )}
    </div>
  )
}
