'use client'

import { CategoryGlyph } from './Ornaments'

export const CATEGORIES = [
  { id: 'weapon',   label: 'Weapon',   tagline: 'Blades, bows & battle-gear' },
  { id: 'npc',      label: 'Character', tagline: 'Allies, rivals & strangers' },
  { id: 'monster',  label: 'Monster',  tagline: 'Beasts, horrors & dragons' },
  { id: 'artifact', label: 'Artifact', tagline: 'Relics of lost ages' },
  { id: 'location', label: 'Location', tagline: 'Realms, ruins & strongholds' },
]

interface Props {
  value: string
  onChange: (category: string) => void
}

export default function CategorySelector({ value, onChange }: Props) {
  return (
    <div>
      <p className="field-legend">Choose a Discipline</p>
      <div className="cat-row">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            type="button"
            onClick={() => onChange(cat.id)}
            className={`cat-card${value === cat.id ? ' on' : ''}`}
          >
            <span className="cat-ico">
              <CategoryGlyph kind={cat.id} size={28} />
            </span>
            <span className="cat-label">{cat.label}</span>
            <span className="cat-tag">{cat.tagline}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
