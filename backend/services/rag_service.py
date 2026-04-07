"""
backend/services/rag_service.py — Wraps the Phase 2 RAG pipeline.

Calls src/generate.py's generate() function with category-specific
parameters derived from the API request body.
"""

import asyncio
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from src.generate import generate
from src.schemas import SCHEMA_REGISTRY

VALID_CATEGORIES = list(SCHEMA_REGISTRY.keys())


async def generate_content(category: str, params: dict) -> dict:
    """
    Generate a new D&D item for the given category using the RAG pipeline.
    Returns the validated content as a dict.
    Runs the synchronous generate() in a thread pool executor.
    """
    if category not in VALID_CATEGORIES:
        raise ValueError(f"Unknown category: {category}. Must be one of {VALID_CATEGORIES}")

    # Filter out None values before passing to generate()
    kwargs = {k: v for k, v in params.items() if v is not None}

    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(
        None,
        lambda: generate(category=category, **kwargs)
    )
    return result
