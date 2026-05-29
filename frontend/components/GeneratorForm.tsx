'use client'

import { useState, useEffect } from 'react'

interface Field {
  name: string
  label: string
  placeholder?: string
  type?: 'select'
  options?: string[]
}

export const CATEGORY_FIELDS: Record<string, Field[]> = {
  weapon: [
    { name: 'rarity', label: 'Rarity', type: 'select', options: ['Common','Uncommon','Rare','Very Rare','Legendary'] },
    { name: 'type',   label: 'Weapon Type', placeholder: 'e.g. Shortbow, Longsword, Dagger' },
    { name: 'theme',  label: 'Theme', placeholder: 'e.g. volcanic fire, frost, shadow' },
    { name: 'location', label: 'Origin', placeholder: 'e.g. the Smoking Mountains' },
  ],
  npc: [
    { name: 'char_class', label: 'Calling', placeholder: 'e.g. Bowyer, Wizard, Rogue' },
    { name: 'rarity',     label: 'Renown', type: 'select', options: ['Common','Uncommon','Rare','Legendary'] },
    { name: 'theme',      label: 'Disposition', placeholder: 'e.g. mentor, schemer, recluse' },
    { name: 'location',   label: 'Home', placeholder: 'e.g. Waterdeep' },
  ],
  monster: [
    { name: 'cr',       label: 'Challenge Rating', placeholder: 'e.g. 1, 6, 12, 20' },
    { name: 'type',     label: 'Creature Type', placeholder: 'e.g. dragon, undead, fiend' },
    { name: 'theme',    label: 'Theme', placeholder: 'e.g. fire, decay, the deep' },
    { name: 'location', label: 'Habitat', placeholder: 'e.g. volcanic caverns' },
  ],
  artifact: [
    { name: 'rarity',   label: 'Rarity', type: 'select', options: ['Very Rare','Legendary','Artifact'] },
    { name: 'type',     label: 'Form', placeholder: 'e.g. crown, mirror, tome' },
    { name: 'theme',    label: 'Theme', placeholder: 'e.g. divine, undeath, flame' },
    { name: 'location', label: 'Bound to', placeholder: 'e.g. Candlekeep' },
  ],
  location: [
    { name: 'type',     label: 'Kind', placeholder: 'e.g. city, dungeon, range' },
    { name: 'terrain',  label: 'Terrain', placeholder: 'e.g. volcanic, coastal' },
    { name: 'theme',    label: 'Atmosphere', placeholder: 'e.g. restless, sacred' },
    { name: 'rarity',   label: 'Scale', type: 'select', options: ['Landmark','Village','Town','City','Region'] },
  ],
}

interface Props {
  category: string
  onSubmit: (params: Record<string, string>) => void
  disabled?: boolean
  savedCount?: number
  onOpenCompendium?: () => void
}

export default function GeneratorForm({ category, onSubmit, disabled, savedCount, onOpenCompendium }: Props) {
  const fields = CATEGORY_FIELDS[category] || []
  const [values, setValues] = useState<Record<string, string>>({})

  useEffect(() => { setValues({}) }, [category])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const params: Record<string, string> = {}
    for (const [k, v] of Object.entries(values)) {
      if (v.trim()) params[k] = v.trim()
    }
    onSubmit(params)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="field-grid">
        {fields.map(field => (
          <div className="field" key={field.name}>
            <label htmlFor={`field-${field.name}`}>{field.label}</label>
            {field.type === 'select' ? (
              <select
                id={`field-${field.name}`}
                value={values[field.name] || ''}
                onChange={e => setValues(prev => ({ ...prev, [field.name]: e.target.value }))}
                disabled={disabled}
              >
                <option value="">Any</option>
                {field.options!.map(opt => (
                  <option key={opt} value={opt.toLowerCase()}>{opt}</option>
                ))}
              </select>
            ) : (
              <input
                id={`field-${field.name}`}
                type="text"
                value={values[field.name] || ''}
                onChange={e => setValues(prev => ({ ...prev, [field.name]: e.target.value }))}
                placeholder={field.placeholder}
                maxLength={120}
                disabled={disabled}
              />
            )}
          </div>
        ))}
      </div>

      <div className="desk-actions">
        <button type="submit" className="conjure-btn" disabled={disabled}>
          <span className="cb-ring" aria-hidden="true" />
          <span className="cb-label">{disabled ? 'Conjuring…' : 'Conjure'}</span>
        </button>
        {onOpenCompendium && (
          <button type="button" className="btn ghost" onClick={onOpenCompendium}>
            The Compendium{savedCount ? ` · ${savedCount}` : ''}
          </button>
        )}
      </div>
    </form>
  )
}
