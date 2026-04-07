from pydantic import BaseModel
from typing import Optional, List

from .base import BaseItem


class NPCCharacter(BaseItem):
    archetype: str             # Hero, Villain, Criminal, Guild Leader, Patron, etc.
    race: str
    gender: str
    char_class: str            # Class / Level
    challenge_rating: Optional[str] = None
    alignment: str
    aliases: Optional[str] = None
    region: str
    appearance: str
    personality: str
    backstory: str
    motivations: str
    secrets: Optional[str] = None
    affiliation: Optional[str] = None
    relationships: Optional[str] = None
    abilities_and_skills: str
    equipment: str
    combat_tactics: str
    roleplaying_tips: str
    encounter_hooks: List[str]
    rumors: Optional[List[str]] = None
    tags: Optional[str] = None
