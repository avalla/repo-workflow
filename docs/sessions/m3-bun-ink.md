# M3 lifecycle tooling and Bun/Ink creation

Date: 2026-11-12. Candidate: local changes following M2 commit
8928c12662d49dad14d4d4c05aaacabb1c553c36; this is not a tagged release.

## Implemented

Bun/TypeScript CLI; pinned React/Ink wizard; Ajv schema validation; scoped composition/rendering;
version-2 plans; schema-v1 locks; three-way updates; compatible lock normalization; uninstall
preserving modified/project content; private before-image journals; resume/rollback; exclusive
writer marker; strict JSON/path/symlink checks; usage guide and ADR 0005. The wizard writes
configuration only, with generic, Codex, Claude Code and Antigravity options. Python M2 sources
and existing contracts/fixtures are preserved.

## Validation

`bun run check`: strict TypeScript check plus 27 tests / 195 assertions. Coverage includes contracts,
catalogue/links/budgets, deterministic/scoped composition, seven three-way fixtures, collisions,
stale/tampered plans, memory/mode preservation, update/removal/uninstall, interrupted install
resume/rollback, interrupted update/uninstall rollback, edits blocking recovery, repeated apply,
and actual Ink rendering with simulated TTY input for validation/confirmation/cancellation.
These UI tests do not prove behavior in every real terminal.

A separate disposable-target experiment used the preserved Python M2 implementation with
jsonschema 4.26.0 to produce a real installation and interrupted journal (injected write failure).
Bun updated that completed installation and resumed that interrupted installation successfully.
Automated tests also exercise synthetic M2-shaped metadata. Supported Bun commands require no Python.
Configured project commands were never executed.

## Remaining evidence

Local tooling is verified; full M3 pilot completion is not claimed. Native harness discovery and
real resume/slice/review/handoff have not run. No source project was adopted or modified; no real
independent review, live CI or engine/hardware test ran. Startup bytes/files, lost-context incidents
and conflicts for Agile Factory Next, Pizza Hit and AutoÉpoque reconciliation remain unmeasured.
Original verified extraction remains in docs/source-inventory.json; new runtime behavior is authored
from repository contracts and the brief, not claimed as extracted source-project functionality.
Do not publish a release or mark delivery gates passed from these results.
