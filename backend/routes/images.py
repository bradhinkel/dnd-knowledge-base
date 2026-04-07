"""
backend/routes/images.py — POST /images/generate

On-demand image generation for existing items or custom prompts.
"""

from fastapi import APIRouter, HTTPException

from backend.models.schemas import ImageRequest, ImageResponse
from backend.services import image_service

router = APIRouter()


@router.post("/generate", response_model=ImageResponse)
async def generate_image(request: ImageRequest):
    """Generate a DALL-E 3 image for the given prompt."""
    if not request.prompt or len(request.prompt.strip()) < 10:
        raise HTTPException(status_code=400, detail="Prompt must be at least 10 characters")

    image_url = await image_service.generate_image(
        prompt=request.prompt,
        item_id=request.item_id,
    )

    if not image_url:
        raise HTTPException(status_code=502, detail="Image generation failed")

    return ImageResponse(image_url=image_url, item_id=request.item_id)
