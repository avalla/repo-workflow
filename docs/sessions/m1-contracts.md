# Milestone 1 evidence

Scope: schemas, composition, ownership, workflows, representative profiles/presets, acceptance
fixtures, concise entry documents, ADRs and roadmap. Workspace was empty at initial inspection.
All repository files were added; no existing workspace files required modification or removal.

Source inspection: exact brief commits were available locally; read-only Git object reads verified
the sources listed in [provenance](../SOURCES.md). New composition/update/schema decisions remain
explicitly specification-derived. Source projects were neither checked out nor modified.

Validation command: `python3 tests/validate_contracts.py` with the pinned development dependency.
Result: **PASS — 13 tests**, Python 3.11.15, jsonschema 4.26.0. This covers six schema definitions,
four valid project configurations, six profiles, four presets, five invalid configurations, nested
unknown fields, path syntax, ordered/repeated argv, gate/reviewer/override constraints, catalogue and
binding references, lock base hash, evidence states/date validity, links and context byte budgets.
The 40 future acceptance scenarios pass inventory checks only; their behavior remains NOT RUN.

Candidate: [SHA-256 manifest](m1-candidate.json) identifies every deliverable, including this report,
and records verification time. The manifest excludes itself to avoid a circular hash. No Git revision
exists in this new workspace. Verify the manifest before reusing this evidence after edits.

Measured UTF-8 startup artifacts: AGENTS 1,111 bytes; CLAUDE 247 bytes; STATUS 1,704 bytes;
core plus largest single skill 4,158 bytes. These are byte measurements, not token estimates.
The initial test run exposed optional date-format checking that did not reject invalid timestamps;
the validator now explicitly checks UTC dates using the standard library. The final run passes.

Architectural review: performed locally by the implementer. Boundaries separate provider-neutral
policy, scoped technical profiles, project authority and harness discovery. No production CLI,
resolver, installer, registry, daemon or adoption change is included. Independent review: NOT RUN.
Behavioral resolver/updater fixtures: NOT RUN; their inventory is validated, behavior is future work.

Decisions resolved: JSON interchange; strict unknown fields with explicit settings extension bag;
scoped gate identity and OR-of-selector-clauses; command argv; separate approvals; embedded UTF-8
lock bases; stale-plan refusal; journaled recovery; multi-repository execution reserved/unsupported.
Source staging authority differs across documents; core imports no implicit deployment grant.

Unresolved blocking decisions: none. Pilot owners must later confirm commands, authority and
provider bindings. Adapter discovery and runtime compatibility require real M2/M3 evidence.
Next milestone: deterministic local inspect/plan/apply/doctor, only upon further instruction.
