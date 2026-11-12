# Roadmap

Progress: **70% — 14/20 checklist items complete; 1/3 milestones complete.**
Items have equal weight; this measures completed scope, not effort, time or delivery certification.
Count only checked items below. Round `100 × completed / total` to the nearest whole percent.
Blocked or unverified items stay unchecked; update counts whenever scope or evidence changes.

| Milestone | Items | Progress | State |
| --- | --- | --- | --- |
| M1 — contracts and extracted content | 5/5 | 100% | Complete |
| M2 — deterministic local tool | 4/5 | 80% | Native verification outstanding |
| M3 — safe updates and pilot adoption | 5/10 | 50% | Tooling implemented; full pilots outstanding |

## Milestone 1 — contracts and extracted content

- [x] Define strict configuration and content schemas.
- [x] Define composition, compatibility, gates and ownership rules.
- [x] Extract a small source-verified core and author six modules/four presets.
- [x] Define core workflows, evidence and release/update contracts.
- [x] Add representative configurations, acceptance fixtures and local contract validation.

Evidence: [M1 report](docs/sessions/m1-contracts.md). Declarative scenarios are not all executable;
see [coverage](tests/fixtures/README.md) for current behavior and explicit gaps.

## Milestone 2 — deterministic local tool

- [x] Implement inspect/doctor with selected content and honest missing-check diagnostics.
- [x] Test deterministic resolution, origins, scoping, compatibility and gate retention.
- [x] Implement reviewed install plans, stale/collision rejection and project-byte preservation.
- [x] Provide generic Markdown, Codex, Claude Code and Antigravity discovery contracts without executing configured commands.
- [ ] Verify discovery in native Codex, Claude Code and Antigravity sessions.

Evidence: [M2 report](docs/sessions/m2-local-tool.md). Filesystem contracts are verified;
native harness execution remains NOT RUN.

## Milestone 3 — safe updates and pilot adoption

- [x] Migrate to Bun/TypeScript and implement the Ink configuration wizard.
- [x] Implement three-way updates and compatible schema-v1 lock migration.
- [x] Implement removal/uninstall and journaled resume/rollback; verify every write boundary.
- [x] Document creation, adoption, maintenance, recovery and generated project guidelines.
- [x] Verify disposable instruction-snapshot coexistence and persisted memory for all three sources.
- [ ] Complete an Agile Factory Next pilot on a full disposable copy with verified bindings.
- [ ] Complete a Pizza Hit pilot on a full disposable copy with verified bindings.
- [ ] Reconcile AutoÉpoque's approval hierarchy with its owner before adoption.
- [ ] Verify real resume/slice/review/handoff sessions and measure actual startup bytes/files, context-loss incidents and conflicts.
- [ ] Obtain independent review and applicable CI/native engine/hardware evidence for the pilot candidates.

Evidence: [M3 tooling](docs/sessions/m3-bun-ink.md), [snapshot observations and reconciliation](docs/sessions/m3-pilot-snapshots.md),
[tracked-source qualification](docs/sessions/m3-tracked-copies.md), [usage](docs/USAGE.md).
The development deliverables are implemented. Tracked-copy checks passed for both available pilots;
native sessions and delivery evidence remain outstanding. AutoÉpoque's decision stays open at the
owner's request. Unavailable checks keep delivery gates incomplete.

Release publication is outside this checklist and needs separate authorization plus verified compatibility evidence.
