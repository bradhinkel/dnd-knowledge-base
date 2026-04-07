'use client'

import Link from 'next/link'
import ImageDisplay from './ImageDisplay'
import ContentDetail from './ContentDetail'

const RARITY_CLASS: Record<string, string> = {
  common: 'rarity-common',
  uncommon: 'rarity-uncommon',
  rare: 'rarity-rare',
  'very rare': 'rarity-very-rare',
  legendary: 'rarity-legendary',
  artifact: 'rarity-artifact',
}

interface Props {
  item: {
    id: string
    category: string
    name: string
    rarity?: string
    content: Record<string, any>
    image_url?: string
    created_at?: string
  }
  category: string
  expanded?: boolean
}

export default function ContentCard({ item, category, expanded = false }: Props) {
  const rarityKey = item.rarity?.toLowerCase() ?? ''
  const rarityClass = RARITY_CLASS[rarityKey] ?? 'rarity-common'

  const description =
    item.content.description ||
    item.content.overview ||
    item.content.backstory ||
    item.content.lore_and_history ||
    ''

  return (
    <div
      className="rounded-lg border overflow-hidden hover:border-opacity-70 transition-all"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
    >
      {item.image_url && (
        <div className="w-full aspect-square overflow-hidden">
          <ImageDisplay
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-contain"
          />
        </div>
      )}

      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <h3
            className="font-bold leading-tight"
            style={{ color: 'var(--accent)', fontFamily: 'Georgia, serif',
                     fontSize: expanded ? '1.25rem' : '1rem' }}
          >
            {expanded ? item.name : (
              <Link href={`/item/${item.id}`} className="hover:underline">
                {item.name}
              </Link>
            )}
          </h3>
          {item.rarity && (
            <span
              className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap text-white ${rarityClass}`}
            >
              {item.rarity}
            </span>
          )}
        </div>

        <p className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>
          {category}
        </p>

        {!expanded && description && (
          <p
            className="text-sm line-clamp-3"
            style={{ color: 'var(--text-primary)', opacity: 0.85 }}
          >
            {typeof description === 'string' ? description : ''}
          </p>
        )}

        {expanded && <ContentDetail content={item.content} category={category} />}

        {!expanded && (
          <Link
            href={`/item/${item.id}`}
            className="text-xs hover:underline"
            style={{ color: 'var(--accent)' }}
          >
            View full details →
          </Link>
        )}
      </div>
    </div>
  )
}
