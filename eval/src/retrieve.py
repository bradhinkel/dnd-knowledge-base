"""
eval/src/retrieve.py — Retrieval engine supporting vector, BM25, hybrid, and reranking.

Used by evaluate.py; not meant to be run standalone, but can be for quick tests.
"""

import time
from typing import Optional
import chromadb
from llama_index.vector_stores.chroma import ChromaVectorStore
from llama_index.core import VectorStoreIndex, StorageContext
from llama_index.embeddings.openai import OpenAIEmbedding


def get_embedding_model(config: dict):
    model_name = config["embedding"]["model"]
    if model_name.startswith("text-embedding-"):
        return OpenAIEmbedding(model=model_name)
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


def load_index(config: dict, chroma_path: str):
    """Load a LlamaIndex VectorStoreIndex from an existing ChromaDB collection."""
    client = chromadb.PersistentClient(path=chroma_path)
    col_name = collection_name(config)
    collection = client.get_collection(col_name)
    vector_store = ChromaVectorStore(chroma_collection=collection)
    storage_context = StorageContext.from_defaults(vector_store=vector_store)
    embed_model = get_embedding_model(config)
    index = VectorStoreIndex.from_vector_store(
        vector_store,
        storage_context=storage_context,
        embed_model=embed_model,
    )
    return index, collection


def retrieve_vector(index, query: str, top_k: int, metadata_filter: Optional[dict] = None):
    """Standard vector similarity retrieval."""
    retriever_kwargs = {"similarity_top_k": top_k}
    if metadata_filter:
        from llama_index.core.vector_stores import MetadataFilters, ExactMatchFilter
        filters = MetadataFilters(
            filters=[ExactMatchFilter(key=k, value=v) for k, v in metadata_filter.items()]
        )
        retriever_kwargs["filters"] = filters

    retriever = index.as_retriever(**retriever_kwargs)
    nodes = retriever.retrieve(query)
    return nodes


def retrieve_bm25(all_nodes: list, query: str, top_k: int, metadata_filter: Optional[dict] = None):
    """BM25 keyword retrieval over all nodes in the collection."""
    from rank_bm25 import BM25Okapi

    # Apply metadata filter before BM25 scoring
    candidates = all_nodes
    if metadata_filter:
        candidates = [
            n for n in all_nodes
            if all(n.metadata.get(k) == v for k, v in metadata_filter.items())
        ]

    tokenized = [n.get_content().lower().split() for n in candidates]
    bm25 = BM25Okapi(tokenized)
    scores = bm25.get_scores(query.lower().split())

    ranked = sorted(zip(scores, candidates), key=lambda x: x[0], reverse=True)
    return [node for _, node in ranked[:top_k]]


def retrieve_hybrid(index, all_nodes: list, query: str, top_k: int,
                    alpha: float = 0.5, metadata_filter: Optional[dict] = None):
    """
    Hybrid retrieval: normalized vector scores + BM25 scores combined via alpha weighting.
    alpha=1.0 → pure vector; alpha=0.0 → pure BM25
    """
    from rank_bm25 import BM25Okapi

    candidates = all_nodes
    if metadata_filter:
        candidates = [
            n for n in all_nodes
            if all(n.metadata.get(k) == v for k, v in metadata_filter.items())
        ]

    candidate_ids = {n.node_id: n for n in candidates}

    # Vector scores
    retriever = index.as_retriever(similarity_top_k=len(candidates) if len(candidates) < 200 else 200)
    vector_results = retriever.retrieve(query)
    v_scores = {r.node.node_id: r.score for r in vector_results if r.node.node_id in candidate_ids}

    # Normalize vector scores to [0, 1]
    if v_scores:
        v_min, v_max = min(v_scores.values()), max(v_scores.values())
        v_range = v_max - v_min or 1.0
        v_norm = {k: (s - v_min) / v_range for k, s in v_scores.items()}
    else:
        v_norm = {}

    # BM25 scores
    tokenized = [candidates[i].get_content().lower().split() for i in range(len(candidates))]
    bm25 = BM25Okapi(tokenized)
    b_scores_raw = bm25.get_scores(query.lower().split())
    b_min, b_max = min(b_scores_raw), max(b_scores_raw)
    b_range = b_max - b_min or 1.0
    b_norm = {candidates[i].node_id: (b_scores_raw[i] - b_min) / b_range
              for i in range(len(candidates))}

    # Combine
    combined = {}
    all_ids = set(v_norm.keys()) | set(b_norm.keys())
    for nid in all_ids:
        combined[nid] = alpha * v_norm.get(nid, 0.0) + (1 - alpha) * b_norm.get(nid, 0.0)

    ranked_ids = sorted(combined, key=combined.get, reverse=True)[:top_k]
    return [candidate_ids[nid] for nid in ranked_ids if nid in candidate_ids]


def rerank(nodes: list, query: str, model_name: str = "cross-encoder/ms-marco-MiniLM-L-6-v2"):
    """Cross-encoder reranking of retrieved nodes."""
    from sentence_transformers import CrossEncoder
    cross_encoder = CrossEncoder(model_name)
    pairs = [(query, n.get_content()) for n in nodes]
    scores = cross_encoder.predict(pairs)
    reranked = sorted(zip(scores, nodes), key=lambda x: x[0], reverse=True)
    return [node for _, node in reranked]


def retrieve(config: dict, query: str, chroma_path: str,
             category: Optional[str] = None) -> tuple[list, dict]:
    """
    Main retrieval entry point used by evaluate.py.

    Returns:
        (nodes, timing_dict) where timing_dict has keys 'embed_ms' and 'retrieve_ms'
    """
    method = config["retrieval"]["method"]
    top_k = config["retrieval"]["top_k"]
    use_filter = config.get("metadata_filter", False)
    do_rerank = config.get("reranking", False)
    reranker_model = config.get("reranker_model", "cross-encoder/ms-marco-MiniLM-L-6-v2")
    alpha = config["retrieval"].get("hybrid_alpha", 0.5) or 0.5

    metadata_filter = {"category": category} if use_filter and category else None

    t0 = time.time()
    index, collection = load_index(config, chroma_path)
    embed_ms = (time.time() - t0) * 1000  # approximate; includes collection load

    t1 = time.time()
    if method == "vector":
        nodes = retrieve_vector(index, query, top_k, metadata_filter)
        # unwrap NodeWithScore → Node
        nodes = [r.node if hasattr(r, "node") else r for r in nodes]
    elif method == "bm25":
        # Fetch all nodes from ChromaDB for BM25
        raw = collection.get(include=["documents", "metadatas"])
        from llama_index.core.schema import TextNode
        all_nodes = [
            TextNode(text=doc, metadata=meta, id_=uid)
            for doc, meta, uid in zip(raw["documents"], raw["metadatas"], raw["ids"])
        ]
        nodes = retrieve_bm25(all_nodes, query, top_k, metadata_filter)
    elif method == "hybrid":
        raw = collection.get(include=["documents", "metadatas"])
        from llama_index.core.schema import TextNode
        all_nodes = [
            TextNode(text=doc, metadata=meta, id_=uid)
            for doc, meta, uid in zip(raw["documents"], raw["metadatas"], raw["ids"])
        ]
        nodes = retrieve_hybrid(index, all_nodes, query, top_k, alpha, metadata_filter)
    else:
        raise ValueError(f"Unknown retrieval method: {method}")

    retrieve_ms = (time.time() - t1) * 1000

    if do_rerank and nodes:
        nodes = rerank(nodes, query, reranker_model)

    timing = {"embed_ms": embed_ms, "retrieve_ms": retrieve_ms}
    return nodes, timing
