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

### Review round 1 (candidate `20431ab8`)

Independent review ([report](m7-independent-review.md)): **FAIL**, findings M7-R1…R6 and suggestions S1–S6. External
review (`codex review --base origin/main`, codex-cli 0.167.0, [raw output](m7-codex-review-1.txt)): 6 × P2 and 2 × P3
findings, C1–C8. Dispositions in the fix candidate:

| Finding     | Disposition                                                                                                 |
| ----------- | ----------------------------------------------------------------------------------------------------------- |
| C1 / M7-R1  | Schema requires the `merge` approval to be project-scoped with empty selectors; narrowed selectors rejected |
| C2          | `integrate-delivery`: local verification, then push/PR, then CI on the exact pushed head                    |
| C3          | Ledger template is initialized by an update when `state.tasks` is new and the file is absent                |
| C4          | Wizard gates use the entered check paths as their path selector                                             |
| C5          | `task-worktree-shared` BLOCKED for concurrent writers sharing a worktree or branch                          |
| C6          | Long wizard tests get an explicit 30 s budget                                                               |
| C7 / S6     | Missing rows reported for every nonempty milestone and feature                                              |
| C8          | PR drift compares open, not-merged and merged claims with `OPEN`/`MERGED` independently                     |
| M7-R2       | `doctor` only warns (`roadmap-format-not-adopted`) when the roadmap lacks the progress summary line         |
| M7-R3 / S1  | Unsafe links become `unsafe-linked-file` warnings; fenced code and directory links are ignored              |
| M7-R4       | Ledger `paths` requires at least one entry                                                                  |
| M7-R5       | ADR 0006 records the Codex equivalent (canonical skills plus `codex review`); native files stay Claude-only |
| M7-R6       | ADR 0006 lists the behavior changes for existing installations                                              |
| S5          | `nativeEntryPoints: true` requires the `claude-code` harness                                                |
| S2, S3, S4  | Accepted as known limits; not changed in M7                                                                 |
| 64-hex SHAs | Ledger `candidate` accepts SHA-1 and SHA-256 object names                                                   |

### Local checks

`bun run typecheck` PASS. Targeted `bun test tests/delivery.test.ts tests/wizard.test.tsx tests/contracts.test.ts` PASS
(18/18). The full suite under the default 5 s Bun timeout showed one real failure (a stale skill-text expectation,
fixed) and 14 timeouts on a loaded machine. The write-boundary tests took 322 s (install) and 182 s (uninstall); on
`main` the uninstall boundary test already took 76 s and exceeded its own 60 s budget, so the slowness predates M7.
Their per-test budget is now 600 s. Full-suite result with `--timeout 600000`: typecheck PASS, 50/50 tests PASS in 449
s.

### Pilot

Disposable project (outside this repository): orchestrated, `direct-merge` with `squash` into `main`, Codex optional,
native entry points. Two worker subagents ran in parallel in separate worktrees (`feature/t1-median`,
`bugfix/t2-average-empty`). Independent review passed on each iteration. Codex found E1 (overflow), E2 (README), E3
(error class), E4 (subnormal precision and stale ledger evidence) and E5 (NaN order dependence); E1–E4 were fixed and
integrated serially on `integrate/pilot-m7`. `t1` reached the 3/3 review-iteration limit on E5, which is outside its
acceptance criteria, and is `blocked` awaiting an owner decision; `t2` is `integrating`. The merge gate is NOT RUN. `pr`
and `pr-auto-merge` modes were not exercised (no remote).

### Incident

An external Claude Code plugin Stop hook reformatted eight TypeScript files to Prettier defaults during the session. The
files were restored byte-exactly and `.prettierignore` now limits Prettier to Markdown in this repository.
