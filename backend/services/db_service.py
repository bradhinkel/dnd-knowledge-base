"""
backend/services/db_service.py — PostgreSQL persistence via asyncpg.

Table: generated_content
  id          UUID PRIMARY KEY
  category    TEXT
  name        TEXT
  rarity      TEXT
  content     JSONB   (full Pydantic model output)
  image_url   TEXT
  created_at  TIMESTAMPTZ
"""

import json
import os
import uuid
from datetime import datetime, timezone
from typing import Optional

import asyncpg

_pool: Optional[asyncpg.Pool] = None


async def get_pool() -> asyncpg.Pool:
    global _pool
    if _pool is None:
        _pool = await asyncpg.create_pool(
            dsn=os.getenv("DATABASE_URL", "postgresql://dnd_app:password@localhost:5432/dnd_generator"),
            min_size=2,
            max_size=10,
        )
    return _pool


async def init_db():
    """Create the generated_content table if it doesn't exist."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS generated_content (
                id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                category    TEXT NOT NULL,
                name        TEXT NOT NULL,
                rarity      TEXT,
                content     JSONB NOT NULL,
                image_url   TEXT,
                created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
            CREATE INDEX IF NOT EXISTS idx_generated_content_category
                ON generated_content (category);
            CREATE INDEX IF NOT EXISTS idx_generated_content_created_at
                ON generated_content (created_at DESC);
        """)


async def save_item(category: str, content: dict, image_url: Optional[str] = None) -> dict:
    """Persist a generated item and return the full record."""
    pool = await get_pool()
    item_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    name = content.get("name", "Unknown")
    rarity = content.get("rarity") or content.get("challenge_rating")

    async with pool.acquire() as conn:
        await conn.execute(
            """
            INSERT INTO generated_content (id, category, name, rarity, content, image_url, created_at)
            VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7)
            """,
            item_id, category, name, str(rarity) if rarity else None,
            json.dumps(content), image_url, now,
        )

    return {
        "id": item_id,
        "category": category,
        "name": name,
        "rarity": str(rarity) if rarity else None,
        "content": content,
        "image_url": image_url,
        "created_at": now.isoformat(),
    }


async def get_items(
    category: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
) -> tuple[list[dict], int]:
    """Return paginated items and total count."""
    pool = await get_pool()
    offset = (page - 1) * page_size

    async with pool.acquire() as conn:
        if category:
            rows = await conn.fetch(
                """
                SELECT id, category, name, rarity, content, image_url, created_at
                FROM generated_content
                WHERE category = $1
                ORDER BY created_at DESC
                LIMIT $2 OFFSET $3
                """,
                category, page_size, offset,
            )
            total = await conn.fetchval(
                "SELECT COUNT(*) FROM generated_content WHERE category = $1", category
            )
        else:
            rows = await conn.fetch(
                """
                SELECT id, category, name, rarity, content, image_url, created_at
                FROM generated_content
                ORDER BY created_at DESC
                LIMIT $1 OFFSET $2
                """,
                page_size, offset,
            )
            total = await conn.fetchval("SELECT COUNT(*) FROM generated_content")

    items = [
        {
            "id": str(r["id"]),
            "category": r["category"],
            "name": r["name"],
            "rarity": r["rarity"],
            "content": dict(r["content"]),
            "image_url": r["image_url"],
            "created_at": r["created_at"].isoformat(),
        }
        for r in rows
    ]
    return items, total


async def get_item_by_id(item_id: str) -> Optional[dict]:
    """Fetch a single item by UUID."""
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            """
            SELECT id, category, name, rarity, content, image_url, created_at
            FROM generated_content WHERE id = $1
            """,
            uuid.UUID(item_id),
        )
    if not row:
        return None
    return {
        "id": str(row["id"]),
        "category": row["category"],
        "name": row["name"],
        "rarity": row["rarity"],
        "content": dict(row["content"]),
        "image_url": row["image_url"],
        "created_at": row["created_at"].isoformat(),
    }
