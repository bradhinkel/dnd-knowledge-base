from pydantic import BaseModel
from typing import Optional, List


class BaseItem(BaseModel):
    name: str
    source_category: str      # weapon, npc, location, monster, artifact
    image_prompt: str          # For Phase 3 image generation
