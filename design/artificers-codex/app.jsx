/* app.jsx — state machine + tweaks wiring */
const { useState: aUS, useEffect: aUE } = React;
const { ScribesDesk, Conjuring, Compendium, CodexBar, ResultPage } = window;
const { useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakSlider, TweakToggle } = window;

const TONES = {
  Aged: { '--parch':'#e9dcbd','--parch-hi':'#f3e9d2','--parch-lo':'#d2bd91','--parch-edge':'#b39a68' },
  Bone: { '--parch':'#efe7d2','--parch-hi':'#f8f2e2','--parch-lo':'#ddd0b2','--parch-edge':'#c3b591' },
  Tan:  { '--parch':'#ddc9a0','--parch-hi':'#ecdcbb','--parch-lo':'#c4a978','--parch-edge':'#a3865a' },
};
const FONTS = {
  Trajan:  "'Cinzel', Georgia, serif",
  Ornate:  "'Cinzel Decorative','Cinzel',serif",
  Fell:    "'IM Fell English SC','EB Garamond',serif",
};

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "tone": "Aged",
  "headingFont": "Trajan",
  "grain": 10,
  "embers": true,
  "corners": true
}/*EDITMODE-END*/;

function AboutBox(){
  return (
    <section className="about-box">
      <div className="parchment parch-edge about-sheet">
        <div className="about-head">
          <div>
            <div className="eyebrow">Found in the Sword Coast</div>
            <h2 className="section-h">The Artificer's Codex</h2>
          </div>
        </div>

        <div className="about-content">
          <div className="body-col dropcap">
            <figure className="about-portrait">
              <img src="Yodarb druid sage.png" alt="YoDarb, Druid Sage" />
              <figcaption>YoDarb — Druid Sage</figcaption>
            </figure>
            <p>The codex is written as if recovered from the misty libraries of the Sword Coast. It tells of enchanted searches, old map sigils, and the lore behind every conjured weapon, artifact, monster, and location. Each entry is a page of discovery, as if the item generator had been found in a wizard's study rather than on a screen.</p>
            <p>Built as a design prototype for <b>bradhinkel/dnd-knowledge-base</b>, this tool blends parchment aesthetics with modern interaction. The magic behind the searches is powered by <b>Claude Code</b>, whose arcane logic turns campaign prompts into collectible codex entries.</p>
          </div>

          <div className="about-meta">
            <div className="about-stat">
              <strong>Project</strong>
              <span>A D&D item generator redesign that presents results as an illuminated codex page.</span>
            </div>
            <div className="about-stat">
              <strong>GitHub</strong>
              <a href="https://github.com/bradhinkel/dnd-knowledge-base" target="_blank" rel="noreferrer">github.com/bradhinkel/dnd-knowledge-base</a>
            </div>
            <div className="about-stat">
              <strong>Author</strong>
              <span>YoDarb (bradhinkel.com) — Druid Sage</span>
            </div>
            <div className="about-stat">
              <strong>Acknowledgement</strong>
              <span>Claude Code for the search enchantments and item lore synthesis.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function App(){
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [view, setView] = aUS('desk');         // desk | result | compendium
  const [conjuring, setConjuring] = aUS(false);
  const [entry, setEntry] = aUS(null);
  const [saved, setSaved] = aUS(()=>{
    const E = window.ENTRIES;
    return [E.weapon, E.npc, E.monster, E.artifact, E.location];
  });
  const [bound, setBound] = aUS(false);

  function generate(cat, params){
    const base = window.ENTRIES[cat];
    const e = JSON.parse(JSON.stringify(base));
    e.cat = cat;
    if(params.rarity && window.RARITIES[params.rarity]) e.rarity = params.rarity;
    if(params.cr) { e.cr = params.cr; }
    if(cat==='weapon' && params.type){
      e.typeLabel = 'Weapon ('+params.type.replace(/\b\w/g,c=>c.toUpperCase())+')';
    }
    setConjuring(true);
    setBound(false);
    setTimeout(()=>{
      setEntry(e); setView('result'); setConjuring(false);
      window.scrollTo(0,0);
    }, 3500);
  }

  function openEntry(e){ setEntry(e); setBound(saved.some(s=>s.name===e.name)); setView('result'); window.scrollTo(0,0); }
  function bind(){
    if(!entry) return;
    setSaved(s => s.some(x=>x.name===entry.name) ? s : [entry, ...s]);
    setBound(true);
  }

  const rootStyle = { ...(TONES[t.tone]||TONES.Aged), '--display':(FONTS[t.headingFont]||FONTS.Trajan),
    '--grain': (t.grain/100) };
  const rootClass = 'room' + (t.corners ? '' : ' no-corners');

  return (
    <div className={rootClass} style={rootStyle}>
      {view==='desk' && (
        <>
          <ScribesDesk onGenerate={generate}
            onOpenCompendium={()=>{ setView('compendium'); window.scrollTo(0,0); }}
            savedCount={saved.length} showEmbers={t.embers} />
          <AboutBox />
        </>
      )}

      {view==='result' && entry && (
        <>
          <CodexBar onBack={()=>setView('desk')} backLabel="The Workshop"
            actions={<>
              <button className="bar-action" onClick={bind}>{bound?'\u2713 Bound':'Bind to Compendium'}</button>
              <button className="bar-action" onClick={()=>window.print()}>Inscribe</button>
              <button className="bar-action" onClick={()=>{ setView('compendium'); window.scrollTo(0,0); }}>Compendium</button>
            </>} />
          <div className="reveal"><ResultPage e={entry} /></div>
        </>
      )}

      {view==='compendium' && (
        <>
          <CodexBar onBack={()=>setView('desk')} backLabel="The Workshop"
            actions={<button className="bar-action" onClick={()=>setView('desk')}>Conjure New</button>} />
          <Compendium entries={saved} onOpen={openEntry} onBack={()=>setView('desk')} />
        </>
      )}

      {conjuring && <Conjuring />}

      <TweaksPanel>
        <TweakSection label="Parchment" />
        <TweakRadio label="Tone" value={t.tone} options={['Aged','Bone','Tan']}
          onChange={v=>setTweak('tone', v)} />
        <TweakSlider label="Grain" value={t.grain} min={0} max={26} unit="%"
          onChange={v=>setTweak('grain', v)} />
        <TweakSection label="Lettering" />
        <TweakRadio label="Headings" value={t.headingFont} options={['Trajan','Ornate','Fell']}
          onChange={v=>setTweak('headingFont', v)} />
        <TweakSection label="Atmosphere" />
        <TweakToggle label="Drifting embers" value={t.embers} onChange={v=>setTweak('embers', v)} />
        <TweakToggle label="Corner flourishes" value={t.corners} onChange={v=>setTweak('corners', v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
