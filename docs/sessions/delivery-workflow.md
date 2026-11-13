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

## Review and delivery follow-up

The preceding validation/pending states describe the original snapshot and remain historical.
Independent review now PASS with no actionable findings; see [review](m4-independent-review.md)
for exact source hashes and independently observed checks (37 tests, 2309 assertions).
Implementation commit: `26153826db27d275acdff6663e7936e983929b27`.
Published branch: `feat/assessment-delivery-workflows`; [PR #1](https://github.com/avalla/repo-workflow/pull/1)
targets base `bd05d9a566717b5bfec8eb71c74c0d0d38a38da8` on main.
The PR records its live head; subsequent evidence-only commits do not change reviewed implementation.
M4 closes only installed-procedure and local-contract scope. Native multi-agent/application
execution remains NOT RUN. Remote CI is separate evidence; no merge or deployment performed.
