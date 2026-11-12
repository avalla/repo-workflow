"""Validate M1 authoring artifacts; never resolve/install or execute bound commands."""

import copy
from datetime import datetime
import hashlib
import json
from pathlib import Path
import re
import unittest

from jsonschema import Draft202012Validator, FormatChecker
from referencing import Registry, Resource


ROOT = Path(__file__).resolve().parents[1]


def load(path):
    return json.loads((ROOT / path).read_text())


SCHEMAS = {p.stem: load(p.relative_to(ROOT)) for p in (ROOT / "schemas").glob("*.schema.json")}
REGISTRY = Registry().with_resources(
    (s["$id"], Resource.from_contents(s)) for s in SCHEMAS.values()
)
FORMATS = FormatChecker()


@FORMATS.checks("date-time", raises=ValueError)
def utc_timestamp(value):
    if not isinstance(value, str):
        return True
    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z", value):
        return False
    datetime.fromisoformat(value.replace("Z", "+00:00"))
    return True


def validator(name):
    return Draft202012Validator(
        SCHEMAS[name + ".schema"], registry=REGISTRY, format_checker=FORMATS
    )


def valid(name, value):
    validator(name).validate(value)


class Contracts(unittest.TestCase):
    def test_schema_definitions(self):
        for name, schema in SCHEMAS.items():
            with self.subTest(schema=name):
                Draft202012Validator.check_schema(schema)

    def test_positive_examples(self):
        groups = [("profiles/*.json", "profile"), ("presets/*.json", "preset"),
                  ("tests/fixtures/projects/*.json", "config")]
        for pattern, schema in groups:
            for path in ROOT.glob(pattern):
                with self.subTest(file=str(path.relative_to(ROOT))):
                    valid(schema, load(path.relative_to(ROOT)))
        for name in ["lock", "evidence"]:
            valid(name, load(f"tests/fixtures/examples/{name}.json"))

    def test_negative_config_examples(self):
        paths = list(ROOT.glob("tests/fixtures/invalid/*.json"))
        self.assertEqual(len(paths), 5)
        for path in paths:
            with self.subTest(file=path.name):
                self.assertTrue(list(validator("config").iter_errors(load(path.relative_to(ROOT)))))

    def test_nested_unknown_fields(self):
        baseline = load("tests/fixtures/projects/library-cli.json")
        for trail in [[], ["project"], ["review"], ["review", "external"],
                      ["components", "main"], ["commands", "synthetic-check"],
                      ["environments", "local"], ["gates", 0], ["approvals", 0]]:
            value = copy.deepcopy(baseline)
            target = value
            for key in trail:
                target = target[key]
            target["unrecognized"] = True
            with self.subTest(trail=trail):
                self.assertTrue(list(validator("config").iter_errors(value)))

    def test_paths_and_ordered_argv(self):
        check = Draft202012Validator(SCHEMAS["common.schema"]["$defs"]["path"])
        for path in ["../escape", "/absolute", "x/../y", "x/./y", "x\\y", "x//y", "x/", "x\n"]:
            with self.subTest(path=path):
                self.assertFalse(check.is_valid(path))
        value = load("tests/fixtures/projects/library-cli.json")
        value["commands"]["synthetic-check"]["argv"] = ["echo", "x", "x"]
        valid("config", value)  # Repeated arguments are meaningful and must remain ordered.

    def test_catalogue_integrity(self):
        profiles = {p.stem: load(p.relative_to(ROOT)) for p in ROOT.glob("profiles/*.json")}
        self.assertEqual(len(profiles), 6)
        for profile in profiles.values():
            for requirement in profile["requires"]:
                self.assertEqual(profiles[requirement["id"]]["version"], requirement["version"])
            for conflict in profile["conflicts"]:
                self.assertIn(conflict, profiles)
            for reference in profile["policy"]["references"]:
                self.assertTrue((ROOT / reference).is_file())
            for skill in profile["policy"]["skills"]:
                self.assertTrue((ROOT / "skills" / skill / "SKILL.md").is_file())
        for path in [*ROOT.glob("presets/*.json"), *ROOT.glob("tests/fixtures/projects/*.json")]:
            value = load(path.relative_to(ROOT))
            selected = value.get("selections", value.get("profiles", []))[:]
            for name, component in value.get("components", {}).items():
                selected.extend(component["profiles"])
                for item in component["profiles"]:
                    self.assertEqual(item["scope"], "component:" + name)
                    profile = profiles[item["id"]]
                    allowed = profile["applicability"]
                    self.assertTrue(not allowed["surfaces"] or component["surface"] in allowed["surfaces"])
                    self.assertTrue(set(allowed["stacks"]).issubset(component["stack"]))
            for item in selected:
                self.assertEqual(profiles[item["id"]]["version"], item["version"])
            for item in value.get("presets", []):
                preset = load("presets/" + item["id"] + ".json")
                self.assertEqual(preset["version"], item["version"])
                self.assertIn(item["component"], value["components"])

    def test_gate_and_review_constraints(self):
        value = load("tests/fixtures/projects/library-cli.json")
        value["gates"][0]["procedure"] = "manual alternative"
        self.assertFalse(validator("config").is_valid(value))
        value = load("tests/fixtures/projects/web.json")
        value["review"]["external"]["policy"] = "required"
        self.assertFalse(validator("config").is_valid(value))
        value["review"]["external"]["provider"] = "project-selected-provider"
        valid("config", value)
        value["overrides"] = [{"field": "core.independent-review", "scope": "project",
                               "value": False, "decision": "docs/adr/0001.md",
                               "authority": "owner", "reason": "invalid override"}]
        self.assertFalse(validator("config").is_valid(value))

    def test_bindings_are_references_only(self):
        for path in ROOT.glob("tests/fixtures/projects/*.json"):
            value = load(path.relative_to(ROOT))
            for command in value["commands"].values():
                self.assertIn(command["environment"], value["environments"])
            for gate in value["gates"]:
                if gate["binding"]:
                    self.assertIn(gate["binding"], value["commands"])
                    self.assertEqual(gate["environment"], value["commands"][gate["binding"]]["environment"])
                self.assertFalse(gate["binding"] and gate["procedure"])

    def test_lock_base_integrity(self):
        for item in load("tests/fixtures/examples/lock.json")["generated"]:
            self.assertEqual(hashlib.sha256(item["base"].encode()).hexdigest(), item["sha256"])

    def test_evidence_states_and_dates(self):
        example = load("tests/fixtures/examples/evidence.json")
        for state in ["PASS", "FAIL", "NOT RUN", "BLOCKED", "UNKNOWN", "QUEUED", "RUNNING", "CANCELLED", "SKIPPED"]:
            example["result"] = state
            valid("evidence", example)
        example["result"] = "GREEN"
        self.assertFalse(validator("evidence").is_valid(example))
        example["result"] = "UNKNOWN"
        example["verifiedAt"] = "not-a-time"
        self.assertFalse(validator("evidence").is_valid(example))

    def test_scenario_inventory_not_execution(self):
        cases = load("tests/fixtures/scenarios.json")
        self.assertEqual(len(cases), 40)
        self.assertEqual(len({c["id"] for c in cases}), len(cases))
        for case in cases:
            self.assertEqual(set(case), {"id", "milestone", "input", "expected"})
            self.assertIn(case["milestone"], [2, 3])
            self.assertTrue(case["input"] and case["expected"])
        # This checks specification consistency, not an implementation of three-way updates.
        ids = {c["id"]: c for c in cases}
        for name in ["divergent-edit", "modified-removal", "local-deletion"]:
            self.assertEqual(ids[name]["input"]["local"], ids[name]["expected"]["result"])

    def test_local_markdown_links(self):
        for path in ROOT.rglob("*.md"):
            if ".venv" in path.parts:
                continue
            for target in re.findall(r"\]\(([^)]+)\)", path.read_text()):
                if "://" in target or target.startswith("#"):
                    continue
                destination = target.split("#")[0]
                with self.subTest(file=path.name, target=target):
                    self.assertTrue((path.parent / destination).exists())

    def test_context_budgets(self):
        self.assertLessEqual((ROOT / "AGENTS.md").stat().st_size, 2048)
        self.assertLessEqual((ROOT / "CLAUDE.md").stat().st_size, 512)
        self.assertLessEqual((ROOT / "docs/STATUS.md").stat().st_size, 8000)
        core = sum(p.stat().st_size for p in (ROOT / "core").glob("*.md"))
        largest_skill = max(p.stat().st_size for p in (ROOT / "skills").glob("*/SKILL.md"))
        self.assertLessEqual(core + largest_skill, 8000)


if __name__ == "__main__":
    unittest.main(verbosity=2)
