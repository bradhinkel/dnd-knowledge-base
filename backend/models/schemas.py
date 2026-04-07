"""Request / response Pydantic models for the FastAPI layer."""

from typing import Any, Optional
from pydantic import BaseModel


class GenerateRequest(BaseModel):
    rarity: Optional[str] = None
    theme: Optional[str] = None
    location: Optional[str] = None
    type: Optional[str] = None          # weapon type, monster type, etc.
    char_class: Optional[str] = None    # NPC class
    cr: Optional[str] = None            # monster CR
    terrain: Optional[str] = None       # location terrain
    name_hint: Optional[str] = None     # optional name suggestion


class GeneratedItem(BaseModel):
    id: str
    category: str
    name: str
    rarity: Optional[str] = None
    content: dict[str, Any]
    image_url: Optional[str] = None
    created_at: str


class GalleryResponse(BaseModel):
    items: list[GeneratedItem]
    total: int
    page: int
    page_size: int


class ImageRequest(BaseModel):
    prompt: str
    item_id: Optional[str] = None


class ImageResponse(BaseModel):
    image_url: str
    item_id: Optional[str] = None
