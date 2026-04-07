from pydantic import BaseModel
from typing import Optional, List

from .base import BaseItem


class SpecialAbility(BaseModel):
    name: str
    description: str


class MagicWeapon(BaseItem):
    item_type: str
    rarity: str               # Common | Uncommon | Rare | Very Rare | Legendary
    requires_attunement: bool
    attunement_details: Optional[str] = None
    physical_description: str
    properties: str
    special_abilities: List[SpecialAbility]
    spells: Optional[str] = None
    lore_and_history: str
    special_conditions: Optional[str] = None
    curse: Optional[str] = None
    sentience: Optional[str] = None
