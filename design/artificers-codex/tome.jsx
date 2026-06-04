/* tome.jsx — the illuminated result pages */
const { useState, useEffect, useRef } = React;
const { CornerFlourish, Fleuron, FleuronMark, CompassRose, MountainSketch, CategoryGlyph } = window;

function accentVars(rarity){
  const r = (window.RARITIES[rarity] || window.RARITIES.common);
  return { '--accent':'#6a1d15', '--accent-bright':'#9c2a1e',
           '--rarity': r.accent, '--rarity-bright': r.bright };
}
function isLux(rarity){ return rarity==='legendary' || rarity==='artifact'; }

/* heading with fleuron rule, matches sourcebook small-caps style */
function Heading({ children }){
  return (
    <div className="heading-rule">
      <h3 className="section-h">{children}</h3>
      <span className="line" />
    </div>
  );
}
/* page shell shared by every layout */
function PageShell({ rarity, page, children, lux }){
  return (
    <div className={'tome-page parchment parch-edge ' + (lux?'lux':'')} style={accentVars(rarity)}>
      <div className="corner tl"><CornerFlourish/></div>
      <div className="corner tr"><CornerFlourish/></div>
      <div className="corner bl"><CornerFlourish/></div>
      <div className="corner br"><CornerFlourish/></div>
      <div className="gilt" />
      <div className="tome-inner">{children}</div>
      <div className="page-no display">{'\u2014 '+page+' \u2014'}</div>
    </div>
  );
}

/* title block */
function TitleBlock({ name, subtitle, rarity, lux }){
  const r = window.RARITIES[rarity] || window.RARITIES.common;
  const showSeal = rarity !== 'common';
  return (
    <header className="title-block">
      {showSeal && <div className={'title-seal seal'+(lux?' lux-seal':'')}>{r.label}</div>}
      <h1 className="tome-title display">{name}</h1>
      {subtitle && <h2 className="tome-sub display">{subtitle}</h2>}
    </header>
  );
}

/* art: real image (multiply) or a user-fillable slot */
function Art({ src, alt, shape='rect' }){
  if(src && src.startsWith('assets/slot-')){
    return <image-slot id={src.replace('assets/','')} className="art-slot"
             shape={shape} placeholder={'Drop '+alt}></image-slot>;
  }
  return <img className="art-img" src={src} alt={alt} />;
}

/* ============ ITEM / WEAPON / ARTIFACT / LOCATION ============ */
function ItemPage({ e }){
  const r = window.RARITIES[e.rarity] || window.RARITIES.common;
  const lux = isLux(e.rarity);
  return (
    <PageShell rarity={e.rarity} page={e.page} lux={lux}>
      <TitleBlock name={e.name} subtitle={e.subtitle} rarity={e.rarity} lux={lux} />
      <Fleuron />
      <p className="typeline">
        {e.typeLabel}<span className="sep">&#9670;</span>{r.label}
        <br/>Requires Attunement: {e.attunement}
      </p>

      <div className="item-grid">
        <div className="col col-left body-col">
          <Heading>Physical Description</Heading>
          {e.physical.map((p,i)=><p key={i} className={i===0?'dropcap':''}>{p}</p>)}
          <Heading>Properties</Heading>
          <p>{e.properties}</p>
          <Heading>Special Abilities</Heading>
          {e.abilities.map((a,i)=>(
            <p key={i} className="ability"><b>{a.name}</b> {a.desc}</p>
          ))}
          <div className="flavor-block">
            <FleuronMark size={34}/>
            <p className="flavor">{e.flavor}</p>
            <FleuronMark size={34}/>
          </div>
        </div>

        <div className="col col-img">
          <div className="art-wrap">
            <Art src={e.image} alt={e.imageAlt}/>
          </div>
        </div>

        <div className="col col-right body-col">
          <Heading>Lore &amp; History</Heading>
          {e.lore.map((p,i)=><p key={i}>{p}</p>)}
          <Heading>Special Conditions</Heading>
          <p>{e.conditions}</p>
        </div>
      </div>

      <MountainSketch className="footer-mtn" width={170}/>
      <CompassRose className="footer-compass" size={84}/>
    </PageShell>
  );
}

