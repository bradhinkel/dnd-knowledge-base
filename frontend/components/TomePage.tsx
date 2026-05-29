/**
 * TomePage — illuminated result pages for all three D&D categories.
 * Three layouts: Item (weapon/artifact/location), Monster (stat block), NPC (dossier).
 * Adapters map the raw GeneratedItem.content fields to the layout slots expected
 * by each design, so the API shape doesn't have to change.
 */

import PageShell, { TitleBlock, isLux } from './PageShell'
import { Fleuron, FleuronMark, TomeHeading, CompassRose, MountainSketch } from './Ornaments'

/* ---- GeneratedItem from the API ---- */
export interface GeneratedItem {
  id: string
  category: string
  name: string
  rarity?: string
  content: Record<string, any>
  image_url?: string
  created_at?: string
}

/* ---- helpers ---- */
function toArray(val: unknown): string[] {
  if (!val) return []
  if (Array.isArray(val)) return val.map(String)
  return [String(val)]
}

function toAbilities(val: unknown): { name: string; desc: string }[] {
  if (!val) return []
  if (Array.isArray(val)) {
    return val.map((a: any) => ({
      name: a.name || '',
      desc: a.description || a.desc || '',
    }))
  }
  /* plain string fallback — split on bold-name pattern */
  const str = String(val)
  const parts = str.split(/(?=\*\*[^*]+\.\*\*|\b[A-Z][^.]+\.)/).filter(Boolean)
  return parts.map(p => {
    const m = p.match(/^\*?\*?([^*.]+)\.\*?\*?\s*([\s\S]*)$/)
    return m ? { name: m[1].trim(), desc: m[2].trim() } : { name: '', desc: p.trim() }
  })
}

function toTraitActions(val: unknown): { name: string; desc: string }[] {
  if (!val) return []
  if (Array.isArray(val)) {
    return val.map((a: any) => ({
      name: a.name || '',
      desc: a.description || a.desc || '',
    }))
  }
  const str = String(val).trim()
  /* split on **Name.** or _Name._ italic patterns common in 5e blocks */
  const segments = str
    .split(/(?=(?:\*\*|\*|_)([A-Z][^*.]+)\.(?:\*\*|\*|_))/)
    .filter(Boolean)
  if (segments.length <= 1) {
    return [{ name: '', desc: str }]
  }
  const results: { name: string; desc: string }[] = []
  let i = 0
  while (i < segments.length) {
    const m = segments[i].match(/^(?:\*\*|\*|_)([^*.]+)\.(?:\*\*|\*|_)\s*([\s\S]*)$/)
    if (m) {
      results.push({ name: m[1].trim(), desc: m[2].trim() })
    } else if (segments[i].trim()) {
      results.push({ name: '', desc: segments[i].trim() })
    }
    i++
  }
  return results.length ? results : [{ name: '', desc: str }]
}

function parseAbilityScores(val: unknown): Record<string, number> {
  const defaults = { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 }
  if (!val) return defaults
  if (typeof val === 'object' && !Array.isArray(val)) {
    return { ...defaults, ...(val as Record<string, number>) }
  }
  const str = String(val)
  const map: Record<string, string> = {
    str: 'STR|Str', dex: 'DEX|Dex', con: 'CON|Con',
    int: 'INT|Int', wis: 'WIS|Wis', cha: 'CHA|Cha',
  }
  const result = { ...defaults }
  for (const [key, pattern] of Object.entries(map)) {
    const m = str.match(new RegExp(`(?:${pattern})\\s+(\\d+)`))
    if (m) result[key as keyof typeof result] = parseInt(m[1])
  }
  return result
}

function modifier(score: number): string {
  const mod = Math.floor((score - 10) / 2)
  return (mod >= 0 ? '+' : '') + mod
}

/* ============================================================
   ART FRAME — <img> with object-fit: contain inside an aspect-ratio box.
   The Pillow-padded PNG (12% transparent border on every side) guarantees
   the subject never touches the img element boundary.
   ============================================================ */
function ArtFrame({ src, alt, shape = 'rect' }: { src?: string; alt?: string; shape?: 'rect' | 'tall' }) {
  if (!src) {
    return (
      <div className={`art-placeholder${shape === 'tall' ? ' tall' : ''}`}>
        <span style={{ opacity: 0.45 }}>{alt || 'Art'}</span>
      </div>
    )
  }
  const ratio = shape === 'tall' ? '3/4' : '2/3'  // 2/3 matches 1024×1536 portrait AI output
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={src}
      alt={alt || ''}
      style={{
        width: '100%',
        aspectRatio: ratio,
        objectFit: 'contain',
        display: 'block',
        mixBlendMode: 'multiply',
      }}
    />
  )
}

