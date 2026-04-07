'use client'

import { useState, useEffect } from 'react'

interface Field {
  name: string
  label: string
  placeholder?: string
  options?: string[]
}

const CATEGORY_FIELDS: Record<string, Field[]> = {
  weapon: [
    { name: 'rarity', label: 'Rarity', options: ['Common', 'Uncommon', 'Rare', 'Very Rare', 'Legendary'] },
    { name: 'type', label: 'Weapon Type', placeholder: 'e.g. Longsword, Dagger, Bow' },
    { name: 'theme', label: 'Theme', placeholder: 'e.g. lightning, shadow, frost' },
    { name: 'location', label: 'Location / Origin', placeholder: 'e.g. Waterdeep, Underdark' },
  ],
  npc: [
    { name: 'char_class', label: 'Class', placeholder: 'e.g. Wizard, Rogue, Paladin' },
    { name: 'rarity', label: 'Importance', options: ['Minor', 'Notable', 'Major', 'Legendary'] },
    { name: 'theme', label: 'Theme / Personality', placeholder: 'e.g. villain, mentor, trickster' },
    { name: 'location', label: 'Location', placeholder: 'e.g. Silverymoon, Baldur\'s Gate' },
  ],
  artifact: [
    { name: 'rarity', label: 'Rarity', options: ['Rare', 'Very Rare', 'Legendary', 'Artifact'] },
    { name: 'type', label: 'Item Type', placeholder: 'e.g. ring, cloak, sword, mirror' },
    { name: 'theme', label: 'Theme', placeholder: 'e.g. shadow, divine, nature, undead' },
    { name: 'location', label: 'Associated Location', placeholder: 'e.g. Candlekeep, Undermountain' },
  ],
  location: [
    { name: 'type', label: 'Location Type', placeholder: 'e.g. city, dungeon, forest, ruins' },
    { name: 'terrain', label: 'Terrain', placeholder: 'e.g. coastal, mountain, underground' },
    { name: 'theme', label: 'Theme / Atmosphere', placeholder: 'e.g. political intrigue, ancient evil' },
    { name: 'rarity', label: 'Scale', options: ['Village', 'Town', 'City', 'Metropolis', 'Landmark'] },
  ],
  monster: [
    { name: 'cr', label: 'Challenge Rating', placeholder: 'e.g. 1, 5, 10, 15, 20' },
    { name: 'type', label: 'Creature Type', placeholder: 'e.g. undead, dragon, humanoid, aberration' },
    { name: 'theme', label: 'Theme', placeholder: 'e.g. psionic, shadow, fire, frost' },
    { name: 'location', label: 'Habitat', placeholder: 'e.g. Underdark, coastal, forest' },
  ],
}

interface Props {
  category: string
  onSubmit: (params: Record<string, string>) => void
  disabled?: boolean
}

export default function GeneratorForm({ category, onSubmit, disabled }: Props) {
  const fields = CATEGORY_FIELDS[category] || []
  const [values, setValues] = useState<Record<string, string>>({})

  // Reset form when category changes
  useEffect(() => {
    setValues({})
  }, [category])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const params: Record<string, string> = {}
    for (const [k, v] of Object.entries(values)) {
      if (v.trim()) params[k] = v.trim()
    }
    onSubmit(params)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map(field => (
          <div key={field.name} className="space-y-1">
            <label className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {field.label}
            </label>
            {field.options ? (
              <select
                value={values[field.name] || ''}
                onChange={e => setValues(prev => ({ ...prev, [field.name]: e.target.value }))}
                disabled={disabled}
                className="w-full px-3 py-2 rounded text-sm"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                }}
              >
                <option value="">Any</option>
                {field.options.map(opt => (
                  <option key={opt} value={opt.toLowerCase()}>{opt}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={values[field.name] || ''}
                onChange={e => setValues(prev => ({ ...prev, [field.name]: e.target.value }))}
                placeholder={field.placeholder}
                disabled={disabled}
                className="w-full px-3 py-2 rounded text-sm"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-primary)',
                }}
              />
            )}
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={disabled}
        className="w-full py-3 rounded-lg font-semibold text-sm transition-all disabled:opacity-50"
        style={{
          background: disabled ? 'var(--border)' : 'var(--accent)',
          color: '#0f0f1a',
          cursor: disabled ? 'not-allowed' : 'pointer',
        }}
      >
        {disabled ? 'Generating…' : `Generate ${category.charAt(0).toUpperCase() + category.slice(1)}`}
      </button>
    </form>
  )
}