/* ============ MONSTER (stat block) ============ */
function AbilityScore({ label, score }){
  const mod = Math.floor((score-10)/2);
  const ms = (mod>=0?'+':'') + mod;
  return (
    <div className="abscore">
      <div className="abscore-l display">{label}</div>
      <div className="abscore-v">{score} ({ms})</div>
    </div>
  );
}
function MonsterPage({ e }){
  return (
    <PageShell rarity={e.rarity} page={e.page}>
      <TitleBlock name={e.name} subtitle={e.subtitle} rarity={e.rarity} />
      <Fleuron />
      <p className="typeline" style={{textAlign:'left'}}>{e.meta}<span className="sep">&#9670;</span>Challenge {e.cr} ({e.xp} XP)</p>

      <div className="monster-grid">
        <div className="col-art">
          <div className="art-wrap tall"><Art src={e.image} alt="creature portrait" shape="rounded"/></div>
          <div className="body-col">
            <Heading>Lore &amp; History</Heading>
            {e.lore.map((p,i)=><p key={i}>{p}</p>)}
          </div>
        </div>

        <div className="statblock">
          <div className="sb-bar" />
          <div className="sb-inner">
            <div className="sb-meta">
              <p><b>Armor Class</b> {e.ac}</p>
              <p><b>Hit Points</b> {e.hp}</p>
              <p><b>Speed</b> {e.speed}</p>
            </div>
            <div className="sb-rule" />
            <div className="ability-row">
              {['str','dex','con','int','wis','cha'].map(k=>
                <AbilityScore key={k} label={k.toUpperCase()} score={e.abilities[k]} />)}
            </div>
            <div className="sb-rule" />
            <div className="sb-meta">
              <p><b>Saving Throws</b> {e.saves}</p>
              <p><b>Skills</b> {e.skills}</p>
              <p><b>Damage Resistances</b> {e.resist}</p>
              <p><b>Senses</b> {e.senses}</p>
              <p><b>Languages</b> {e.langs}</p>
              <p><b>Challenge</b> {e.cr} ({e.xp} XP)</p>
            </div>
            <div className="sb-rule" />
            {e.traits.map((t,i)=><p key={i} className="sb-trait"><b><i>{t.name}</i></b> {t.desc}</p>)}
            <h3 className="sb-actions display">Actions</h3>
            {e.actions.map((a,i)=><p key={i} className="sb-trait"><b><i>{a.name}</i></b> {a.desc}</p>)}
          </div>
          <div className="sb-bar" />
        </div>
      </div>

      <CompassRose className="footer-compass" size={78}/>
    </PageShell>
  );
}

/* ============ NPC (dossier) ============ */
function NpcPage({ e }){
  return (
    <PageShell rarity={e.rarity} page={e.page}>
      <TitleBlock name={e.name} subtitle={e.subtitle} rarity={e.rarity} />
      <Fleuron />
      <p className="typeline" style={{textAlign:'left'}}>{e.meta}</p>

      <div className="npc-grid">
        <div className="npc-aside">
          <div className="portrait-frame">
            <Art src={e.image} alt="character portrait" shape="rect"/>
          </div>
          <div className="trait-panel">
            {e.traits.map((t,i)=>(
              <p key={i} className="npc-trait"><b>{t.name}</b> {t.desc}</p>
            ))}
          </div>
        </div>

        <div className="npc-main body-col">
          <Heading>Description</Heading>
          {e.description.map((p,i)=><p key={i} className={i===0?'dropcap':''}>{p}</p>)}
          <Heading>Backstory</Heading>
          {e.backstory.map((p,i)=><p key={i}>{p}</p>)}
          <Heading>Adventure Hooks</Heading>
          <ol className="hooks">
            {e.hooks.map((h,i)=><li key={i}>{h}</li>)}
          </ol>
        </div>
      </div>

      <MountainSketch className="footer-mtn" width={150}/>
      <CompassRose className="footer-compass" size={78}/>
    </PageShell>
  );
}

function ResultPage({ e }){
  if(e.layout==='monster') return <MonsterPage e={e} />;
  if(e.layout==='npc') return <NpcPage e={e} />;
  return <ItemPage e={e} />;
}

Object.assign(window,{ ResultPage, ItemPage, MonsterPage, NpcPage });
