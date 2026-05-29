"""
backend/services/image_service.py — OpenAI image generation.

Supports:
  - gpt-image-1 / gpt-image-2  (base64 response, transparent PNG)
  - dall-e-3                    (URL response, opaque PNG)

Set IMAGE_MODEL in .env to enable. Leave blank to skip image generation.
"""

import base64
import io
import os
import uuid
import aiofiles
from pathlib import Path

import httpx
from PIL import Image
from openai import AsyncOpenAI

IMAGES_DIR  = Path(os.getenv("IMAGES_DIR", "/var/data/dnd-images"))
BASE_URL    = os.getenv("BASE_URL", "https://dnd.bradhinkel.com")
IMAGE_MODEL = os.getenv("IMAGE_MODEL", "")
_USE_PROXY  = os.getenv("IMAGE_PROXY", "false").lower() == "true"

# Padding added to each side as a fraction of image dimension.
# 10% gives the subject 80% of the frame — visible margin without shrinking.
_PAD_FRACTION = 0.10

_GPT_IMAGE_MODELS = {"gpt-image-1", "gpt-image-2"}

_openai_client = None


def _get_client() -> AsyncOpenAI:
    global _openai_client
    if _openai_client is None:
        _openai_client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    return _openai_client


def _add_padding(image_bytes: bytes) -> bytes:
    """
    Add transparent padding around the image so the subject never touches
    the display frame edge, regardless of how the AI composes the shot.
    """
    img = Image.open(io.BytesIO(image_bytes)).convert("RGBA")
    w, h = img.size
    pad_w = int(w * _PAD_FRACTION)
    pad_h = int(h * _PAD_FRACTION)

    padded = Image.new("RGBA", (w + pad_w * 2, h + pad_h * 2), (0, 0, 0, 0))
    padded.paste(img, (pad_w, pad_h))

    out = io.BytesIO()
    padded.save(out, format="PNG")
    return out.getvalue()


async def generate_image(prompt: str, item_id: str | None = None) -> str | None:
    """
    Generate an image, add margin padding, save locally.
    Returns the public URL (or proxy path), or None on failure / if disabled.
    """
    if not IMAGE_MODEL:
        return None

    IMAGES_DIR.mkdir(parents=True, exist_ok=True)

    filename  = f"{item_id or uuid.uuid4()}.png"
    save_path = IMAGES_DIR / filename

    try:
        client = _get_client()

        if IMAGE_MODEL in _GPT_IMAGE_MODELS:
            image_bytes = await _generate_gpt_image(client, prompt)
        else:
            image_bytes = await _generate_dalle(client, prompt)

        # Add transparent padding so subject never touches display frame edge
        image_bytes = _add_padding(image_bytes)

        async with aiofiles.open(save_path, "wb") as f:
            await f.write(image_bytes)

        if _USE_PROXY:
            # Local dev: route through Next.js API proxy → backend /static/images/
            return f"/api/static/images/{filename}"
        # Production: Nginx serves /images/ directly from IMAGES_DIR
        return f"{BASE_URL}/images/{filename}"

    except Exception as e:
        print(f"[image_service] Image generation failed for item {item_id}: {e}")
        return None


async def _generate_gpt_image(client: AsyncOpenAI, prompt: str) -> bytes:
    """gpt-image-1 / gpt-image-2 — returns base64, supports transparent PNG."""
    response = await client.images.generate(
        model=IMAGE_MODEL,
        prompt=_enrich_prompt(prompt),
        n=1,
        size="1024x1536",   # portrait — matches weapon/character illustration style
        quality="medium",
        output_format="png",
        background="transparent",
    )
    b64 = response.data[0].b64_json
    return base64.b64decode(b64)


async def _generate_dalle(client: AsyncOpenAI, prompt: str) -> bytes:
    """dall-e-3 — returns a temporary URL, download and save."""
    response = await client.images.generate(
        model=IMAGE_MODEL,
        prompt=_enrich_prompt(prompt),
        n=1,
        size="1024x1024",
        quality="standard",
    )
    image_url = response.data[0].url
    async with httpx.AsyncClient(timeout=60) as http:
        r = await http.get(image_url)
        r.raise_for_status()
    return r.content


def _enrich_prompt(prompt: str) -> str:
    style = (
        "Detailed pen-and-ink engraving illustration. "
        "Fine dark ink linework: cross-hatching for shadows, stippling for texture, clean contour lines. "
        "Any colours in the description rendered as light translucent watercolour washes over the ink — "
        "muted, luminous, period-authentic (ochre, burnt sienna, verdigris, faded crimson, sepia). "
        "Ink lines remain visible through the colour washes. "
        "Style of an 18th-century natural history plate or hand-tinted D&D sourcebook illustration. "
        "Fully transparent background. The subject floats on a transparent field — "
        "no background fill, no drop shadow, no border, no vignette. "
        "The image will be placed directly onto aged parchment paper."
    )
    return f"{prompt}. {style}"
