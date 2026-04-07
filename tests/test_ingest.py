"""Tests for the ingestion pipeline's docx parsing."""

import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "src"))

from ingest import (
    extract_weapons,
    extract_npcs,
    extract_locations,
    extract_monsters,
    extract_artifacts,
    CATEGORY_DIRS,
    DATA_DIR,
)


# ---------------------------------------------------------------------------
# Weapon parsing
# ---------------------------------------------------------------------------

def _get_first_docx(category: str) -> Path:
    dir_name = CATEGORY_DIRS[category]
    data_path = DATA_DIR / dir_name
    files = sorted(data_path.glob("*.docx"))
    if not files:
        pytest.skip(f"No docx files found for {category}")
    return files[0]


class TestWeaponParsing:
    def test_extracts_weapons(self):
        path = _get_first_docx("weapon")
        weapons = extract_weapons(path)
        assert len(weapons) > 0

    def test_weapon_has_required_fields(self):
        path = _get_first_docx("weapon")
        weapons = extract_weapons(path)
        weapon = weapons[0]
        assert "name" in weapon
        assert "item_type" in weapon
        assert "rarity" in weapon

    def test_weapon_name_not_empty(self):
        path = _get_first_docx("weapon")
        weapons = extract_weapons(path)
        for w in weapons:
            assert w["name"].strip(), f"Empty weapon name found"


class TestNPCParsing:
    def test_extracts_npcs(self):
        path = _get_first_docx("npc")
        npcs = extract_npcs(path)
        assert len(npcs) > 0

    def test_npc_has_required_fields(self):
        path = _get_first_docx("npc")
        npcs = extract_npcs(path)
        npc = npcs[0]
        assert "name" in npc
        assert "race" in npc
        assert "alignment" in npc
        assert "backstory" in npc

    def test_npc_encounter_hooks_is_list(self):
        path = _get_first_docx("npc")
        npcs = extract_npcs(path)
        for npc in npcs:
            assert isinstance(npc["encounter_hooks"], list)


class TestLocationParsing:
    def test_extracts_locations(self):
        path = _get_first_docx("location")
        locations = extract_locations(path)
        assert len(locations) > 0

    def test_location_has_required_fields(self):
        path = _get_first_docx("location")
        locations = extract_locations(path)
        loc = locations[0]
        assert "name" in loc
        assert "location_type" in loc
        assert "region" in loc

    def test_location_name_title_case(self):
        path = _get_first_docx("location")
        locations = extract_locations(path)
        for loc in locations:
            # Names should be title-cased, not ALL CAPS
            assert loc["name"] != loc["name"].upper() or len(loc["name"]) <= 3


class TestMonsterParsing:
    def test_extracts_monsters(self):
        path = _get_first_docx("monster")
        monsters = extract_monsters(path)
        assert len(monsters) > 0

    def test_monster_has_stat_block(self):
        path = _get_first_docx("monster")
        monsters = extract_monsters(path)
        monster = monsters[0]
        assert "monster_type" in monster
        assert "challenge_rating" in monster
        assert "armor_class" in monster
        assert "hit_points" in monster

    def test_monster_has_name(self):
        path = _get_first_docx("monster")
        monsters = extract_monsters(path)
        for m in monsters:
            assert m["name"], f"Empty monster name found"


class TestArtifactParsing:
    def test_extracts_artifacts(self):
        path = _get_first_docx("artifact")
        artifacts = extract_artifacts(path)
        assert len(artifacts) > 0

    def test_artifact_has_required_fields(self):
        path = _get_first_docx("artifact")
        artifacts = extract_artifacts(path)
        artifact = artifacts[0]
        assert "name" in artifact
        assert "artifact_type" in artifact
        assert "rarity" in artifact

    def test_artifact_has_lore(self):
        path = _get_first_docx("artifact")
        artifacts = extract_artifacts(path)
        for a in artifacts:
            assert a.get("lore_and_history"), f"No lore for artifact: {a['name']}"


class TestAllCategories:
    """Verify all categories can be parsed end-to-end."""

    @pytest.mark.parametrize("category", list(CATEGORY_DIRS.keys()))
    def test_category_extracts_items(self, category):
        from ingest import extract_category
        items = extract_category(category)
        assert len(items) > 0, f"No items extracted for {category}"
