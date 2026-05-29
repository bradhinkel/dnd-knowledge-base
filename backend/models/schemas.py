"""Request / response Pydantic models for the FastAPI layer."""

from typing import Any, Optional
from pydantic import BaseModel, Field


# Max length for any free-text input field.
# Long inputs are a common prompt-injection vector; 120 chars is generous
# for a D&D descriptor ("fire-touched volcanic ruins near Waterdeep") while
# blocking anything that looks like instruction injection.
_MAX = 120


class GenerateRequest(BaseModel):
    rarity:     Optional[str] = Field(None, max_length=_MAX)
    theme:      Optional[str] = Field(None, max_length=_MAX)
    location:   Optional[str] = Field(None, max_length=_MAX)
    type:       Optional[str] = Field(None, max_length=_MAX)
    char_class: Optional[str] = Field(None, max_length=_MAX)
    cr:         Optional[str] = Field(None, max_length=20)   # "1/4" … "30"
    terrain:    Optional[str] = Field(None, max_length=_MAX)
    name_hint:  Optional[str] = Field(None, max_length=_MAX)


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
    prompt:  str = Field(..., max_length=500)
    item_id: Optional[str] = None


class ImageResponse(BaseModel):
    image_url: str
    item_id:   Optional[str] = None
