# Roadmap

Progress: **82% — 18/22 checklist items complete; 2/4 milestones complete.**
Items have equal weight; this measures completed scope, not effort, time or delivery certification.
Count only checked items below. Round `100 × completed / total` to the nearest whole percent.
Blocked or unverified items stay unchecked; update counts whenever scope or evidence changes.

| Milestone | Items | Progress | State |
| --- | --- | --- | --- |
| M1 — contracts and extracted content | 5/5 | 100% | Complete |
| M2 — deterministic local tool | 4/5 | 80% | Native verification outstanding |
| M3 — safe updates and pilot adoption | 9/9 | 100% | Bounded documentation adoption complete |
| M4 — review follow-up and application pilot | 0/3 | 0% | Planned |

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
Codex startup and explicit Claude routing were exercised; Antigravity remains NOT RUN.
Closure requires native Antigravity discovery evidence and an explicit Claude qualification result:
verify automatic imports and native skill discovery, or document and accept explicit canonical-path
routing as the supported contract. Explicit reads must not be reported as automatic discovery.

## Milestone 3 — safe updates and pilot adoption

- [x] Migrate to Bun/TypeScript and implement the Ink configuration wizard.
- [x] Implement three-way updates and compatible schema-v1 lock migration.
- [x] Implement removal/uninstall and journaled resume/rollback; verify every write boundary.
- [x] Document creation, adoption, maintenance, recovery and generated project guidelines.
- [x] Verify disposable instruction-snapshot coexistence and persisted memory for all three sources.
- [x] Complete an Agile Factory Next documentation pilot on a full disposable copy with verified bindings.
- [x] Complete a Pizza Hit documentation pilot on a full disposable copy with verified bindings.
- [x] Verify real resume/slice/review/handoff sessions; measure trace-visible output, entry sizes, context-loss incidents and conflicts.
- [x] Obtain independent review and applicable local checks for documentation pilots; record engine/hardware checks as inapplicable.

Evidence: [M3 tooling](docs/sessions/m3-bun-ink.md), [snapshot observations and reconciliation](docs/sessions/m3-pilot-snapshots.md),
[tracked-source qualification](docs/sessions/m3-tracked-copies.md), [usage](docs/USAGE.md).
The [native pilot report](docs/sessions/m3-native-pilots.md) closes bounded documentation adoption.
This is not application delivery certification. Total harness startup context is not observable in
these traces; measurements cover trace-visible output and on-disk entry sizes. Antigravity remains
unverified. AutoÉpoque adoption was removed from
active scope by the owner on 2026-11-12; Agile Factory Next is the current pattern source.
Historical AutoÉpoque extraction remains documented for provenance. Unavailable checks keep delivery gates incomplete.

## Milestone 4 — review follow-up and application pilot

Added after the 2026-11-12 review of `bd05d9a566717b5bfec8eb71c74c0d0d38a38da8`.
The lower overall percentage reflects added scope; completed M1/M3 evidence is unchanged.
These items are planned, not implemented or validated by this roadmap update.

- [ ] Reconcile acceptance-coverage documentation with completed bounded native pilots. Update tests/fixtures/README.md to distinguish automated fixture coverage, observed native handoffs and still-unverified application delivery; verify consistency with STATUS and the native pilot report.
- [ ] Make missing affected-path scope explicit in inspect/doctor. Report omitted scope as unknown or incomplete rather than silently presenting scoped gates as inapplicable; document the chosen semantics and add regression coverage for omitted scope, matching paths and genuinely unrelated paths.
- [ ] Complete one bounded real application bugfix pilot on Agile Factory Next in an isolated branch/worktree, subject to project authorization. Record a reproducer, acceptance criteria, candidate identity, applicable checks, independent review and fixes, agent-written documentation/memory, and a fresh-session handoff. The receiving session must recover the actual result and next action without coordinator-seeded markers or manual reconstruction of the handoff; record interventions and unavailable checks explicitly.

Prioritize the documentation correction and scope diagnostic before the application pilot.
Keep native harness qualification in M2; this milestone does not duplicate that acceptance item.
The application pilot must respect the target project's instructions and permissions; this roadmap
does not itself authorize modifying another repository, publishing, merging or deploying.
Record pilot evidence in a dedicated session report and link it here before checking the item.

Release publication is outside this checklist and needs separate authorization plus verified compatibility evidence.
