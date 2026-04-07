"""
query.py — Category-aware retrieval engine for the D&D knowledge base.

Wraps LlamaIndex's retrieval with ChromaDB metadata filtering so that
queries for weapons only retrieve weapons, artifacts only artifacts, etc.
"""

from pathlib import Path

import chromadb
from dotenv import load_dotenv
from llama_index.core import Settings, VectorStoreIndex
from llama_index.core.vector_stores import MetadataFilters, ExactMatchFilter
from llama_index.embeddings.openai import OpenAIEmbedding
from llama_index.vector_stores.chroma import ChromaVectorStore

load_dotenv()

PROJECT_ROOT = Path(__file__).resolve().parent.parent
CHROMA_PATH = PROJECT_ROOT / "chroma_db"
COLLECTION_NAME = "dnd_knowledge"


def _get_index() -> VectorStoreIndex:
    """Load the existing ChromaDB collection and return a VectorStoreIndex."""
    chroma_client = chromadb.PersistentClient(path=str(CHROMA_PATH))
    chroma_collection = chroma_client.get_or_create_collection(COLLECTION_NAME)

    vector_store = ChromaVectorStore(chroma_collection=chroma_collection)

    Settings.embed_model = OpenAIEmbedding(model="text-embedding-3-small")
    Settings.llm = None

    return VectorStoreIndex.from_vector_store(vector_store)


def query_by_category(
    category: str,
    query_text: str,
    top_k: int = 5,
) -> list:
    """
    Retrieve the top_k most similar items from the knowledge base,
    filtered to the given category.

    Returns a list of LlamaIndex NodeWithScore objects.
    """
    index = _get_index()

    filters = MetadataFilters(filters=[
        ExactMatchFilter(key="category", value=category)
    ])

    retriever = index.as_retriever(
        similarity_top_k=top_k,
        filters=filters,
    )

    results = retriever.retrieve(query_text)
    return results


def query_all(query_text: str, top_k: int = 6) -> list:
    """Retrieve from all categories (no metadata filter)."""
    index = _get_index()
    retriever = index.as_retriever(similarity_top_k=top_k)
    return retriever.retrieve(query_text)
