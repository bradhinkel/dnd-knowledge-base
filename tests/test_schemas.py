"""Tests for Pydantic schema validation."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "src"))

from schemas import get_schema, SCHEMA_REGISTRY
from schemas.weapon import MagicWeapon, SpecialAbility
from schemas.npc import NPCCharacter
from schemas.location import Location
from schemas.monster import Monster
from schemas.artifact import Artifact


def test_schema_registry_has_all_categories():
    expected = {"weapon", "npc", "artifact", "location", "monster"}
    assert set(SCHEMA_REGISTRY.keys()) == expected


def test_get_schema_returns_correct_type():
    assert get_schema("weapon") is MagicWeapon
    assert get_schema("npc") is NPCCharacter
    assert get_schema("artifact") is Artifact
    assert get_schema("location") is Location
    assert get_schema("monster") is Monster


def test_weapon_schema_valid():
    weapon = MagicWeapon(
        name="Frostbite Blade",
        source_category="weapon",
        image_prompt="A gleaming blue longsword with frost crystals",
        item_type="Weapon (longsword)",
        rarity="Rare",
        requires_attunement=True,
        physical_description="A blade of pale blue steel",
        properties="+1 to attack and damage rolls",
        special_abilities=[
            SpecialAbility(name="Frozen Strike", description="Deals 1d6 cold damage")
        ],
        lore_and_history="Forged in the frozen peaks of the Spine of the World.",
    )
    assert weapon.name == "Frostbite Blade"
    assert weapon.requires_attunement is True
    assert len(weapon.special_abilities) == 1


def test_weapon_schema_optional_fields():
    weapon = MagicWeapon(
        name="Simple Sword",
        source_category="weapon",
        image_prompt="A basic sword",
        item_type="Weapon (shortsword)",
        rarity="Common",
        requires_attunement=False,
        physical_description="A plain steel blade",
        properties="None",
        special_abilities=[],
        lore_and_history="Mass-produced for militia use.",
    )
    assert weapon.spells is None
    assert weapon.curse is None
    assert weapon.sentience is None


def test_npc_schema_valid():
    npc = NPCCharacter(
        name="Theron Blackwood",
        source_category="npc",
        image_prompt="A grizzled human fighter",
        archetype="Hero",
        race="Human",
        gender="Male",
        char_class="10th-Level Fighter",
        alignment="Lawful Good",
        region="Waterdeep",
        appearance="Tall, scarred, grey-streaked hair",
        personality="Stoic but kind",
        backstory="A former soldier of the Waterdeep guard.",
        motivations="Protect the innocent",
        abilities_and_skills="Expert swordsman, tactical mind",
        equipment="Plate armor, longsword +2",
        combat_tactics="Defensive fighting, protects allies",
        roleplaying_tips="Speaks in clipped military phrases",
        encounter_hooks=["Found guarding a bridge", "Recruiting for a mission"],
    )
    assert npc.archetype == "Hero"
    assert len(npc.encounter_hooks) == 2


def test_artifact_schema_valid():
    artifact = Artifact(
        name="Crown of the Fallen King",
        source_category="artifact",
        image_prompt="A tarnished golden crown with dark gems",
        artifact_type="Crown",
        rarity="Legendary",
        attunement="Yes",
        physical_description="A heavy golden crown set with black opals",
        lore_and_history="Worn by the last king of a forgotten realm." * 5,
    )
    assert artifact.artifact_type == "Crown"
    assert artifact.rumors is None


def test_location_schema_valid():
    loc = Location(
        name="Thornhold",
        source_category="location",
        image_prompt="A dark stone fortress on a cliff",
        location_type="Fortress",
        region="Sword Coast North",
        description="A brooding fortress overlooking the sea.",
    )
    assert loc.location_type == "Fortress"


def test_monster_schema_valid():
    monster = Monster(
        name="Shadowfang Wolf",
        source_category="monster",
        image_prompt="A spectral wolf with glowing eyes",
        monster_type="Medium undead, neutral evil",
        challenge_rating="3 (700 XP)",
        armor_class="13 (natural armor)",
        hit_points="27 (5d8+5)",
        speed="40 ft.",
        ability_scores="STR 14 (+2) | DEX 16 (+3) | CON 12 (+1) | INT 6 (-2) | WIS 12 (+1) | CHA 8 (-1)",
        senses="darkvision 60 ft., passive Perception 13",
    )
    assert monster.challenge_rating == "3 (700 XP)"
