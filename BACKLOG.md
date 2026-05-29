# The Artificer's Codex — Backlog

Items are roughly ordered by value. Nothing here is blocking; the app is fully functional without any of these.

---

## High impact

### PDF export (Inscribe)
Inscribe currently calls `window.print()`. Replace with a server-side API route that renders the tome page via Puppeteer/Playwright and returns a real `Codex-<name>.pdf`.
- Route: `GET /api/pdf/[id]`
- Set explicit page size (A4 or custom 920px), `printBackground: true`, embed Google Fonts
- `Content-Disposition: attachment; filename="Codex-<name>.pdf"`
- Reference: `design_handoff_artificers_codex/README.md` → "PDF export"

### Persist "Bind to Compendium"
The button currently only toggles local UI state. Wire it to a `saved_items` join table in PostgreSQL so the Compendium persists across sessions and devices.
- Backend: `POST /items/{id}/bind`, `DELETE /items/{id}/bind`
- Frontend: update TomeBar to fetch bind status on page load

### Expand RAG sample data
10 items per category produces adequate but repetitive context. Run `generate_samples.py --count 20` for each category and re-ingest on the droplet to improve generation variety.
```bash
python src/generate_samples.py --count 20
python src/ingest.py
```

---

## Feature additions

### Item re-conjuring
A "Re-conjure" button in TomeBar that re-runs generation with the same category and parameters — useful when a result misses the mark.
- Reuse the existing SSE streaming flow
- Store the original parameters alongside the item in the DB

### Campaign grouping
Collect items into named sets ("The Smoking Peak Campaign") for DM session prep.
- New `campaigns` + `campaign_items` tables
- UI: a "Add to Campaign" action in TomeBar, a campaign view in the Compendium

### Share / copy link
`/item/[id]` already works as a permalink. Surface a "Copy link" button in TomeBar to make sharing obvious.

---

## Technical

### Sync ChromaDB to droplet
The droplet's RAG runs on the original knowledge base. Ingest the synthetic `Sample_*.docx` files there to keep the two environments in sync.

### Image regeneration for existing items
Some items were created before the pen-and-ink image style was introduced. A backend endpoint (`POST /items/{id}/regenerate-image`) would re-run image generation for an existing saved item without re-generating the text content.

### Image CDN / caching
Generated PNGs are served directly from the droplet's disk. Moving them to an object store (S3, DigitalOcean Spaces) with a CDN in front would improve load times and reduce disk I/O on the droplet.
