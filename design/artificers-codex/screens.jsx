/* screens.jsx — Scribe's Desk, Conjuring ritual, Compendium, chrome */
const { useState: uS, useEffect: uE, useRef: uR } = React;
const { CornerFlourish: CF, Fleuron: FL, FleuronMark: FM, RuneRing, CompassRose: CR,
        CategoryGlyph: CG, MountainSketch: MS } = window;

/* floating embers field */
function Embers({ count=26 }){
  const items = uR(null);
  if(!items.current){
    items.current = [...Array(count)].map(()=>({
      l: Math.random()*100, d: Math.random()*6, dur: 4+Math.random()*5,
      s: 2+Math.random()*4, o: .3+Math.random()*.6,
    }));
  }
  return (
    <div className="embers" aria-hidden="true">
      {items.current.map((e,i)=>(
        <span key={i} style={{ left:e.l+'%', width:e.s, height:e.s, opacity:e.o,
          animationDelay:e.d+'s', animationDuration:e.dur+'s' }} />
      ))}
    </div>
  );
}

/* ============ SCRIBE'S DESK (generator) ============ */
function ScribesDesk({ onGenerate, onOpenCompendium, savedCount, showEmbers=true }){
  const CATS = window.CATEGORIES;
  const [cat, setCat] = uS('weapon');
  const [vals, setVals] = uS({});
  const active = CATS.find(c=>c.id===cat);

  uE(()=>{ setVals({}); }, [cat]);

  function submit(e){ e.preventDefault(); onGenerate(cat, vals); }

  return (
    <div className="stage desk-stage">
      {showEmbers && <Embers count={18}/>}
      <div className="desk-panel parchment parch-edge">
        <div className="corner tl"><CF/></div>
        <div className="corner tr"><CF/></div>
        <div className="corner bl"><CF/></div>
        <div className="corner br"><CF/></div>
        <div className="gilt" />
        <div className="tome-inner desk-inner">
          <p className="eyebrow desk-eyebrow">A Dungeon Master&rsquo;s Workshop</p>
          <h1 className="codex-wordmark">The Artificer&rsquo;s Codex</h1>
          <FL />
          <p className="desk-lede">
            Name a thing, and the archives will conjure it &mdash; weapons, wanderers,
            monsters and relics, each set down as a page of the great book.
          </p>

          <p className="field-legend">Choose a Discipline</p>
          <div className="cat-row">
            {CATS.map(c=>(
              <button key={c.id} type="button"
                className={'cat-card'+(cat===c.id?' on':'')}
                onClick={()=>setCat(c.id)}>
                <span className="cat-ico"><CG kind={c.id} size={28}/></span>
                <span className="cat-label display">{c.label}</span>
                <span className="cat-tag">{c.tagline}</span>
              </button>
            ))}
          </div>

          <form onSubmit={submit}>
            <div className="field-grid">
              {active.fields.map(f=>(
                <div className="field" key={f.name}>
                  <label>{f.label}</label>
                  {f.type==='select' ? (
                    <select value={vals[f.name]||''}
                      onChange={e=>setVals(v=>({...v,[f.name]:e.target.value}))}>
                      <option value="">Any</option>
                      {f.options.map(o=><option key={o} value={o.toLowerCase()}>{o}</option>)}
                    </select>
                  ) : (
                    <input type="text" placeholder={f.placeholder}
                      value={vals[f.name]||''}
                      onChange={e=>setVals(v=>({...v,[f.name]:e.target.value}))}/>
                  )}
                </div>
              ))}
            </div>

            <div className="desk-actions">
              <button type="submit" className="conjure-btn">
                <span className="cb-ring" aria-hidden="true"></span>
                <span className="cb-label display">Conjure</span>
              </button>
              <button type="button" className="btn ghost" onClick={onOpenCompendium}>
                The Compendium{savedCount>0 ? ' \u00b7 '+savedCount : ''}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ============ CONJURING RITUAL ============ */
const RITUAL_STEPS = [
  'Consulting the archives\u2026',
  'Sifting ash, ember, and lore\u2026',
  'Weighing rarity and renown\u2026',
  'Inscribing the page in gilt\u2026',
];
function Conjuring(){
  const [step, setStep] = uS(0);
  uE(()=>{
    const t = setInterval(()=> setStep(s => Math.min(s+1, RITUAL_STEPS.length-1)), 850);
    return ()=> clearInterval(t);
  },[]);
  return (
    <div className="ritual">
      <Embers count={34}/>
      <div className="ritual-core">
        <div className="ring-stack">
          <div className="ring r1"><RuneRing size={300}/></div>
          <div className="ring r2"><RuneRing size={210}/></div>
          <div className="ring-glow" />
        </div>
        <p className="ritual-status" key={step}>{RITUAL_STEPS[step]}</p>
        <FM size={40} color="var(--gold)"/>
      </div>
    </div>
  );
}

/* ============ COMPENDIUM (gallery) ============ */
function Compendium({ entries, onOpen, onBack }){
  return (
    <div className="stage comp-stage">
      <div className="comp-wrap">
        <header className="comp-head">
          <h1 className="codex-wordmark sm">The Compendium</h1>
          <FL />
          <p className="desk-lede">{entries.length} {entries.length===1?'entry':'entries'} bound into the book.</p>
        </header>
        <div className="comp-grid">
          {entries.map((e,i)=>{
            const r = window.RARITIES[e.rarity]||window.RARITIES.common;
            return (
              <button key={i} className="comp-card parchment" style={{'--accent':r.accent,'--accent-bright':r.bright,'--rarity':r.accent,'--rarity-bright':r.bright}}
                onClick={()=>onOpen(e)}>
                <div className="comp-card-edge" />
                <span className="comp-emblem"><CG kind={e.cat||e.id} size={34}/></span>
                <span className="comp-name display">{e.name}</span>
                <span className="comp-sub">{e.subtitle}</span>
                <span className="rarity-tag comp-rarity"><span className="dot"/>{r.label}</span>
                <span className="comp-page display">{'p. '+e.page}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ============ TOP BAR ============ */
function CodexBar({ onBack, backLabel, actions }){
  return (
    <div className="codex-bar no-print">
      <button className="bar-btn" onClick={onBack}>
        <span className="bar-arrow">&larr;</span> {backLabel}
      </button>
      <span className="bar-mark">The Artificer&rsquo;s Codex</span>
      <div className="bar-actions">{actions}</div>
    </div>
  );
}

Object.assign(window,{ ScribesDesk, Conjuring, Compendium, CodexBar, Embers });