/* ============================================================
   ITEM PAGE — weapon / artifact / location
   ============================================================ */
function ItemPage({ item }: { item: GeneratedItem }) {
  const c = item.content
  const rarity = item.rarity?.toLowerCase() ?? 'common'
  const lux = isLux(rarity)

  const subtitle = c.subtitle || c.item_subtype || ''
  const typeLabel = c.item_type || c.artifact_type || c.location_type || item.category
  const attunement =
    c.requires_attunement === true ? 'Yes'
    : c.requires_attunement === false ? 'No'
    : c.attunement || '—'
  const physical = toArray(c.physical_description || c.description || c.overview || '')
  const properties = c.properties || c.powers_and_abilities || ''
  const abilities = toAbilities(c.special_abilities)
  const flavor = c.flavor_text || ''
  const lore = toArray(c.lore_and_history || c.lore || '')
  const conditions = c.special_conditions || c.consequences || ''

  return (
    <PageShell rarity={rarity} page={47}>
      <TitleBlock name={item.name} subtitle={subtitle} rarity={rarity} />
      <Fleuron />
      <p className="typeline">
        {typeLabel}
        <span className="sep">&#9670;</span>
        {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
        <br />
        Requires Attunement: {attunement}
      </p>

      <div className="item-grid">
        {/* Left column — description, properties, abilities, flavor */}
        <div className="col col-left body-col">
          {physical.length > 0 && (
            <>
              <TomeHeading>Physical Description</TomeHeading>
              {physical.map((p, i) => (
                <p key={i} className={i === 0 ? 'dropcap' : ''}>{p}</p>
              ))}
            </>
          )}

          {properties && (
            <>
              <TomeHeading>Properties</TomeHeading>
              <p>{properties}</p>
            </>
          )}

          {abilities.length > 0 && (
            <>
              <TomeHeading>Special Abilities</TomeHeading>
              {abilities.map((a, i) => (
                <p key={i} className="ability">
                  {a.name && <b>{a.name} </b>}
                  {a.desc}
                </p>
              ))}
            </>
          )}

          {flavor && (
            <div className="flavor-block">
              <FleuronMark size={34} />
              <p className="flavor">&ldquo;{flavor}&rdquo;</p>
              <FleuronMark size={34} />
            </div>
          )}
        </div>

        {/* Center column — art */}
        <div className="col col-img">
          <div className="art-wrap">
            <ArtFrame src={item.image_url} alt={item.name} />
          </div>
        </div>

        {/* Right column — lore, conditions */}
        <div className="col col-right body-col">
          {lore.length > 0 && (
            <>
              <TomeHeading>Lore &amp; History</TomeHeading>
              {lore.map((p, i) => <p key={i}>{p}</p>)}
            </>
          )}

          {conditions && (
            <>
              <TomeHeading>Special Conditions</TomeHeading>
              <p>{conditions}</p>
            </>
          )}
        </div>
      </div>

      <MountainSketch className="footer-mtn" width={170} />
      <CompassRose className="footer-compass" size={84} />
    </PageShell>
  )
}

/* ============================================================
   MONSTER PAGE — 5e-style stat block
   ============================================================ */
function AbilityScore({ label, score }: { label: string; score: number }) {
  return (
    <div className="abscore">
      <div className="abscore-l">{label}</div>
      <div className="abscore-v">{score} ({modifier(score)})</div>
    </div>
  )
}

function MonsterPage({ item }: { item: GeneratedItem }) {
  const c = item.content
  const rarity = item.rarity?.toLowerCase() ?? 'common'

  const subtitle = c.subtitle || ''
  const meta = c.monster_type || c.meta || ''
  const cr = c.challenge_rating || c.cr || '?'
  const xp = c.xp || ''
  const abilities = parseAbilityScores(c.ability_scores || c.abilities)
  const traits = toTraitActions(c.traits)
  const actions = toTraitActions(c.actions)
  const lore = toArray(c.lore || c.ecology || c.lore_and_history || '')

  return (
    <PageShell rarity={rarity} page={112}>
      <TitleBlock name={item.name} subtitle={subtitle} rarity={rarity} />
      <Fleuron />
      <p className="typeline" style={{ textAlign: 'left' }}>
        {meta}
        {meta && <span className="sep">&#9670;</span>}
        Challenge {cr}{xp ? ` (${xp} XP)` : ''}
      </p>

      <div className="monster-grid">
        {/* Left — art + lore */}
        <div className="col-art">
          <div className="art-wrap tall">
            <ArtFrame src={item.image_url} alt={`${item.name} portrait`} shape="tall" />
          </div>
          <div className="body-col">
            {lore.length > 0 && (
              <>
                <TomeHeading>Lore &amp; History</TomeHeading>
                {lore.map((p, i) => <p key={i}>{p}</p>)}
              </>
            )}
          </div>
        </div>

        {/* Right — stat block */}
        <div className="statblock">
          <div className="sb-bar" />
          <div className="sb-inner">
            <div className="sb-meta">
              {c.armor_class && <p><b>Armor Class</b> {c.armor_class}</p>}
              {c.hit_points && <p><b>Hit Points</b> {c.hit_points}</p>}
              {c.speed && <p><b>Speed</b> {c.speed}</p>}
            </div>

            <div className="sb-rule" />

            <div className="ability-row">
              {(['str','dex','con','int','wis','cha'] as const).map(k => (
                <AbilityScore key={k} label={k.toUpperCase()} score={abilities[k]} />
              ))}
            </div>

            <div className="sb-rule" />

            <div className="sb-meta">
              {c.saving_throws && <p><b>Saving Throws</b> {c.saving_throws}</p>}
              {c.skills && <p><b>Skills</b> {c.skills}</p>}
              {c.damage_resistances && <p><b>Damage Resistances</b> {c.damage_resistances}</p>}
              {c.damage_immunities && <p><b>Damage Immunities</b> {c.damage_immunities}</p>}
              {c.senses && <p><b>Senses</b> {c.senses}</p>}
              {c.languages && <p><b>Languages</b> {c.languages}</p>}
              <p><b>Challenge</b> {cr}{xp ? ` (${xp} XP)` : ''}</p>
            </div>

            {traits.length > 0 && (
              <>
                <div className="sb-rule" />
                {traits.map((t, i) => (
                  <p key={i} className="sb-trait">
                    {t.name && <b><i>{t.name}</i> </b>}
                    {t.desc}
                  </p>
                ))}
              </>
            )}

            {actions.length > 0 && (
              <>
                <h3 className="sb-actions">Actions</h3>
                {actions.map((a, i) => (
                  <p key={i} className="sb-trait">
                    {a.name && <b><i>{a.name}</i> </b>}
                    {a.desc}
                  </p>
                ))}
              </>
            )}
          </div>
          <div className="sb-bar" />
        </div>
      </div>

      <CompassRose className="footer-compass" size={78} />
    </PageShell>
  )
}

/* ============================================================
   NPC PAGE — character dossier
   ============================================================ */
function NpcPage({ item }: { item: GeneratedItem }) {
  const c = item.content
  const rarity = item.rarity?.toLowerCase() ?? 'common'

  const subtitle = c.archetype || c.subtitle || ''
  const metaParts = [c.race, c.char_class, c.alignment, c.region].filter(Boolean)
  const meta = metaParts.join(' · ')
  const description = toArray(c.appearance || c.description || '')
  const backstory = toArray(c.backstory || '')
  const hooks: string[] = Array.isArray(c.encounter_hooks)
    ? c.encounter_hooks
    : toArray(c.encounter_hooks || '')

  /* Build personality traits from available fields */
  const traitSources = [
    c.personality && { name: 'Personality', desc: c.personality },
    c.motivations  && { name: 'Motivation',  desc: c.motivations },
    c.secrets      && { name: 'Secret',       desc: c.secrets },
  ].filter((t): t is { name: string; desc: string } => Boolean(t))

  /* Also pull structured traits if present */
  const structuredTraits = toAbilities(c.traits)
  const allTraits = structuredTraits.length ? structuredTraits : traitSources

  return (
    <PageShell rarity={rarity} page={88}>
      <TitleBlock name={item.name} subtitle={subtitle} rarity={rarity} />
      <Fleuron />
      {meta && <p className="typeline" style={{ textAlign: 'left' }}>{meta}</p>}

      <div className="npc-grid">
        {/* Left — portrait + trait panel */}
        <div className="npc-aside">
          <div className="portrait-frame">
            {item.image_url
              ? /* eslint-disable-next-line @next/next/no-img-element */
                <img src={item.image_url} alt={`${item.name} portrait`} style={{ width: '100%', aspectRatio: '3/4', objectFit: 'contain', display: 'block', mixBlendMode: 'multiply' }} />
              : <span style={{ opacity: 0.35, fontSize: '.85rem', fontStyle: 'italic' }}>Portrait</span>
            }
          </div>

          {allTraits.length > 0 && (
            <div className="trait-panel">
              {allTraits.map((t, i) => (
                <p key={i} className="npc-trait">
                  {t.name && <b>{t.name}. </b>}
                  {t.desc}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Right — description, backstory, hooks */}
        <div className="npc-main body-col">
          {description.length > 0 && (
            <>
              <TomeHeading>Description</TomeHeading>
              {description.map((p, i) => (
                <p key={i} className={i === 0 ? 'dropcap' : ''}>{p}</p>
              ))}
            </>
          )}

          {backstory.length > 0 && (
            <>
              <TomeHeading>Backstory</TomeHeading>
              {backstory.map((p, i) => <p key={i}>{p}</p>)}
            </>
          )}

          {hooks.length > 0 && (
            <>
              <TomeHeading>Adventure Hooks</TomeHeading>
              <ol className="hooks">
                {hooks.map((h, i) => <li key={i}>{h}</li>)}
              </ol>
            </>
          )}

          {c.abilities_and_skills && (
            <>
              <TomeHeading>Abilities &amp; Skills</TomeHeading>
              <p>{c.abilities_and_skills}</p>
            </>
          )}
        </div>
      </div>

      <MountainSketch className="footer-mtn" width={150} />
      <CompassRose className="footer-compass" size={78} />
    </PageShell>
  )
}

/* ============================================================
   LOCATION PAGE — realm / ruin / stronghold dossier
   ============================================================ */
function LocationPage({ item }: { item: GeneratedItem }) {
  const c = item.content
  const rarity = item.rarity?.toLowerCase() ?? 'common'

  const subtitle    = c.epithets || ''
  const typeLabel   = [c.location_type, c.region].filter(Boolean).join(' — ')
  const description = toArray(c.description || '')
  const history     = toArray(c.history || c.lore_and_history || '')
  const hooks       = toArray(c.hooks || c.encounter_hooks || '')
  const rumors      = toArray(c.rumors || '')

  /* Summary facts block: population, government, alignment, factions */
  const facts = [
    c.population  && { label: 'Population',  value: c.population },
    c.government  && { label: 'Government',   value: c.government },
    c.alignment   && { label: 'Alignment',    value: c.alignment },
    c.factions    && { label: 'Factions',     value: c.factions },
  ].filter((f): f is { label: string; value: string } => Boolean(f))

  return (
    <PageShell rarity={rarity} page={33}>
      <TitleBlock name={item.name} subtitle={subtitle} rarity={rarity} />
      <Fleuron />
      <p className="typeline">{typeLabel}</p>

      <div className="npc-grid">
        {/* Left — art + facts summary */}
        <div className="npc-aside">
          <div className="portrait-frame">
            {item.image_url
              ? /* eslint-disable-next-line @next/next/no-img-element */
                <img src={item.image_url} alt={item.name} style={{ width: '100%', aspectRatio: '2/3', objectFit: 'contain', display: 'block', mixBlendMode: 'multiply' }} />
              : <span style={{ opacity: 0.35, fontSize: '.85rem', fontStyle: 'italic' }}>Map</span>
            }
          </div>

          {facts.length > 0 && (
            <div className="trait-panel">
              {facts.map((f, i) => (
                <p key={i} className="npc-trait">
                  <b>{f.label}. </b>{f.value}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Right — description, notable features, history, hooks, rumors */}
        <div className="npc-main body-col">
          {description.length > 0 && (
            <>
              <TomeHeading>Overview</TomeHeading>
              {description.map((p, i) => (
                <p key={i} className={i === 0 ? 'dropcap' : ''}>{p}</p>
              ))}
            </>
          )}

          {c.notable_features && (
            <>
              <TomeHeading>Notable Features</TomeHeading>
              <p>{c.notable_features}</p>
            </>
          )}

          {c.npcs && (
            <>
              <TomeHeading>Notable Figures</TomeHeading>
              <p>{c.npcs}</p>
            </>
          )}

          {history.length > 0 && (
            <>
              <TomeHeading>History &amp; Lore</TomeHeading>
              {history.map((p, i) => <p key={i}>{p}</p>)}
            </>
          )}

          {hooks.length > 0 && (
            <>
              <TomeHeading>Adventure Hooks</TomeHeading>
              <ol className="hooks">
                {hooks.map((h, i) => <li key={i}>{h}</li>)}
              </ol>
            </>
          )}

          {rumors.length > 0 && (
            <>
              <TomeHeading>Rumours &amp; Whispers</TomeHeading>
              <ol className="hooks">
                {rumors.map((r, i) => <li key={i}>{r}</li>)}
              </ol>
            </>
          )}
        </div>
      </div>

      <MountainSketch className="footer-mtn" width={150} />
      <CompassRose className="footer-compass" size={78} />
    </PageShell>
  )
}

/* ============================================================
   RESULT PAGE — routes to the correct layout
   ============================================================ */
export default function TomePage({ item }: { item: GeneratedItem }) {
  const cat = item.category?.toLowerCase()
  if (cat === 'monster')  return <MonsterPage item={item} />
  if (cat === 'npc')      return <NpcPage item={item} />
  if (cat === 'location') return <LocationPage item={item} />
  return <ItemPage item={item} />
}
