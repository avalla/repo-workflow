# ADR 0007: Retire the frozen Python M2 reference

Status: Accepted. Date: 2026-11-27. Supersedes the Python preservation clause of ADR 0005.

## Context

ADR 0005 kept the Python M2 implementation (`repo_workflow/`, `tests/test_tool.py`, `tests/validate_contracts.py`,
`requirements-dev.txt`) as a frozen reference without feature parity. CI and `bun run check` never ran it, M7 adds
behavior it does not have, and the 2026-11-26 review found that two implementations confuse readers about which one is
supported.

## Decision

Remove the Python sources, tests and requirements from the working tree. Bun/TypeScript is the only implementation.
Compatibility with M2-shaped locks and journals stays covered by the Bun tests and fixtures. The removed files remain
available in Git history (last present at `7255f32`), and historical session reports keep their descriptions.

## Consequences

One implementation to maintain and document. Regenerating M2 Python plans requires Bun, as USAGE already states. No
installed project depended on the Python sources at runtime.
