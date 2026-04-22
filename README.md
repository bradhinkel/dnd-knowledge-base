# D&D Item Generator

A retrieval-augmented generation (RAG) service that generates Dungeons & Dragons content — weapons, characters, monsters, and other game items — grounded in a searchable corpus of source material.

This was the **first project** in a three-project RAG portfolio — a proof of concept that established the core pattern: retrieve relevant passages, feed them to an LLM, return structured output to the user.

**The progression:**
1. **D&D Item Generator** (this repo) — v1, LlamaIndex + ChromaDB
2. [Sword Coast RAG Query Engine](https://github.com/bradhinkel/rag-query-engine) — architectural prototype, pgvector + pluggable parsers
3. [Government Regulation Query](https://github.com/bradhinkel/gov-regulation-query) — production-ready, specialized domain

## Links

- **Live system:** [dnd.bradhinkel.com](https://dnd.bradhinkel.com)
- **Project background & case study:** [bradhinkel.com](https://bradhinkel.com) → *Projects*

## Stack

- **Backend:** Python, LlamaIndex, ChromaDB
- **Embeddings:** OpenAI
- **Generation:** Anthropic Claude
- **Frontend:** Next.js 14, TypeScript, Tailwind CSS
- **Storage:** PostgreSQL (app data) + ChromaDB (vectors) + local disk (generated images)
- **Document ingest:** `python-docx` for Word source material

## Deploy it yourself (local)

### 1. Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL
- API keys for [OpenAI](https://platform.openai.com/) and [Anthropic](https://console.anthropic.com/)
- Your own source documents (see *Source documents* below)

### 2. Clone and install

```bash
git clone https://github.com/bradhinkel/dnd-knowledge-base.git
cd dnd-knowledge-base

python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

cd frontend && npm install && cd ..
```

### 3. Configure environment

Copy the example file and fill in your keys:

```bash
cp .env.example .env
```

Edit `.env` and set:
- `OPENAI_API_KEY` and `ANTHROPIC_API_KEY`
- `DATABASE_URL` password for your local PostgreSQL
- `CHROMA_DB_PATH` — a local directory for the ChromaDB vector store
- `IMAGES_DIR` — a local directory for generated images
- `BASE_URL=http://localhost:8001` for local development

### 4. Create the database

```bash
sudo -u postgres psql -c "CREATE USER dnd_app WITH PASSWORD 'your_password_here';"
sudo -u postgres psql -c "CREATE DATABASE dnd_generator OWNER dnd_app;"
```

### 5. Source documents

**Not included.** The D&D source material used during development is copyrighted Wizards of the Coast content and is not redistributable. To run the ingest pipeline yourself you need to supply your own legally-obtained source documents. The parser expects Word (`.docx`) files.

### 6. Run the app

Backend (port 8001):

```bash
source venv/bin/activate
uvicorn backend.main:app --reload --port 8001
```

Frontend (port 3000), in a separate terminal:

```bash
cd frontend
npm run dev
```

Open http://localhost:3000.

## Requirements & licenses

### Project

Released under the **MIT License**. See `LICENSE`.

The MIT license covers **the pipeline code only**, not any source documents you ingest or any output generated from copyrighted input. Respect the copyright of your source material.

### Python dependencies (`requirements.txt`)

| Package | License |
|---|---|
| llama-index | MIT |
| llama-index-vector-stores-chroma | MIT |
| llama-index-embeddings-openai | MIT |
| llama-index-llms-anthropic | MIT |
| chromadb | Apache-2.0 |
| python-docx | MIT |
| anthropic | MIT |
| openai | Apache-2.0 |
| python-dotenv | BSD-3-Clause |
| pydantic | MIT |
| rich | MIT |
| pytest | MIT |

### Frontend dependencies (`frontend/package.json`)

| Package | Version | License |
|---|---|---|
| next | 14.2.5 | MIT |
| react / react-dom | 18.3.1 | MIT |
| typescript | 5.5.2 | Apache-2.0 |
| tailwindcss | 3.4.4 | MIT |
| autoprefixer | 10.4.19 | MIT |
| postcss | 8.4.38 | MIT |

### System dependencies

| Component | License |
|---|---|
| PostgreSQL | PostgreSQL License (permissive, BSD-like) |
| ChromaDB | Apache-2.0 |

### Data

Source documents used for development are **copyrighted Wizards of the Coast material** and are **not** included in this repository. Nothing in the MIT license grants any rights to that content. Supply your own legally-obtained source documents.
