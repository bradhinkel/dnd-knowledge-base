"""
generate.py — CLI for generating new D&D content using RAG.

Retrieves relevant context from the vector store, builds a prompt using
the category-specific system prompt, calls the LLM, validates the
response against the Pydantic schema, and saves the result.

Usage:
    python src/generate.py --category weapon --rarity rare --theme lightning
    python src/generate.py --category npc --type villain --location Waterdeep
    python src/generate.py --category artifact --type ring --rarity legendary
    python src/generate.py --category location --type dungeon --theme undead
    python src/generate.py --category monster --type aberration --theme psionic
"""

import argparse
import json
import re
import sys
from datetime import datetime
from pathlib import Path

from dotenv import load_dotenv
from llama_index.core.llms import ChatMessage, MessageRole
from llama_index.llms.anthropic import Anthropic
from rich.console import Console
from rich.panel import Panel
from rich.syntax import Syntax

load_dotenv()

# Add src to path so schemas/prompts can be imported
sys.path.insert(0, str(Path(__file__).resolve().parent))

from schemas import get_schema, SCHEMA_REGISTRY
from prompts import PROMPT_REGISTRY
from query import query_by_category

PROJECT_ROOT = Path(__file__).resolve().parent.parent
GENERATED_DIR = PROJECT_ROOT / "data" / "generated"

console = Console()


# Common field name variations the LLM might use instead of schema names
_FIELD_ALIASES = {
    # Weapon aliases
    "lore_history": "lore_and_history",
    "lore": "lore_and_history",
    "special_ability": "special_abilities",
    # NPC aliases
    "background": "backstory",
    "class": "char_class",
    "class_level": "char_class",
    "cr": "challenge_rating",
    "faction": "affiliation",
    "faction_affiliation": "affiliation",
    "notable_abilities": "abilities_and_skills",
    "combat_role": "combat_tactics",
    # Monster aliases
    "type": "monster_type",
    "ac": "armor_class",
    "hp": "hit_points",
    # Artifact aliases
    "lore_history": "lore_and_history",
    "powers": "powers_and_abilities",
    "curse_or_drawback": "consequences",
    "drawback": "consequences",
}


def _normalize_fields(data: dict, category: str) -> dict:
    """Normalize LLM output field names to match schema expectations."""
    # Ensure source_category is set
    data.setdefault("source_category", category)

    # Apply field name aliases
    normalized = {}
    for key, value in data.items():
        canonical = _FIELD_ALIASES.get(key, key)
        normalized[canonical] = value

    # Normalize special_abilities for weapons: convert string to list format
    if category == "weapon" and "special_abilities" in normalized:
        sa = normalized["special_abilities"]
        if isinstance(sa, str):
            # Parse "Name — Description" format
            abilities = []
            for line in sa.split("\n"):
                line = line.strip()
                if not line:
                    continue
                if "—" in line:
                    parts = line.split("—", 1)
                    abilities.append({"name": parts[0].strip(), "description": parts[1].strip()})
                elif " - " in line:
                    parts = line.split(" - ", 1)
                    abilities.append({"name": parts[0].strip(), "description": parts[1].strip()})
                else:
                    abilities.append({"name": line, "description": ""})
            normalized["special_abilities"] = abilities

    # Normalize requires_attunement to bool for weapons
    if category == "weapon" and "requires_attunement" in normalized:
        val = normalized["requires_attunement"]
        if isinstance(val, str):
            normalized["requires_attunement"] = val.lower().startswith("yes")

    # Normalize list fields: convert strings to arrays if needed
    list_fields = ["encounter_hooks", "rumors"]
    for field in list_fields:
        if field in normalized and isinstance(normalized[field], str):
            text = normalized[field]
            items = [s.strip() for s in re.split(r"\n|(?<=\.)\s+(?=\d+\.)", text) if s.strip()]
            normalized[field] = items

    # For schemas expecting strings, convert lists back to joined strings
    schema = get_schema(category)
    for field_name, field_info in schema.model_fields.items():
        if field_name in normalized and isinstance(normalized[field_name], list):
            annotation = field_info.annotation
            # If the schema field is str or Optional[str], join the list
            if annotation is str or (
                hasattr(annotation, "__args__")
                and str in getattr(annotation, "__args__", ())
                and list not in getattr(annotation, "__args__", ())
            ):
                normalized[field_name] = "\n".join(str(x) for x in normalized[field_name])

    return normalized


def build_query(category: str, **kwargs) -> str:
    """Build a natural-language query from the user's parameters."""
    parts = [f"Generate a {category}"]

    if kwargs.get("rarity"):
        parts.append(f"of {kwargs['rarity']} rarity")
    if kwargs.get("type"):
        parts.append(f"of type {kwargs['type']}")
    if kwargs.get("theme"):
        parts.append(f"with a {kwargs['theme']} theme")
    if kwargs.get("location"):
        parts.append(f"associated with {kwargs['location']}")
    if kwargs.get("cr"):
        parts.append(f"with challenge rating {kwargs['cr']}")

    return " ".join(parts)


