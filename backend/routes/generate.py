"""
backend/routes/generate.py — POST /generate/{category}

Generates a new D&D item using the RAG pipeline, optionally creates a
DALL-E 3 image, saves to PostgreSQL, and returns the full item.
"""

import json
from typing import AsyncGenerator

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from backend.models.schemas import GenerateRequest, GeneratedItem
from backend.services import rag_service, image_service, db_service

router = APIRouter()

VALID_CATEGORIES = ["weapon", "npc", "artifact", "location", "monster"]


@router.post("/{category}", response_model=GeneratedItem)
async def generate_item(category: str, request: GenerateRequest):
    """Generate a new D&D item for the given category."""
    if category not in VALID_CATEGORIES:
        raise HTTPException(status_code=400, detail=f"Invalid category: {category}")

    params = request.model_dump(exclude_none=True)

    try:
        content = await rag_service.generate_content(category, params)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")

    # Generate image from the item's image_prompt field (non-blocking)
    image_url = None
    image_prompt = content.get("image_prompt")
    if image_prompt:
        try:
            image_url = await image_service.generate_image(image_prompt)
        except Exception:
            pass  # Image failure doesn't fail the request

    # Persist to PostgreSQL
    try:
        record = await db_service.save_item(category, content, image_url)
    except Exception as e:
        # If DB is unavailable, still return the content
        import uuid
        from datetime import datetime, timezone
        record = {
            "id": str(uuid.uuid4()),
            "category": category,
            "name": content.get("name", "Unknown"),
            "rarity": content.get("rarity"),
            "content": content,
            "image_url": image_url,
            "created_at": datetime.now(timezone.utc).isoformat(),
        }

    return GeneratedItem(**record)


@router.post("/{category}/stream")
async def generate_item_stream(category: str, request: GenerateRequest):
    """
    SSE streaming endpoint — yields progress events then the final item.
    Used by the frontend to show real-time generation feedback.
    """
    if category not in VALID_CATEGORIES:
        raise HTTPException(status_code=400, detail=f"Invalid category: {category}")

    params = request.model_dump(exclude_none=True)

    async def event_stream() -> AsyncGenerator[str, None]:
        yield _sse("status", {"message": f"Retrieving {category} references…"})

        try:
            content = await rag_service.generate_content(category, params)
        except Exception as e:
            yield _sse("error", {"message": str(e)})
            return

        yield _sse("status", {"message": "Generating image…"})

        image_url = None
        image_prompt = content.get("image_prompt")
        if image_prompt:
            image_url = await image_service.generate_image(image_prompt)

        try:
            record = await db_service.save_item(category, content, image_url)
        except Exception as db_err:
            import uuid, logging
            from datetime import datetime, timezone
            logging.error(f"DB save failed: {db_err}", exc_info=True)
            record = {
                "id": str(uuid.uuid4()),
                "category": category,
                "name": content.get("name", "Unknown"),
                "rarity": content.get("rarity"),
                "content": content,
                "image_url": image_url,
                "created_at": datetime.now(timezone.utc).isoformat(),
            }

        yield _sse("done", record)

    return StreamingResponse(event_stream(), media_type="text/event-stream")


def _sse(event: str, data: dict) -> str:
    return f"event: {event}\ndata: {json.dumps(data)}\n\n"
