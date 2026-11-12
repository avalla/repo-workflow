# Delivery workflow controls

Scope: required documentation-current and pull-request manual gates; optional strict
execution.mode (single-agent by default, or orchestrated); wizard choice, effective/inspect
visibility and installed principal/worker procedure. Existing configurations remain valid.
Core gates compose with required OR and conflicting procedures fail rather than replacing policy.

The principal coordinates ownership and integration; worker claims do not prove acceptance.
Review must be independent of candidate authors. Missing agent/remote capabilities are explicit
blockers. CLI reports NOT RUN and never launches workers, runs checks, creates PRs or merges.
This repository change has no PR evidence or independent review yet.

Validation: bun run check passed (37 tests); typecheck, schema/link/context-budget contracts,
Ink interaction, install/update/uninstall and recovery checks passed. Required-OR retention
is also covered by the targeted execution-mode test. Remote PR and native multi-agent execution NOT RUN.
