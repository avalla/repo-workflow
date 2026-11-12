"""Executable M2 acceptance checks on disposable targets, never source projects."""

from copy import deepcopy
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from repo_workflow.__main__ import doctor, inspect, main
from repo_workflow.compose import applicable, merge_gate, origin
from repo_workflow.install import END, START, apply, merge_entry, plan
from repo_workflow.io import ContractError, SOURCE, canonical, decode, digest, relative


class Tool(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.root = Path(self.temporary.name)
        self.config = json.loads((SOURCE / "tests/fixtures/projects/library-cli.json").read_text())
        self.save()

    def save(self):
        (self.root / ".repo-workflow.json").write_text(canonical(self.config))

    def write(self, path, content):
        destination = self.root / path
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_bytes(content.encode())

    def local(self, name="local-checks", **changes):
        profile = json.loads((SOURCE / "profiles/surface-library-cli.json").read_text())
        profile.update(id=name, kind="capability", requires=[], conflicts=[], files=[],
                       applicability=dict(surfaces=[], stacks=[], layouts=[]))
        profile.update(changes)
        path = "local/" + name + ".json"
        self.write(path, canonical(profile))
        self.config["localProfiles"].append(path)
        self.save()
        return profile

    def select(self, name, version="0.1.0"):
        self.config["components"]["main"]["profiles"].append(dict(id=name, version=version, scope="component:main"))
        self.save()

    def test_four_representative_targets_install(self):
        for fixture in sorted((SOURCE / "tests/fixtures/projects").glob("*.json")):
            with self.subTest(fixture=fixture.name), tempfile.TemporaryDirectory() as directory:
                root = Path(directory)
                (root / ".repo-workflow.json").write_bytes(fixture.read_bytes())
                candidate = plan(root)
                self.assertFalse(candidate["conflicts"])
                result = apply(candidate, root)
                self.assertEqual(result["state"], "applied")
                self.assertFalse(any(f["code"].startswith("managed-content-drift")
                                     for f in doctor(root, "docs", ["README.md"])["findings"]))
                self.assertTrue((root / ".repo-workflow/lock.json").is_file())

    def test_deterministic_bytes_and_origins(self):
        first = plan(self.root)
        with patch.dict("os.environ", {"HOME": "/irrelevant", "TZ": "Pacific/Honolulu"}):
            second = plan(self.root)
        self.assertEqual(canonical(first), canonical(second))
        for gate in inspect(self.root, "feature", ["src/a.py"])["gates"].values():
            self.assertTrue(gate["origins"])
        self.assertFalse(inspect(self.root, "feature", ["src/a.py"])["completion"])

    def test_mixed_scope_and_unknown_stack(self):
        self.config = json.loads((SOURCE / "tests/fixtures/projects/mixed-monorepo.json").read_text())
        self.save()
        result = inspect(self.root, "feature", ["apps/web/view.ts", "apps/worker/job.ts", "apps/ml/job.py"])
        required = {k for k, g in result["gates"].items() if g["required"] and g["applicable"]}
        for gate in ["project/independent-review", "component:web/browser", "component:web/accessibility",
                     "component:web/database", "component:worker/database", "component:worker/outbox"]:
            self.assertIn(gate, required)
        self.assertNotIn("component:worker/browser", result["gates"])
        self.assertNotIn("component:ml/database", result["gates"])
        self.assertIn("missing-technical-gates:component:ml", result["diagnostics"])

    def test_missing_and_incompatible_profiles(self):
        self.select("missing")
        with self.assertRaisesRegex(ContractError, "unresolved-profile"):
            plan(self.root)
        self.config["components"]["main"]["profiles"][-1]["id"] = "surface-web"
        self.save()
        with self.assertRaisesRegex(ContractError, "profile-applicability"):
            plan(self.root)

    def test_transitive_cycle_versions_and_conflicts(self):
        a = self.local("local-a", requires=[dict(id="local-b", version="0.1.0")])
        b = self.local("local-b")
        self.select("local-a")
        self.assertEqual(len(inspect(self.root, "feature", ["src/a"])["profiles"]), 3)
        b["requires"] = [dict(id="local-a", version="0.1.0")]
        self.write("local/local-b.json", canonical(b))
        with self.assertRaisesRegex(ContractError, "requirement-cycle"):
            plan(self.root)
        b["requires"] = []
        b["conflicts"] = ["local-a"]
        self.write("local/local-b.json", canonical(b))
        with self.assertRaisesRegex(ContractError, "profile-conflict"):
            plan(self.root)
        b["conflicts"] = []
        self.write("local/local-b.json", canonical(b))
        self.local("local-b-v2", id="local-b", version="0.2.0")
        self.select("local-b", "0.2.0")
        with self.assertRaisesRegex(ContractError, "version-conflict"):
            plan(self.root)

    def test_local_shadowing_and_explicit_duplicate(self):
        self.local("shadow", id="surface-library-cli")
        with self.assertRaisesRegex(ContractError, "duplicate-profile-definition"):
            plan(self.root)
        self.config["localProfiles"] = []
        self.config["profiles"] = deepcopy(self.config["components"]["main"]["profiles"])
        self.save()
        with self.assertRaisesRegex(ContractError, "duplicate-selection"):
            plan(self.root)

    def test_presets_coalesce_with_origins(self):
        self.config["presets"] = [dict(id="library-cli", version="0.1.0", component="main")]
        self.save()
        profiles = inspect(self.root, "feature", ["src/a"])["profiles"]
        self.assertTrue(any(len(p["origins"]) > 1 for p in profiles))

    def test_gate_or_and_whole_selector_union(self):
        gates = {}
        gate = deepcopy(self.config["gates"][0])
        gate.update(binding=None, environment=None, required=True)
        gate["applicability"] = dict(components=[], paths=["src/a"], tasks=["feature"])
        provenance = origin("fixture", "0.1.0", "project", "gates")
        merge_gate(gates, "project", gate, provenance, self.config)
        gate.update(required=False, applicability=dict(components=[], paths=["src/b"], tasks=["docs"]))
        merge_gate(gates, "project", gate, provenance, self.config)
        merged = gates["project/synthetic"]
        self.assertTrue(merged["required"])
        self.assertFalse(applicable(merged, self.config, "docs", ["src/a/deleted.py"]))
        self.assertTrue(applicable(merged, self.config, "docs", ["src/b/deleted.py"]))
        self.assertFalse(applicable(merged, self.config, "docs", ["src/bad/file.py"]))

    def test_binding_conflict_rejected(self):
        gate = deepcopy(self.config["gates"][0])
        gate["environment"] = "nonexistent"
        self.config["gates"] = [gate]
        self.save()
        with self.assertRaisesRegex(ContractError, "binding-environment-conflict"):
            plan(self.root)

    def test_component_paths_rebase_and_deleted_files_count(self):
        self.config["components"]["main"]["path"] = "packages/tool"
        profile = self.local()
        gate = deepcopy(self.config["gates"][0])
        gate.update(id="scoped-check", binding=None, environment=None)
        gate["applicability"] = dict(components=[], paths=["src"], tasks=["feature"])
        profile["policy"]["verification"] = [gate]
        self.write("local/local-checks.json", canonical(profile))
        self.select("local-checks")
        report = inspect(self.root, "feature", ["packages/tool/src/deleted.py"])
        scoped = report["gates"]["component:main/scoped-check"]
        self.assertEqual(scoped["clauses"][0]["paths"], ["packages/tool/src"])
        self.assertTrue(scoped["applicable"])
        self.assertFalse(inspect(self.root, "feature", ["src/deleted.py"])["gates"]
                         ["component:main/scoped-check"]["applicable"])

    def test_overlapping_roots_rejected(self):
        self.config["components"]["nested"] = deepcopy(self.config["components"]["main"])
        self.config["components"]["nested"]["path"] = "src/nested"
        self.save()
        with self.assertRaisesRegex(ContractError, "overlapping-component-roots"):
            plan(self.root)

    def test_gate_scalar_conflict_rejected(self):
        gates = {}
        gate = deepcopy(self.config["gates"][0])
        provenance = origin("fixture", "0.1.0", "project", "gates")
        merge_gate(gates, "project", gate, provenance, self.config)
        gate["category"] = "review"
        with self.assertRaisesRegex(ContractError, "gate-conflict"):
            merge_gate(gates, "project", gate, provenance, self.config)

    def test_weakening_and_unsupported_layout_fail_closed(self):
        self.config["overrides"] = [dict(field="gates.consumer.required", scope="component:main", value=False,
                                        decision="docs/adr/accepted.md", authority="owner", reason="requested")]
        self.write("docs/adr/accepted.md", "Status: Accepted\n")
        self.save()
        with self.assertRaisesRegex(ContractError, "override-not-authorized"):
            plan(self.root)
        self.config["overrides"] = []
        self.config["project"]["layout"] = "multi-repository"
        self.save()
        with self.assertRaisesRegex(ContractError, "unsupported-layout"):
            plan(self.root)

    def test_collision_and_tampered_plan_write_nothing(self):
        self.write("CLAUDE.md", "owned by project\r\n")
        candidate = plan(self.root)
        self.assertIn("ownership-collision:CLAUDE.md", candidate["conflicts"])
        with self.assertRaisesRegex(ContractError, "unresolved-conflicts"):
            apply(candidate, self.root)
        self.assertFalse((self.root / ".repo-workflow").exists())
        (self.root / "CLAUDE.md").unlink()
        candidate = plan(self.root)
        candidate["changes"].append(dict(path="src/evil.py", content="bad", before=None, owner="managed", diff=""))
        with self.assertRaisesRegex(ContractError, "stale-plan"):
            apply(candidate, self.root)
        self.assertFalse((self.root / "src").exists())

    def test_duplicate_contributed_target_and_unsafe_owner(self):
        profile = self.local(files=[dict(source="README.md", target=".repo-workflow/core/POLICY.md", ownership="managed")])
        self.write("README.md", "local content")
        self.select("local-checks")
        with self.assertRaisesRegex(ContractError, "ownership-collision"):
            plan(self.root)
        profile["files"][0]["target"] = "src/owned.py"
        self.write("local/local-checks.json", canonical(profile))
        with self.assertRaisesRegex(ContractError, "ownership-collision"):
            plan(self.root)

    def test_stale_config_target_local_source_and_parent(self):
        candidate = plan(self.root)
        self.write("AGENTS.md", "new user instructions")
        with self.assertRaisesRegex(ContractError, "stale-plan"):
            apply(candidate, self.root)
        self.assertFalse((self.root / ".repo-workflow").exists())
        candidate = plan(self.root)
        self.config["project"]["domain"] = "changed"
        self.save()
        with self.assertRaisesRegex(ContractError, "stale-plan"):
            apply(candidate, self.root)
        self.local()
        self.select("local-checks")
        candidate = plan(self.root)
        path = self.root / "local/local-checks.json"
        path.write_text(path.read_text() + "\n")
        with self.assertRaisesRegex(ContractError, "stale-plan"):
            apply(candidate, self.root)
        candidate = plan(self.root)
        (self.root / ".agents").symlink_to(self.root / "outside", target_is_directory=True)
        with self.assertRaisesRegex(ContractError, "symlink-collision"):
            apply(candidate, self.root)

    def test_casefold_symlinks_and_paths(self):
        self.write("agents.md", "other case")
        with self.assertRaisesRegex(ContractError, "path-collision"):
            plan(self.root)
        (self.root / "agents.md").unlink()
        (self.root / ".agents").symlink_to(self.root / "outside", target_is_directory=True)
        with self.assertRaisesRegex(ContractError, "symlink-collision"):
            plan(self.root)
        for path in ("../outside", "/outside", "x/../a", "x\\a", "x\n", ".git/config", "C:/temp", "x//y"):
            with self.subTest(path=path), self.assertRaisesRegex(ContractError, "unsafe-path"):
                relative(path)

    def test_preserve_entry_memory_and_unrelated_skill(self):
        before = "user before\r\n" + START + "\nold\n" + END + "\r\nuser after\r\n"
        self.write("AGENTS.md", before)
        self.write("docs/STATUS.md", "next task: mine\r\n")
        self.write(".agents/skills/other/SKILL.md", "user skill\r\n")
        candidate = plan(self.root)
        apply(candidate, self.root)
        actual = (self.root / "AGENTS.md").read_bytes().decode()
        self.assertTrue(actual.startswith("user before\r\n"))
        self.assertTrue(actual.endswith("\r\nuser after\r\n"))
        self.assertEqual((self.root / "docs/STATUS.md").read_bytes(), b"next task: mine\r\n")
        self.assertEqual((self.root / ".agents/skills/other/SKILL.md").read_bytes(), b"user skill\r\n")
        with self.assertRaisesRegex(ContractError, "already-applied-plan"):
            apply(candidate, self.root)
        self.write("AGENTS.md", actual + "user addition\n")
        self.assertFalse(any(f["code"].startswith("managed-content-drift:AGENTS")
                             for f in doctor(self.root, "docs", ["README.md"])["findings"]))

    def test_malformed_entry(self):
        for local in [START, END, END + START, START + END + START + END]:
            with self.assertRaisesRegex(ContractError, "entry-block-conflict"):
                merge_entry(local, START + "new" + END)

    def test_initial_failure_retains_before_images(self):
        candidate = plan(self.root)
        from repo_workflow import install
        real_atomic = install.atomic
        calls = []
        def fail_one(path, data, mode=0o644):
            calls.append(str(path))
            if str(path).endswith("/core/POLICY.md"):
                raise OSError("injected disk failure")
            return real_atomic(path, data, mode)
        with patch("repo_workflow.install.atomic", side_effect=fail_one):
            with self.assertRaisesRegex(OSError, "injected disk failure"):
                apply(candidate, self.root)
        journal = json.loads(next((self.root / ".repo-workflow/transactions").glob("*.json")).read_text())
        self.assertEqual(journal["state"], "interrupted")
        self.assertTrue(journal["completed"])
        self.assertEqual(journal["changes"], candidate["changes"])
        with self.assertRaisesRegex(ContractError, "incomplete-transaction"):
            apply(candidate, self.root)

    def test_harness_routes_and_selected_content(self):
        apply(plan(self.root), self.root)
        # Google Antigravity 2.0, Codex and generic use shared canonical discovery.
        self.assertIn(".repo-workflow/index.md", (self.root / "AGENTS.md").read_text())
        self.assertIn("@AGENTS.md", (self.root / "CLAUDE.md").read_text())
        skill = self.root / ".agents/skills/repo-workflow-deliver-slice/SKILL.md"
        self.assertIn("name: repo-workflow-deliver-slice", skill.read_text())
        self.assertFalse((self.root / ".agent").exists())
        profile_names = [p.name for p in (self.root / ".repo-workflow/profiles").iterdir()]
        self.assertEqual(profile_names, ["component-main--surface-library-cli.json"])
        self.assertLess((self.root / "AGENTS.md").stat().st_size, 2000)
        self.assertFalse((self.root / ".repo-workflow/profiles/surface-unreal.json").exists())

    def test_doctor_drift_budget_missing_prerequisites_and_review(self):
        self.config["review"]["external"] = dict(provider="project-reviewer", policy="required")
        self.save()
        apply(plan(self.root), self.root)
        self.write("docs/STATUS.md", "x" * 10001)
        self.write(".repo-workflow/core/POLICY.md", "edited")
        report = doctor(self.root, "release", ["src/a.py"])
        self.assertFalse(report["completion"])
        self.assertTrue(all(p["result"] == "UNKNOWN" for p in report["prerequisites"]))
        self.assertEqual(report["gates"]["project/external-review"]["result"], "NOT RUN")
        self.assertIn("status-budget-exceeded:docs/STATUS.md", [f["code"] for f in report["findings"]])
        self.assertIn("managed-content-drift:.repo-workflow/core/POLICY.md", [f["code"] for f in report["findings"]])

    def test_docs_only_review_and_commands_never_run(self):
        import subprocess
        with patch.object(subprocess, "Popen", side_effect=AssertionError("must not execute")), \
             patch("os.system", side_effect=AssertionError("must not execute")):
            report = inspect(self.root, "docs", ["README.md"])
            self.assertTrue(report["gates"]["project/independent-review"]["applicable"])
            self.assertFalse(report["gates"]["component:main/consumer"]["applicable"])
            self.assertFalse(report["commandsExecuted"])
            candidate = plan(self.root)
            apply(candidate, self.root)
            self.assertFalse(doctor(self.root, "docs", ["README.md"])["commandsExecuted"])

    def test_strict_json_and_cli_errors(self):
        with self.assertRaisesRegex(ContractError, "duplicate-json-key"):
            decode('{"a":1,"a":2}')
        with self.assertRaisesRegex(ContractError, "invalid-json-number"):
            decode('{"a":NaN}')
        self.assertEqual(main(["apply", "--root", str(self.root)]), 2)


if __name__ == "__main__":
    unittest.main()
