'use client'

// Fields to always hide in the detail view
const HIDDEN_FIELDS = new Set([
  'source_category',
  'image_prompt',
  'name',         // shown in the card header
])

const FIELD_LABELS: Record<string, string> = {
  rarity: 'Rarity',
  weapon_type: 'Weapon Type',
  requires_attunement: 'Requires Attunement',
  special_abilities: 'Special Abilities',
  lore_and_history: 'Lore & History',
  flavor_text: 'Flavor Text',
  encounter_hooks: 'Encounter Hooks',
  creator: 'Creator',
  char_class: 'Class',
  challenge_rating: 'Challenge Rating',
  armor_class: 'Armor Class',
  hit_points: 'Hit Points',
  monster_type: 'Creature Type',
  alignment: 'Alignment',
  affiliation: 'Affiliation',
  backstory: 'Backstory',
  abilities_and_skills: 'Abilities & Skills',
  combat_tactics: 'Combat Tactics',
  description: 'Description',
  overview: 'Overview',
  atmosphere: 'Atmosphere',
  notable_features: 'Notable Features',
  powers_and_abilities: 'Powers & Abilities',
  consequences: 'Consequences / Curse',
  rumors: 'Rumors',
  population: 'Population',
  government: 'Government',
  location_type: 'Location Type',
}

function formatKey(key: string): string {
  return FIELD_LABELS[key] ?? key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function renderValue(value: any): React.ReactNode {
  if (value === null || value === undefined) return null
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'

  if (Array.isArray(value)) {
    if (value.length === 0) return null
    // Array of objects (e.g. special_abilities)
    if (typeof value[0] === 'object' && value[0] !== null) {
      return (
        <ul className="space-y-1 mt-1">
          {value.map((item: any, i: number) => (
            <li key={i} className="text-sm">
              {item.name && <span className="font-semibold" style={{ color: 'var(--accent)' }}>{item.name}</span>}
              {item.name && item.description && ' — '}
              {item.description && <span style={{ color: 'var(--text-primary)' }}>{item.description}</span>}
              {!item.name && !item.description && JSON.stringify(item)}
            </li>
          ))}
        </ul>
      )
    }
    // Simple string array
    return (
      <ul className="list-disc list-inside space-y-0.5 mt-1">
        {value.map((v: string, i: number) => (
          <li key={i} className="text-sm" style={{ color: 'var(--text-primary)' }}>{v}</li>
        ))}
      </ul>
    )
  }

  if (typeof value === 'object') {
    return (
      <div className="mt-1 space-y-1">
        {Object.entries(value).map(([k, v]) => (
          <div key={k} className="text-sm">
            <span className="font-medium" style={{ color: 'var(--text-muted)' }}>{formatKey(k)}: </span>
            <span style={{ color: 'var(--text-primary)' }}>{String(v)}</span>
          </div>
        ))}
      </div>
    )
  }

  return <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{String(value)}</span>
}

interface Props {
  content: Record<string, any>
  category: string
}

export default function ContentDetail({ content, category }: Props) {
  const entries = Object.entries(content).filter(([key]) => !HIDDEN_FIELDS.has(key))

  return (
    <div className="space-y-3">
      {entries.map(([key, value]) => {
        const rendered = renderValue(value)
        if (rendered === null) return null
        return (
          <div key={key}>
            <dt className="text-xs font-semibold uppercase tracking-wider mb-0.5"
                style={{ color: 'var(--text-muted)' }}>
              {formatKey(key)}
            </dt>
            <dd className="ml-0">{rendered}</dd>
          </div>
        )
      })}
    </div>
  )
}
