from .weapon import MagicWeapon
from .npc import NPCCharacter
from .artifact import Artifact
from .location import Location
from .monster import Monster

SCHEMA_REGISTRY = {
    "weapon": MagicWeapon,
    "npc": NPCCharacter,
    "artifact": Artifact,
    "location": Location,
    "monster": Monster,
}


def get_schema(category: str):
    return SCHEMA_REGISTRY[category]
