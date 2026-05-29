# The Artificer's Codex

An AI-powered D&D content generator with an illuminated-sourcebook interface. Choose a category, describe what you want, and the Codex conjures a weapon, monster, NPC, artifact, or location — complete with Sword Coast lore, a pen-and-ink illustration, and a page styled like a hand-tinted fantasy sourcebook.

Built on a RAG pipeline: a ChromaDB vector store holds your source material; each generation retrieves the most relevant reference items, passes them to Claude as context, and returns a fully-structured result saved to PostgreSQL.

**Part of a three-project RAG portfolio:**
1. **The Artificer's Codex** (this repo) — v1, LlamaIndex + ChromaDB
2. [Sword Coast RAG Query Engine](https://github.com/bradhinkel/rag-query-engine) — architectural prototype, pgvector + pluggable parsers
3. [Government Regulation Query](https://github.com/bradhinkel/gov-regulation-query) — production-ready, specialized domain

## Links

- **Live system:** [dnd.bradhinkel.com](https://dnd.bradhinkel.com)
- **Project background:** [bradhinkel.com](https://bradhinkel.com) → *Projects*

---

## Stack

| Layer | Tech |
|---|---|
| Backend | Python, FastAPI, LlamaIndex, ChromaDB |
| LLM | Anthropic Claude (Sonnet for generation, Haiku for retrieval) |
| Embeddings | OpenAI `text-embedding-3-small` |
| Images | OpenAI `gpt-image-1` (portrait PNG, transparent background) |
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Storage | PostgreSQL (generated items) + ChromaDB (vectors) + local disk (images) |
| Document ingest | `python-docx` |

---

## Local setup

### Prerequisites

- Python 3.10+, Node.js 18+
- PostgreSQL (or a Postgres-compatible DB — TimescaleDB works)
- API keys for [OpenAI](https://platform.openai.com/) and [Anthropic](https://console.anthropic.com/)

### 1. Clone and install

```bash
git clone https://github.com/bradhinkel/dnd-knowledge-base.git
cd dnd-knowledge-base

# Python dependencies (use a venv)
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt

# Node dependencies
cd frontend && npm install && cd ..
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
OPENAI_API_KEY=sk-...          # embeddings + image generation
ANTHROPIC_API_KEY=sk-ant-...   # content generation (Claude)

DATABASE_URL=postgresql://dnd_app:password@localhost:5432/dnd_generator
CHROMA_DB_PATH=/tmp/dnd-chroma  # where to store the vector index
IMAGES_DIR=/tmp/dnd-images      # where to store generated PNGs

# Image generation (set to gpt-image-1 to enable; leave blank to skip)
IMAGE_MODEL=gpt-image-1
IMAGE_PROXY=true                # route images through Next.js proxy (local dev)

BASE_URL=http://localhost:3001
BACKEND_URL=http://localhost:8001
NEXT_PUBLIC_API_URL=/api
```

> **WSL users:** Add `networkingMode=mirrored` to `~/.wslconfig` so
> `localhost` in Windows reaches WSL services without port-proxy setup.

### 3. Create the database

```bash
# PostgreSQL
psql -U postgres -c "CREATE USER dnd_app WITH PASSWORD 'your_password';"
psql -U postgres -c "CREATE DATABASE dnd_generator OWNER dnd_app;"
```

### 4. Populate the knowledge base

The repo includes sample documents in `data/Weapons/`, `data/Characters/`, etc. (files prefixed `Sample_`). These are original LLM-generated content safe to use and share.

To ingest them:

```bash
source .venv/bin/activate
python src/ingest.py
```

To generate additional samples using Claude:

```bash
python src/generate_samples.py          # 10 items per category
python src/generate_samples.py --count 20 --category weapon
```

The generator creates `.docx` files in the correct `data/<Category>/` directories and names them `Sample_<Category>_BatchN.docx`. Re-run `ingest.py` after adding new files.

To use your own source material, place `.docx` files in the appropriate category directory and run `ingest.py`. The ingest script parses tables, paragraphs, and headings from Word documents.

### 5. Run the app

In two separate terminals (or WSL tabs):

```bash
# Terminal 1 — backend on port 8001
bash start-backend.sh

# Terminal 2 — frontend on port 3001
bash start-frontend.sh
```

Open **http://localhost:3001**.

> Port 3001 is used because 3000 is often taken by other services (Docker Desktop, Grafana, etc.).

---

## Project structure

```
dnd-knowledge-base/
├── backend/              FastAPI app
│   ├── main.py           Entry point, CORS, static file mount
│   ├── models/schemas.py Pydantic request/response models (with input length limits)
│   ├── routes/           generate.py (SSE streaming), gallery.py, images.py
│   └── services/
│       ├── db_service.py PostgreSQL persistence (asyncpg)
│       ├── image_service.py gpt-image-1 generation + Pillow padding
│       └── rag_service.py  Wraps src/generate.py for async use
│
├── src/                  RAG pipeline (category-agnostic)
│   ├── generate.py       LLM call with RAG context; JSON → Pydantic validation
│   ├── ingest.py         .docx → ChromaDB embeddings
│   ├── query.py          Category-filtered ChromaDB retrieval
│   ├── generate_samples.py  Generate synthetic sample docs via Claude
│   ├── prompts/          Per-category system prompts (include image_prompt guidance)
│   └── schemas/          Pydantic output schemas per category
│
├── frontend/             Next.js 14 app
│   ├── app/
│   │   ├── page.tsx          Scribe's Desk (generator UI)
│   │   ├── gallery/page.tsx  The Compendium (browsable item gallery)
│   │   ├── item/[id]/page.tsx Illuminated tome page (item detail)
│   │   ├── globals.css       Full parchment design system
│   │   └── api/[...path]/    Proxy: forwards /api/* → backend:8001
│   └── components/
│       ├── TomePage.tsx      Three tome layouts (Item, Monster, NPC/Location)
│       ├── Ornaments.tsx     SVG decorative elements (corners, fleurons, rune rings)
│       ├── PageShell.tsx     Shared parchment page frame + rarity system
│       ├── ConjuringRitual.tsx  Loading overlay (animated rune rings + embers)
│       ├── TomeBar.tsx       Sticky top bar (Bind / Inscribe / Compendium)
│       ├── CategorySelector.tsx  5-emblem category picker
│       └── GeneratorForm.tsx    Ink-line form fields
│
├── data/                 Source documents for the knowledge base
│   ├── Weapons/          .docx files (Sample_*.docx included; add your own)
│   ├── Characters/
│   ├── Locations/
│   ├── Monsters/
│   └── Artifacts/
│
├── start-frontend.sh     Convenience launcher (sets nvm PATH, runs npm dev)
├── start-backend.sh      Convenience launcher (activates .venv, runs uvicorn)
└── .env.example          Environment variable template
```

---

## Key design decisions

**Illuminated tome UI** — The interface is styled as an aged parchment sourcebook. Parchment texture is pure CSS (layered radial gradients + SVG noise overlay). Category icons, corner flourishes, fleurons, compass roses, and rune rings are all inline SVG in `Ornaments.tsx` — no raster assets.

**Image rendering** — `gpt-image-1` generates 1024×1536 portrait PNGs with a transparent background. The backend adds 10% transparent padding on each side (via Pillow) so the subject never touches the frame edge. In the browser, `mix-blend-mode: multiply` on the `<img>` makes the illustration's warm background disappear into the parchment surface.

**Image proxy** — In local dev, generated images are served by FastAPI at `/static/images/`. Setting `IMAGE_PROXY=true` makes `image_service.py` store relative URLs (`/api/static/images/uuid.png`) instead of absolute ones. Next.js proxies `/api/*` to the backend, so the browser only ever needs to reach the frontend.

**Input validation** — Free-text inputs are limited to 120 characters on both the frontend (`maxLength` attribute) and backend (Pydantic `Field(max_length=120)`). This is the first line of defense against prompt injection.

**SSE streaming** — Generation uses Server-Sent Events (`POST /generate/{category}/stream`). The frontend streams status messages into the Conjuring Ritual overlay in real time, then routes to `/item/{id}` on `event: done`.

---

## Adding a new category

1. Add a Pydantic schema in `src/schemas/`
2. Add a system prompt in `src/prompts/`
3. Register both in `src/schemas/__init__.py` and `src/prompts/__init__.py`
4. Add the category to `VALID_CATEGORIES` in `backend/routes/generate.py`
5. Add a layout component in `frontend/components/TomePage.tsx`
6. Add category fields to `CATEGORY_FIELDS` in `frontend/components/GeneratorForm.tsx`
7. Add a glyph case to `CategoryGlyph` in `frontend/components/Ornaments.tsx`

---

## Requirements & licenses

Released under the **MIT License** — see `LICENSE`.

The MIT license covers the pipeline code only, not any source documents you ingest or output generated from copyrighted input.

**Python dependencies:** LlamaIndex (MIT), ChromaDB (Apache-2.0), FastAPI (MIT), Anthropic SDK (MIT), OpenAI SDK (Apache-2.0), Pydantic (MIT), python-docx (MIT), Pillow (HPND), python-dotenv (BSD-3), Rich (MIT).

**Frontend dependencies:** Next.js (MIT), React (MIT), TypeScript (Apache-2.0), Tailwind CSS (MIT).

**Source documents:** Any `.docx` files you place in `data/` are your own responsibility. The `Sample_*.docx` files included in the repo are original content generated by Claude and are covered by the MIT license.