def format_context(results: list) -> str:
    """Format retrieved documents into context for the LLM."""
    if not results:
        return "No existing items found for reference."

    context_parts = []
    for i, node in enumerate(results, 1):
        context_parts.append(f"--- Example {i} ---\n{node.text}")

    return "\n\n".join(context_parts)


def generate(category: str, **kwargs) -> dict:
    """Generate a new D&D item using RAG."""
    schema = get_schema(category)
    system_prompt = PROMPT_REGISTRY[category]

    # Build query from parameters
    query_text = build_query(category, **kwargs)
    console.print(f"[dim]Query: {query_text}[/dim]")

    # Retrieve relevant existing items
    console.print(f"[dim]Retrieving similar {category}s from knowledge base…[/dim]")
    results = query_by_category(category, query_text, top_k=6)
    console.print(f"[dim]Retrieved {len(results)} reference items[/dim]")

    context = format_context(results)

    # Build the user message
    user_parts = [
        "Here are existing items from the knowledge base for reference:",
        context,
        "",
        f"Now generate a completely original {category} with these parameters:",
    ]

    if kwargs.get("rarity"):
        user_parts.append(f"- Rarity: {kwargs['rarity']}")
    if kwargs.get("type"):
        user_parts.append(f"- Type: {kwargs['type']}")
    if kwargs.get("theme"):
        user_parts.append(f"- Theme: {kwargs['theme']}")
    if kwargs.get("location"):
        user_parts.append(f"- Location: {kwargs['location']}")
    if kwargs.get("cr"):
        user_parts.append(f"- Challenge Rating: {kwargs['cr']}")

    user_parts.append("")
    user_parts.append(
        "CRITICAL: Return ONLY valid JSON. No markdown, no code fences, no explanation. "
        "You MUST include EVERY field listed in the system prompt. "
        "Do not omit any required fields even if the reference examples don't show them."
    )

    user_message = "\n".join(user_parts)

    # Call the LLM
    console.print(f"[bold]Generating {category}…[/bold]")
    llm = Anthropic(model="claude-haiku-4-5-20251001", max_tokens=4096)

    messages = [
        ChatMessage(role=MessageRole.SYSTEM, content=system_prompt.strip()),
        ChatMessage(role=MessageRole.USER, content=user_message),
    ]
    response = llm.chat(messages)

    response_text = response.message.content.strip()

    # Strip markdown code fences if present
    if response_text.startswith("```"):
        lines = response_text.split("\n")
        # Remove first and last lines (```json and ```)
        lines = [l for l in lines if not l.strip().startswith("```")]
        response_text = "\n".join(lines)

    # Normalize field names before validation
    raw = json.loads(response_text)
    raw = _normalize_fields(raw, category)

    # Validate against Pydantic schema
    try:
        result = schema.model_validate(raw)
        result_dict = result.model_dump()
    except Exception as e:
        console.print(f"[yellow]Schema validation failed: {e}[/yellow]")
        console.print("[yellow]Returning raw JSON…[/yellow]")
        result_dict = raw

    return result_dict


def save_generated(result: dict, category: str) -> Path:
    """Save a generated item to data/generated/."""
    GENERATED_DIR.mkdir(parents=True, exist_ok=True)

    name = result.get("name", "unknown").lower().replace(" ", "_")
    name = "".join(c for c in name if c.isalnum() or c == "_")
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{category}_{name}_{timestamp}.json"
    filepath = GENERATED_DIR / filename

    with open(filepath, "w") as f:
        json.dump(result, f, indent=2)

    return filepath


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Generate new D&D content using RAG"
    )
    parser.add_argument(
        "--category",
        required=True,
        choices=list(SCHEMA_REGISTRY.keys()),
        help="Content category to generate",
    )
    parser.add_argument("--rarity", default=None, help="Item rarity")
    parser.add_argument("--theme", default=None, help="Thematic element")
    parser.add_argument("--location", default=None, help="Sword Coast location")
    parser.add_argument("--type", default=None, help="Subtype within category")
    parser.add_argument("--cr", default=None, help="Challenge rating (monsters)")
    parser.add_argument(
        "--no-save",
        action="store_true",
        help="Don't save to file",
    )
    args = parser.parse_args()

    params = {
        k: v for k, v in vars(args).items()
        if k not in ("category", "no_save") and v is not None
    }

    try:
        result = generate(args.category, **params)
    except Exception as e:
        console.print(f"[red]Error: {e}[/red]")
        sys.exit(1)

    # Display the result
    json_str = json.dumps(result, indent=2)
    console.print()
    console.print(Panel(
        Syntax(json_str, "json", theme="monokai"),
        title=f"[bold]{result.get('name', 'Generated ' + args.category)}[/bold]",
        border_style="green",
    ))

    # Save to file
    if not args.no_save:
        filepath = save_generated(result, args.category)
        console.print(f"\n[green]✓[/green] Saved to [cyan]{filepath}[/cyan]")


if __name__ == "__main__":
    main()
