# ADR 0006: Configurable delivery integration and orchestrated execution

Status: Accepted. Date: 2026-11-27. Amends ADR 0002 delivery gates; keeps ADR 0004/0005 boundaries.

## Context

The owner wants agentic delivery where a principal fans out parallel workers, each candidate passes independent review
and, when available, an external Codex review, and the project chooses at installation whether delivery ends at a PR or
at a merge. Until now every change required a PR and merge authority could never be configured.

## Decision

Add optional `delivery: {integration, base, mergeMethod}` with three modes. Omission keeps the previous behavior (`pr`,
no merge authority).

- `pr`: the core pull-request gate stays required; merging is a separate owner decision.
- `pr-auto-merge`: pull-request stays required; a required `merge` gate covers enabling platform auto-merge after every
  other required gate passes. A queued auto-merge is not merged.
- `direct-merge`: no PR. The pull-request gate is replaced by a required `merge` gate that keeps the same evidence
  (base, candidate head, checks, reviews, findings) plus the merge commit.

Both merge modes require `mergeMethod` and a required project approval with ID `merge` in `approvals`; the schema
rejects a merge mode without it. Choosing a merge mode in the wizard records that approval policy; each merge still
needs recorded approval evidence before the gate can pass.

`review.external.policy` keeps `required` (gate required, unavailable provider BLOCKED) and defines `optional`: the gate
is reported but not required, an unavailable provider is NOT RUN with a reason, and it never becomes PASS without a
completed review. Any non-disabled policy needs a provider binding such as `codex`; core text stays provider-neutral.

`execution` gains `maxParallel` (orchestrated only; default 2), `maxReviewIterations` (default 3) and
`nativeEntryPoints`. Orchestrated projects keep a JSON task ledger at `state.tasks`, validated by `doctor` for schema,
dependencies, cycles, overlapping owned paths of active tasks and parallel limits. Workers use one worktree and branch
per task; integration is serial.

The CLI still launches no agents, opens no PRs and merges nothing. Harness-native entry points (Claude Code worker and
reviewer subagents, a delivery command) are optional generator-owned wrappers over canonical skills.

## Consequences

Direct merge is owner policy, not inferred authority: it cannot be enabled without an explicit approval entry, and
missing access still leaves delivery gates BLOCKED. Existing configurations resolve as before, except effective policy
now exposes resolved `execution` defaults and `delivery`. Native qualification of generated subagents remains separate
evidence.
