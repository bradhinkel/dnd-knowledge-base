"""
backend/main.py — FastAPI entry point for the D&D Knowledge Base API.

Runs on localhost:8001 behind Nginx on the DigitalOcean droplet.
"""

import os
import sys
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

load_dotenv()

# Allow imports from the project's src/ directory
PROJECT_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from backend.routes import generate, gallery, images
from backend.services import db_service

app = FastAPI(
    title="D&D Knowledge Base API",
    description="RAG-powered D&D content generator",
    version="1.0.0",
)

# CORS — allow Next.js frontend and WordPress parent page
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://dnd.bradhinkel.com",
        "https://bradhinkel.com",
        "https://www.bradhinkel.com",
        "http://localhost:3000",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    await db_service.init_db()


app.include_router(generate.router, prefix="/generate", tags=["generate"])
app.include_router(gallery.router, prefix="/items", tags=["gallery"])
app.include_router(images.router, prefix="/images", tags=["images"])

# Serve generated images if running locally
images_dir = Path(os.getenv("IMAGES_DIR", "/var/data/dnd-images"))
if images_dir.exists():
    app.mount("/static/images", StaticFiles(directory=str(images_dir)), name="images")


@app.get("/health")
async def health():
    return {"status": "ok"}
