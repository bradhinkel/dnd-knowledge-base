from pydantic import BaseModel
from typing import Optional, List

from .base import BaseItem


class Location(BaseItem):
    location_type: str         # City, Town, Fortress, Tower, Ruin, Sacred Site, etc.
    region: str
    epithets: Optional[str] = None
    population: Optional[str] = None
    government: Optional[str] = None
    alignment: Optional[str] = None
    factions: Optional[str] = None
    description: str
    notable_features: Optional[str] = None
    history: Optional[str] = None
    npcs: Optional[str] = None
    hooks: Optional[str] = None
    rumors: Optional[str] = None
    tags: Optional[str] = None
