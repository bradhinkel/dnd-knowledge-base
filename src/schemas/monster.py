from pydantic import BaseModel
from typing import Optional, List

from .base import BaseItem


class Monster(BaseItem):
    monster_type: str          # e.g., "Medium humanoid (human), lawful good"
    challenge_rating: str
    armor_class: str
    hit_points: str
    speed: str
    ability_scores: str        # STR/DEX/CON/INT/WIS/CHA inline
    saving_throws: Optional[str] = None
    skills: Optional[str] = None
    damage_resistances: Optional[str] = None
    damage_immunities: Optional[str] = None
    condition_immunities: Optional[str] = None
    senses: str
    languages: Optional[str] = None
    dungeon_type: Optional[str] = None
    faction: Optional[str] = None
    traits: Optional[str] = None
    actions: Optional[str] = None
    reactions: Optional[str] = None
    lore: Optional[str] = None
    ecology: Optional[str] = None
    encounter_hooks: Optional[str] = None
