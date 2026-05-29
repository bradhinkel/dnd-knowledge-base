'use client'

import Link from 'next/link'
import { CategoryGlyph } from './Ornaments'
import { RARITIES, RarityTag } from './PageShell'

interface Item {
  id: string
  category: string
  name: string
  rarity?: string
  content: Record<string, any>
  image_url?: string
  created_at?: string
}

interface Props {
  item: Item
  pageNumber?: number
}

export default function ContentCard({ item, pageNumber }: Props) {
  const rarity = item.rarity?.toLowerCase() ?? 'common'
  const r = RARITIES[rarity] ?? RARITIES.common
  const subtitle =
    item.content.subtitle ||
    item.content.item_subtype ||
    item.content.archetype ||
    item.content.monster_type?.split(',')[0] ||
    ''

  return (
    <Link
      href={`/item/${item.id}`}
      className="comp-card parchment parch-edge"
      style={{
        '--accent': r.accent,
        '--accent-bright': r.bright,
        '--rarity': r.accent,
        '--rarity-bright': r.bright,
      } as React.CSSProperties}
    >
      <div className="comp-card-edge" />
      <span className="comp-emblem">
        <CategoryGlyph kind={item.category} size={34} />
      </span>
      <span className="comp-name">{item.name}</span>
      {subtitle && <span className="comp-sub">{subtitle}</span>}
      <span className="comp-rarity">
        <RarityTag rarity={rarity} />
      </span>
      {pageNumber != null && (
        <span className="comp-page">p. {pageNumber}</span>
      )}
    </Link>
  )
}
