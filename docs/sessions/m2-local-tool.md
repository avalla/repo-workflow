# Milestone 2: deterministic local tool

Date: 2026-11-12. Candidate: the commit containing this report, based on M1
`a9d7777e9d923a88a1caed3f9c34b3cf44e2223f`. No packaged release is claimed.

## Implemented

Python source-checkout CLI: inspect, deterministic plan, reviewed initial apply and doctor.
Strict JSON/schema validation, exact transitive scoped composition, origins, compatibility and
monotonic gate merging. Only selected profiles plus shared core/workflow skills are installed.
Plans retain diffs and hashed source/target inputs; apply recomputes them and rejects stale or
tampered plans, ownership collisions and unsafe paths. Existing project memory, unrelated skills
and bytes outside the AGENTS managed block survive. Lock writes occur last; interrupted writes
retain before-images and progress. Existing installs require the future M3 updater.

Antigravity is accepted in configuration and the library/CLI fixture. Shared AGENTS.md and
canonical `.agents/skills` follow current official documentation fetched through Context7.
See [discovery evidence and limitations](../../adapters/README.md). No duplicate harness content.

## Validation

- `python3 tests/validate_contracts.py`: 13 contract checks.
- `python3 -m unittest discover -s tests -p 'test_*.py'`: 24 executable checks on disposable targets.
- Subprocess CLI smoke: inspect → plan → apply → doctor on a temporary library/CLI target.
- `git diff --check`: whitespace validation.

Coverage includes four representative installs, deterministic bytes/origins, dependencies/cycles/
version conflicts, profile applicability, scope and rebasing, deleted paths, selector-clause union,
required-gate retention, binding conflicts, fail-closed overrides, unsupported layouts, unsafe paths,
case/symlink collisions, stale/tampered plans, preservation, repeat apply, interrupted journals,
selected-content routing, drift/budget diagnostics and no configured command execution.
The missing-plan CLI test intentionally emits an error and expects exit code 2.

The graph change tool reported no indexed Python symbol changes, despite the new implementation;
its coverage is insufficient to infer safety. Manual architectural self-review checked boundaries,
write ordering and failure behavior. It is not independent review.

## Limits and next work

Native discovery is NOT RUN: Codex 0.167.0 and Claude Code 2.1.285 were detected, but version
output is not discovery evidence; Antigravity was unavailable. Live CI, external/independent review,
source-project tests, engines and hardware checks are NOT RUN. No source projects were modified.
Evidence ingestion and command execution are absent; prerequisites remain UNKNOWN and applicable
gates NOT RUN/BLOCKED. No passing delivery or review claim follows from these tool tests.

No blocking initial-tool decision remains. All overrides fail closed pending verifiable owner
authorization; multi-repository roots need a separate manifest design. M3 owns three-way updates,
migrations, removal, uninstall, recovery execution and authorized pilot adoption. M3 is not started.
