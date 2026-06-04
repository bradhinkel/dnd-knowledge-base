export default function AboutBox() {
  return (
    <section className="about-box">
      <div className="parchment parch-edge about-sheet">
        <div className="about-head">
          <p className="eyebrow">Found in the Sword Coast</p>
          <h2 className="section-h">The Artificer&rsquo;s Codex</h2>
        </div>

        <div className="about-content">
          <div className="body-col dropcap">
            <figure className="about-portrait">
              <img src="/yodarb-druid-sage.png" alt="YoDarb, Druid Sage" />
              <figcaption>YoDarb &mdash; Druid Sage</figcaption>
            </figure>
            <p>
              The codex is written as if recovered from the misty libraries of the
              Sword Coast. It tells of enchanted searches, old map sigils, and the
              lore behind every conjured weapon, artifact, monster, and location.
              Each entry is a page of discovery, as if the item generator had been
              found in a wizard&rsquo;s study rather than on a screen.
            </p>
            <p>
              Built as a design prototype for <b>bradhinkel/dnd-knowledge-base</b>,
              this tool blends parchment aesthetics with modern interaction. The
              magic behind the searches is powered by <b>Claude Code</b>, whose
              arcane logic turns campaign prompts into collectible codex entries.
            </p>
          </div>

          <div className="about-meta">
            <div className="about-stat">
              <strong>Project</strong>
              <span>
                A D&amp;D item generator redesign that presents results as an
                illuminated codex page.
              </span>
            </div>
            <div className="about-stat">
              <strong>GitHub</strong>
              <a
                href="https://github.com/bradhinkel/dnd-knowledge-base"
                target="_blank"
                rel="noreferrer"
              >
                github.com/bradhinkel/dnd-knowledge-base
              </a>
            </div>
            <div className="about-stat">
              <strong>Author</strong>
              <span>YoDarb (bradhinkel.com) &mdash; Druid Sage</span>
            </div>
            <div className="about-stat">
              <strong>Acknowledgement</strong>
              <span>Claude Code for the search enchantments and item lore synthesis.</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
