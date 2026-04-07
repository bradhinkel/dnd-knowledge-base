"""
eval/src/ingest.py — Config-driven ingestion for evaluation.

Imports parsers from the main project's src/ingest.py, then chunks and embeds
into a per-config ChromaDB collection using the settings from a YAML config file.

Usage:
    python eval/src/ingest.py --config eval/configs/baseline.yaml
    python eval/src/ingest.py --config eval/configs/phase1_filter_on.yaml
"""

import argparse
import sys
import os
import time
import yaml
import chromadb

# Allow imports from the project root's src/ directory
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", ".."))

from src.ingest import (
    EXTRACTORS,
    TEXT_CONVERTERS,
    CATEGORY_DIRS,
    DATA_DIR,
)

from llama_index.core import Document, VectorStoreIndex, StorageContext
from llama_index.vector_stores.chroma import ChromaVectorStore
from llama_index.core.node_parser import SentenceSplitter
from llama_index.embeddings.openai import OpenAIEmbedding


CHROMA_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "chroma_eval")


def load_config(config_path: str) -> dict:
    with open(config_path) as f:
        return yaml.safe_load(f)


def get_embedding_model(config: dict):
    model_name = config["embedding"]["model"]
    if model_name.startswith("text-embedding-"):
        return OpenAIEmbedding(model=model_name)
    else:
        # HuggingFace local model (e.g. BAAI/bge-small-en-v1.5)
        try:
            from llama_index.embeddings.huggingface import HuggingFaceEmbedding
        except ImportError:
            raise ImportError(
                "llama-index-embeddings-huggingface is required for BGE models. "
                "Install with: pip install llama-index-embeddings-huggingface"
            )
        return HuggingFaceEmbedding(model_name=model_name)


def collection_name(config: dict) -> str:
    return f"dnd_eval_{config['name']}"


def ingest(config_path: str, data_dir: str, force: bool = False):
    config = load_config(config_path)
    col_name = collection_name(config)
    chunk_size = config["chunking"]["size"]
    chunk_overlap = config["chunking"]["overlap"]
    embed_model = get_embedding_model(config)

    print(f"[ingest] Config:     {config['name']}")
    print(f"[ingest] Collection: {col_name}")
    print(f"[ingest] Chunk:      size={chunk_size} overlap={chunk_overlap}")
    print(f"[ingest] Embedding:  {config['embedding']['model']}")

    client = chromadb.PersistentClient(path=CHROMA_PATH)

    existing = [c.name for c in client.list_collections()]
    if col_name in existing:
        if force:
            print(f"[ingest] Deleting existing collection '{col_name}' (--force)")
            client.delete_collection(col_name)
        else:
            print(f"[ingest] Collection '{col_name}' already exists. Use --force to re-ingest.")
            return

    collection = client.get_or_create_collection(col_name)

    # Load raw documents using the main project parsers
    documents = []
    for category, extractor_fn in EXTRACTORS.items():
        cat_dir = os.path.join(data_dir, CATEGORY_DIRS[category])
        if not os.path.isdir(cat_dir):
            print(f"[ingest] Skipping '{category}': directory not found at {cat_dir}")
            continue

        converter_fn = TEXT_CONVERTERS[category]
        from pathlib import Path
        docx_files = sorted(Path(cat_dir).glob("*.docx"))
        for docx_path in docx_files:
            items = extractor_fn(docx_path)
            for item in items:
                text = converter_fn(item)
                doc = Document(
                    text=text,
                    metadata={"category": category, "source": item.get("name", "unknown")},
                )
                documents.append(doc)

    print(f"[ingest] Loaded {len(documents)} documents across all categories")

    # Chunk
    splitter = SentenceSplitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
    nodes = splitter.get_nodes_from_documents(documents)
    print(f"[ingest] Created {len(nodes)} chunks")

    # Build index
    t0 = time.time()
    vector_store = ChromaVectorStore(chroma_collection=collection)
    storage_context = StorageContext.from_defaults(vector_store=vector_store)
    index = VectorStoreIndex(
        nodes,
        storage_context=storage_context,
        embed_model=embed_model,
    )
    elapsed = time.time() - t0
    print(f"[ingest] Embedded and stored in {elapsed:.1f}s")
    print(f"[ingest] Done. Collection '{col_name}' is ready.")
    return index


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Ingest corpus for a given eval config")
    parser.add_argument("--config", required=True, help="Path to YAML config file")
    parser.add_argument(
        "--data-dir",
        default=str(DATA_DIR),
        help="Path to the corpus data directory (default: project data/)",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Delete and re-ingest if collection already exists",
    )
    args = parser.parse_args()
    ingest(args.config, args.data_dir, force=args.force)
