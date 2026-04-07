from pydantic import BaseModel
from typing import Optional, List

from .base import BaseItem


class Artifact(BaseItem):
    artifact_type: str         # Weapon of Legend, Armor, Ring, Crown, Amulet, Staff, etc.
    item_subtype: Optional[str] = None  # Longsword, Trident, etc.
    rarity: str
    attunement: str
    attunement_req: Optional[str] = None
    creator_origin: Optional[str] = None
    current_location: Optional[str] = None
    physical_description: str
    properties: Optional[str] = None
    powers_and_abilities: Optional[str] = None
    spells: Optional[str] = None
    lore_and_history: str      # 200+ words
    sentience: Optional[str] = None
    consequences: Optional[str] = None
    rumors: Optional[List[str]] = None
    encounter_hooks: Optional[List[str]] = None
    dm_notes: Optional[str] = None
    alignment_affinity: Optional[str] = None
    tags: Optional[str] = None
