from .weapon_prompt import WEAPON_SYSTEM_PROMPT
from .npc_prompt import NPC_SYSTEM_PROMPT
from .location_prompt import LOCATION_SYSTEM_PROMPT
from .monster_prompt import MONSTER_SYSTEM_PROMPT
from .artifact_prompt import ARTIFACT_SYSTEM_PROMPT

PROMPT_REGISTRY = {
    "weapon": WEAPON_SYSTEM_PROMPT,
    "npc": NPC_SYSTEM_PROMPT,
    "artifact": ARTIFACT_SYSTEM_PROMPT,
    "location": LOCATION_SYSTEM_PROMPT,
    "monster": MONSTER_SYSTEM_PROMPT,
}
