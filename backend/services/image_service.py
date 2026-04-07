"""
backend/services/image_service.py — DALL-E 3 image generation.

Generates an image from the item's image_prompt field and saves it locally.
Falls back gracefully if the API call fails.
"""

import os
import uuid
import aiofiles
from pathlib import Path

import httpx
from openai import AsyncOpenAI

IMAGES_DIR = Path(os.getenv("IMAGES_DIR", "/var/data/dnd-images"))
BASE_URL = os.getenv("BASE_URL", "https://dnd.bradhinkel.com")

_openai_client = None


def _get_client() -> AsyncOpenAI:
    global _openai_client
    if _openai_client is None:
        _openai_client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    return _openai_client


async def generate_image(prompt: str, item_id: str | None = None) -> str | None:
    """
    Generate an image via DALL-E 3 and save it to the images directory.
    Returns the public URL of the saved image, or None on failure.
    """
    IMAGES_DIR.mkdir(parents=True, exist_ok=True)

    filename = f"{item_id or uuid.uuid4()}.png"
    save_path = IMAGES_DIR / filename

    try:
        client = _get_client()
        response = await client.images.generate(
            model="dall-e-3",
            prompt=_enrich_prompt(prompt),
            size="1024x1024",
            quality="standard",
            style="vivid",
            n=1,
        )
        image_url = response.data[0].url

        # Download and save the image locally
        async with httpx.AsyncClient(timeout=60) as http:
            img_response = await http.get(image_url)
            img_response.raise_for_status()

        async with aiofiles.open(save_path, "wb") as f:
            await f.write(img_response.content)

        return f"{BASE_URL}/images/{filename}"

    except Exception as e:
        # Log but don't crash — item generation succeeds even if image fails
        print(f"[image_service] Image generation failed for item {item_id}: {e}")
        return None


def _enrich_prompt(prompt: str) -> str:
    """Add style guidance to ensure consistent fantasy art aesthetic."""
    style_suffix = (
        "Fantasy digital art style, detailed illustration, "
        "dark fantasy aesthetic, dramatic lighting, high quality."
    )
    # Avoid doubling the suffix if it's already in the prompt
    if "fantasy" in prompt.lower() and "art" in prompt.lower():
        return prompt
    return f"{prompt}. {style_suffix}"
