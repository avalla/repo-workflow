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

Initial tooling validation: `bun run check`, strict TypeScript plus 27 tests / 195 assertions. Coverage includes contracts,
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

Follow-up validation adds interruption coverage at every install/update/uninstall write boundary,
both resume and rollback, plus expanded usage, adoption, customization and troubleshooting documentation.
Final `bun run check`: strict TypeScript, 30 passing tests / 1,307 assertions; zero failures.
Schema/catalogue/link/context-budget checks and simulated Ink interactions are included.
The [snapshot report](m3-pilot-snapshots.md) records three disposable instruction-copy experiments
and an explicit AutoÉpoque reconciliation analysis. Its byte counts describe a declared read set,
not observed native harness context usage.

Generated AGENTS.md and managed core policy now explicitly require updating affected documentation
alongside implementation and checking links/examples before handoff. This applies across harnesses
and is delivered to existing installations through the normal reviewed update workflow.

Roadmap follow-up: the source roadmap is now an evidence-aware checklist with milestone and overall
counts/percentages. Generated AGENTS/core guidelines require the same convention and refresh after
task/scope changes. A new initialize-once ROADMAP template starts at 0/1 (0%) with one scope-definition
task. Existing roadmap files remain project-owned and are not reformatted by install/update.
Validation: `bun run check` passes (30 tests / 1,310 assertions, strict TypeScript, links and budgets).
Separate disposable-target checks verify new template output, a configured nondefault roadmap path,
preservation of existing roadmaps and preservation of local roadmap edits across updates. Recounting
the source checklist confirms 14/20 items (70%): M1 5/5, M2 4/5, M3 5/10.

Local tooling is verified; full M3 pilot completion is not claimed. Native harness discovery and
real resume/slice/review/handoff have not run. No source project was adopted or modified; no real
independent review, live CI or engine/hardware test ran. Startup bytes/files, lost-context incidents
and conflicts in real agent sessions remain unmeasured. Instruction snapshot counts and conflicts
are recorded separately and cannot substitute for these measurements.
Original verified extraction remains in docs/source-inventory.json; new runtime behavior is authored
from repository contracts and the brief, not claimed as extracted source-project functionality.
Do not publish a release or mark delivery gates passed from these results.
