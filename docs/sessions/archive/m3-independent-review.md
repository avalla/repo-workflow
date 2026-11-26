# M3 independent tooling review

Date: 2026-11-12. Reviewed base: `7ae1fbd83cee4a9597d57989f667e2fe83618929`.
The reviewer was a separate read-only agent. This report covers tooling and documentation;
it does not qualify native harnesses, application CI, engine or hardware behavior.

## Findings and corrections

| Finding | Correction | Regression |
| --- | --- | --- |
| Branch-backed Git worktrees failed source identity resolution | Resolve shared loose/packed refs through `commondir` | Real Git worktree with loose, packed and detached HEAD |
| Recovery ignored chmod on newly created files | Validate the intended after-image mode as well as bytes | Both resume and rollback refuse a 0600 edit to a new 0644 file |
| Dead active marker after terminal save or before journal preparation blocked future plans | Explicit recovery reclaims dead marker without replaying terminal changes; orphan recovery requires no unfinished journals | Terminal, orphan and live-process cases |
| Publishing an empty marker before writing its PID left a crash window | Publish a fully written/fsynced owner record through an exclusive hard link | Existing exclusion and recovery regressions; independent source review |
| Concurrent recoveries could steal each other's newly live active marker | Acquire an exclusive recovery guard before reading/reclaiming active ownership | Guard preservation and two-process contention regression |

The expanded README was independently checked against configuration, rendering and lifecycle
behavior. It documents generated structure, ownership, harness routing and qualification limits.
AutoÉpoque adoption was removed from active roadmap scope by the owner; historical evidence remains.

## Validation

The final fix pass completed `bun run check`: TypeScript passed; 36 tests passed, including
the Markdown link and context-budget checks. The reviewer independently reran the six new
regression cases: 6 passed, 31 assertions, with no remaining blocking findings.
Doctor also reports a remaining recovery guard as BLOCKED, rather than showing a clean installation.

Review findings do not count as application pilot completion. Native discovery and real agent
resume/context metrics remain unverified, and unavailable engine/hardware checks remain incomplete.
Malformed markers produced by older versions fail closed; do not delete one while a writer may
still be running. A killed recovery can leave its exclusive guard: preserve evidence and reconcile
it manually only after excluding live owners. Automatic recovery-guard reclamation is unsupported;
this trades availability for safe writer exclusion. Recovery does not promise resilience to
filesystem corruption or power loss.
