"""
backend/routes/gallery.py — GET /items

Returns paginated previously-generated items from PostgreSQL.
"""

from typing import Optional
from fastapi import APIRouter, HTTPException, Query

from backend.models.schemas import GalleryResponse
from backend.services import db_service

router = APIRouter()

VALID_CATEGORIES = ["weapon", "npc", "artifact", "location", "monster"]


@router.get("", response_model=GalleryResponse)
async def list_items(
    category: Optional[str] = Query(None, description="Filter by category"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    if category and category not in VALID_CATEGORIES:
        raise HTTPException(status_code=400, detail=f"Invalid category: {category}")

    try:
        items, total = await db_service.get_items(category=category, page=page, page_size=page_size)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    return GalleryResponse(items=items, total=total, page=page, page_size=page_size)


@router.get("/{item_id}")
async def get_item(item_id: str):
    try:
        item = await db_service.get_item_by_id(item_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    return item
