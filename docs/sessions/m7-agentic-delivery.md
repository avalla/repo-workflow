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
| F7 native entry points  | Optional `.claude/agents/repo-workflow-{worker,reviewer}.md`, `.claude/commands/repo-workflow-deliver.md` and `.codex/agents/repo-workflow-{worker,reviewer}.toml`                                         |
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
| S5          | `nativeEntryPoints: true` requires a native harness (`claude-code` or `codex`)                              |
| S2, S3, S4  | Accepted as known limits; not changed in M7                                                                 |
| 64-hex SHAs | Ledger `candidate` accepts SHA-1 and SHA-256 object names                                                   |

### Review round 2 (candidate `fb2543e4`)

Independent review ([report](m7-independent-review-2.md)): **FAIL**, R2-1…R2-8. External review
([raw output](m7-codex-review-2.txt)): 1 × P1, 4 × P2, 2 × P3, D1–D7. Dispositions:

| Finding   | Disposition                                                                                                  |
| --------- | ------------------------------------------------------------------------------------------------------------ |
| R2-1 / D1 | `test` and `check` scripts pass `--timeout 120000`; the ledger test reuses one installation, 60 s budget     |
| D2        | `integrate-delivery` starts on local gates and reviews; delivery gates and remote CI are produced afterwards |
| D3        | Any change to the candidate's diff, or to base code it relies on, returns the task to `reviewing`            |
| R2-2 / D4 | Checkouts compared as resolved paths; no worktree means the main checkout; `integrating` included            |
| D5 / R2-5 | Roadmap parsing drops fenced blocks before adoption, summary and row checks                                  |
| R2-4      | Link scan drops CommonMark fences (``` and ~~~, any length) and inline code spans                            |
| R2-6      | `roadmap-duplicate-label` BLOCKED                                                                            |
| R2-3      | "not yet merged" and "unmerged" are unmerged claims                                                          |
| D6 / S2   | With several PRs in a paragraph, claims are attributed per sentence                                          |
| D7        | `delivery.base` pattern follows Git ref-name rules (`main/`, `x.lock`, `a//b`, `.x`, `a/.b` rejected)        |
| R2-8      | Wizard adds a `<check>-release` gate that applies to every release                                           |
| R2-7      | Codex custom agents exist (`.codex/agents/*.toml`); generated for both roles instead of narrowing F7         |

### Review round 3 (candidate `99082cf3`)

Independent review ([report](m7-independent-review-3.md)): **PASS**, with low findings R3-1…R3-3 and suggestions
S-a…S-e. External review ([raw output](m7-codex-review-3.txt)): 1 × P1, 5 × P2, 1 × P3, X1–X7. Dispositions:

| Finding  | Disposition                                                                                              |
| -------- | -------------------------------------------------------------------------------------------------------- |
| X1       | Auto-merge is bound to the approved head (`gh pr merge --auto --match-head-commit`); a new head voids it |
| X2       | `orchestrate-delivery` hands off on integration start criteria; integration produces delivery gates      |
| X3       | `task-integration-concurrent` BLOCKED for more than one `integrating` task                               |
| X4       | Unreadable or symlinked memory/entry files become `unsafe-memory-file` warnings                          |
| X5 / S-a | `delivery.base` rejects a leading `/` and `HEAD`, and accepts `+`                                        |
| X6       | Wizard release gates use a task-only selector, so they apply without affected paths                      |
| X7       | `doctor` reports `gh` lookups in `diagnosticLookups` and states remote discovery                         |
| R3-1     | A backtick run followed by another backtick on the line is not a fence opener                            |
| R3-2     | `.codex` added to the component and state ownership guards                                               |
| R3-3     | "has not been merged", "isn't merged", "never merged" are unmerged claims                                |
| S-b      | `approval-merge` is described as the owner's                                                             |
| S-c      | Inline code is stripped per paragraph                                                                    |
| S-d      | Attribution limit documented in USAGE                                                                    |
| S-e      | Accepted: planned worktrees differing only in case are compared case-sensitively until created           |

### Review round 4 (candidate `3e7636e0`)

Independent review ([report](m7-independent-review-4.md)): **PASS** with one medium item (M4-1) and low M4-2…M4-4.
External review ([raw output](m7-codex-review-4.txt)): 1 × P1, 4 × P2, 2 × P3, Y1–Y7. Dispositions:

| Finding    | Disposition                                                                                                                                                                                    |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Y1 / M4-1  | `--match-head-commit <sha>` pins only enabling; auto-merge also needs recorded branch protection that dismisses stale approvals and requires approval of the latest push, else `merge` BLOCKED |
| Y2         | A merge queue must use the configured `mergeMethod`                                                                                                                                            |
| Y3         | Docs are updated on each candidate before review; post-integration only records outcomes                                                                                                       |
| Y4         | Task paths overlap case-insensitively                                                                                                                                                          |
| Y5         | Nested checklist items count                                                                                                                                                                   |
| Y6         | Ledger operations apply when orchestrated; single-agent records stages in status and evidence                                                                                                  |
| Y7         | `delivery.base` uses Git's character denylist (`release@2026`, `feat/#42` accepted; `@`, `@{`, controls rejected)                                                                              |
| M4-2       | Unmerged phrasing accepts stacked modifiers and future tense                                                                                                                                   |
| M4-3       | Recorded lookup argv is the executed argv (`prArgv`)                                                                                                                                           |
| M4-4       | USAGE limits the warning to entry files; state paths fail closed                                                                                                                               |
| Suggestion | `task-integration-concurrent` names the tasks; case-insensitive ownership guards and budget headroom noted, not changed                                                                        |

Round 4 exceeded the default `maxReviewIterations` of 3; further review rounds are an owner decision.

### Review round 5, final (candidate `7fcc858e`)

The owner authorized a fifth and final round after the default limit of three. Independent review
([report](m7-independent-review-5.md)): **PASS**, four low findings. External review
([raw output](m7-codex-review-5.txt)): 1 × P1, 2 × P2, Z1–Z3. Dispositions (no further review round):

| Finding     | Disposition                                                                                                                                                                                                                      |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Z1          | Auto-merge requires recorded protection blocking any head without this workflow's evidence (required check or owner-only code-owner approval of the latest push), else BLOCKED; head change → `--disable-auto`; ADR 0006 updated |
| Z2          | Checkboxes inside HTML comments are not counted                                                                                                                                                                                  |
| Z3          | Headings without items accept a `0/0 N/A` row and need none                                                                                                                                                                      |
| R5-1        | Ordered task items (`1. [ ]`) count                                                                                                                                                                                              |
| R5-2        | Indented code blocks outside a list are not counted                                                                                                                                                                              |
| R5-3        | `direct-merge` onto a base requiring a merge queue is BLOCKED                                                                                                                                                                    |
| R5-4        | Workers update affected docs before verification; the Claude command updates affected docs, not status/ledger, per candidate                                                                                                     |
| Suggestions | "no merge conflicts", "cannot be merged", "is not currently merged", "didn't get merged" handled; case-insensitive overlap kept as conservative                                                                                  |

These fixes were verified by local checks only; they have not been re-reviewed.

### Local checks

`bun run typecheck` PASS. Targeted `bun test tests/delivery.test.ts tests/wizard.test.tsx tests/contracts.test.ts` PASS
(18/18). The full suite under the default 5 s Bun timeout showed one real failure (a stale skill-text expectation,
fixed) and 14 timeouts on a loaded machine. The write-boundary tests took 322 s (install) and 182 s (uninstall); on
`main` the uninstall boundary test already took 76 s and exceeded its own 60 s budget, so the slowness predates M7.
Their per-test budget is now 600 s. Full-suite result with `--timeout 600000`: typecheck PASS, 50/50 tests PASS in 449
s. After round 2 the documented `bun run check` (now with `--timeout 120000`) passed: typecheck PASS, 50/50 tests in 136
s.

### Pilot

Disposable project (outside this repository): orchestrated, `direct-merge` with `squash` into `main`, Codex optional,
native entry points. Two worker subagents ran in parallel in separate worktrees (`feature/t1-median`,
`bugfix/t2-average-empty`). Independent review passed on each iteration. Codex found E1 (overflow), E2 (README), E3
(error class), E4 (subnormal precision and stale ledger evidence) and E5 (NaN order dependence); E1–E4 were fixed and
integrated serially on `integrate/pilot-m7`. `t1` reached the 3/3 review-iteration limit on E5, which is outside its
acceptance criteria, and was escalated. On 2026-11-27 the owner deferred E5 and approved the merge: the reviewed
candidate `c52e224` was squash-merged into the pilot's `main` as `faed2a6` (identical tree; base before `3aac4f3`),
`bun test` passed 11/11 before and after the merge, both ledger tasks reached `done`, worktrees were removed after the
merge and branches kept. `doctor` (current CLI) reports no findings and the pilot roadmap is 100%. Remote CI, `pr` and
`pr-auto-merge` were not exercised (no remote; owner chose not to create one), so the F8 pilot item stays open.

### Incident

An external Claude Code plugin Stop hook reformatted eight TypeScript files to Prettier defaults during the session. The
files were restored byte-exactly and `.prettierignore` now limits Prettier to Markdown in this repository.

### Close-out

PR #5 was merged by the owner on 2026-11-27 as `e3d0ec1`, whose tree is identical to the reviewed head `47c499a`. With
owner authorization the merged branches of PRs #1–#5 were deleted locally and on `origin`, and a stale worktree entry
was pruned. Fifteen M7 items were checked; the `pr`-mode pilot item stays open.
