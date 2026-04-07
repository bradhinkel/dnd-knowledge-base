'use client'

const CATEGORIES = [
  { id: 'weapon',   label: 'Weapon',   icon: '⚔️' },
  { id: 'npc',      label: 'NPC',      icon: '🧙' },
  { id: 'artifact', label: 'Artifact', icon: '💎' },
  { id: 'location', label: 'Location', icon: '🏰' },
  { id: 'monster',  label: 'Monster',  icon: '🐉' },
]

interface Props {
  value: string
  onChange: (category: string) => void
}

export default function CategorySelector({ value, onChange }: Props) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
        Category
      </label>
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            type="button"
            onClick={() => onChange(cat.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: value === cat.id ? 'var(--accent)' : 'var(--bg-card)',
              color: value === cat.id ? '#0f0f1a' : 'var(--text-primary)',
              border: `1px solid ${value === cat.id ? 'var(--accent)' : 'var(--border)'}`,
              fontWeight: value === cat.id ? '700' : '500',
            }}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
