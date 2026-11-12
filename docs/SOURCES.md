# Source provenance

Design brief: `Repo_Workflow_Specification_EN.txt`, version 0.1 proposal, 12 November 2026.
Read from the owner's supplied Downloads path; that path is not a runtime dependency.
The [source inventory](source-inventory.json) records exact inspected blob hashes and brief SHA-256.
Source repositories were read using `git show <commit>:<path>`; no checkout, fetch or modification.

| Source | Exact inspected commit | Files read |
| --- | --- | --- |
| Agile Factory Next | `012667f26bf97c3ccbecad6574e822c95c3afe87` | `AGENTS.md`, `.agents/skills/slice-delivery/SKILL.md`, `docs/adr/0006-background-jobs-outbox-bullmq.md` |
| Pizza Hit (local directory named brawlergame) | `bdfe95753bdf6ae98b627166bd6057439be4360d` | `AGENTS.md`, `docs/harness/ITERATION_PIPELINE.md` |

## Verified extraction, condensed rather than copied

- Both snapshots require checked-in sources of truth, bounded delivery, explicit decision status,
  independent review, persisted evidence, and honest missing-check reporting.
- Agile Factory Next uses STATUS/map/ADRs, component boundaries, RLS/permissions, transactional
  outbox and idempotent workers, local versus CI evidence, fresh review and separate Codex review.
  Its ADR-0006 explicitly describes a Postgres BullMQ backend. This verifies that project's recorded
  decision, not upstream library support or runtime correctness; no library compatibility claim is made.
- Pizza Hit separates input/gameplay/presentation, native verification, physical-controller evidence,
  candidate identity, serialized engine ownership, and a light docs-only route. Independent review
  is an execution-context property, and missing hardware does not pass a gate.

These common ideas inform `core/` and the six canonical skills. Project-specific commands, model
brands, languages, multiplayer counts and deployment authority were deliberately not generalized.

## Specification-derived design

Orthogonal dimensions, exact schema fields, JSON format, merge algebra, scoped identity, ownership,
lock/update transaction behavior, budget thresholds, representative presets and acceptance scenarios
are design choices derived from the brief. Profile JSON is marked specification-derived; it does not
claim source code extraction or verified deployment. No source STATUS was read or optimized; the
4–8 KB target is a new policy, not a verified merged change in either source.

## Material differences resolved by an explicit boundary

Agile Factory Next's AGENTS requires owner authorization for staging, while its slice skill permits
staging deploys. Pizza Hit grants routine commit/push in AGENTS, while the pipeline defers to actual
authorization. These source-local permissions are not portable. Core retains no implicit deploy/push
grant; adoption must reconcile owner policy. Neither source instruction governs this repository.
Proposed ADR handling differs too: core forbids implicit acceptance while allowing explicitly scoped
provisional research. Adoption may impose a stricter project invariant.

Not verified: live branches/remotes, source test results, harness discovery, native engine behavior,
library versions, actual profile command bindings, or future installer/update execution. AutoÉpoque
is a Milestone 3 case and was not inspected. No blocking owner decision is needed for M1.
