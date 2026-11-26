# M7 — configurable agentic delivery

Status: implementation candidate under review. This report is updated as evidence arrives; unchecked roadmap items stay
unchecked until their evidence is recorded here.

## Scope

Roadmap Milestone 7 (16 items, features F1–F8), added after the 2026-11-26 project review. Base: `main` at `7255f32b`
(merge of PR #4). Branch: `docs/m7-agentic-delivery-roadmap`. Decisions:
[ADR 0006](../adr/0006-configurable-delivery-integration.md), [ADR 0007](../adr/0007-retire-python-reference.md).

## Implementation

| Feature                 | Delivered                                                                                                                                                                                                  |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F1 configuration/wizard | `delivery` modes and merge-approval schema rules; `maxParallel`, `maxReviewIterations`, `nativeEntryPoints`; optional external review semantics; Ink wizard with select/multi-select and conditional steps |
| F2 orchestration        | Staged `orchestrate-delivery` (plan approval, worktrees, iteration limits, resume); `tasks.schema.json` ledger and `doctor` validation; `integrate-delivery` serial integration and CI states              |
| F3 external review      | `external-review` procedure for Codex (`codex review --base`/`--uncommitted`)                                                                                                                              |
| F4 handoff/docs         | `handoff` reduced to resumable state plus orchestration resume; new `update-docs`; drift diagnostics                                                                                                       |
| F5 technical assessment | `technical-assessment` procedure, routed in core workflows                                                                                                                                                 |
| F6 progress             | Milestone → feature → item roadmap policy/template; `roadmap` command and `doctor` check                                                                                                                   |
| F7 native entry points  | Optional `.claude/agents/repo-workflow-{worker,reviewer}.md` and `.claude/commands/repo-workflow-deliver.md`                                                                                               |
| F8 reconciliation       | STATUS rewritten (PRs #1–#4 merged), stale authorization removed from AGENTS.md, Python reference retired, M1–M6 evidence archived under `sessions/archive/`                                               |

## Evidence

Recorded below after local checks, independent review, external review and the pilot.
