# M7 independent review, round 2

Review time (UTC): 2026-11-27. Verdict: **FAIL**: 1 high, 1 medium and 6 low findings. Transcribed by the coordinator
from the reviewer's hand-back because the reviewer role was read-only; content unchanged in substance.

## Reviewer and independence

Claude code-reviewer subagent with a fresh context; read-only; did not author or integrate the candidate. The session
report was treated as a claim. Probes ran in temporary projects outside the repository.

## Candidate

`fb2543e4aff1848beada710bc6cd690e55c603f9` on `docs/m7-agentic-delivery-roadmap` (clean apart from untracked `.omc/`).
Base `7255f32` (origin/main).

## Checks run (observed)

| Check                                                                                       | Result                                               |
| ------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `bun test tests/delivery.test.ts tests/contracts.test.ts tests/wizard.test.tsx --timeout …` | PASS 18/18 (20.7 s)                                  |
| Same three files with Bun's default 5 s timeout                                             | **FAIL** 17/18: the ledger test timed out (6.6 s)    |
| `bun test tests/delivery.test.ts` with the default timeout                                  | **FAIL** 9/10: same test (12.6 s)                    |
| `bun src/cli.tsx roadmap --root .`                                                          | exit 0, 61% (28/46)                                  |
| Context budget                                                                              | AGENTS 1583 ≤ 2048; core + largest skill 7983 ≤ 8000 |
| Prettier `--check` on changed Markdown                                                      | PASS                                                 |
| Behavioral probes P1–P12                                                                    | See findings                                         |

Not run: full suite, typecheck, `codex review`, `doctor --remote` against GitHub.

## Findings

- **R2-1 (high):** `bun run check` (README, CI) uses Bun's 5 s default; the ledger test in `tests/delivery.test.ts`
  takes 6.6–12.6 s, so C6 is not resolved. The author's 50/50 used `--timeout 600000`, not the documented command.
- **R2-2 (medium):** C5 partly resolved (`src/diagnostics.ts`). Two writers with `worktree: null` both use the main
  checkout and only warn; `../wt-a` and `../wt-a/` are not recognized as the same; an `integrating` task sharing a
  writer's worktree passes.
- **R2-3 (low):** "PR #7 is not yet merged" yields a false drift warning for an OPEN PR and none for a MERGED one.
- **R2-4 (low):** the link scan ignores only triple-backtick fences; `~~~`, longer fences and inline code spans leak.
- **R2-5 (low):** roadmap adoption is detected from a `Progress: **…**` line inside a fenced example, re-creating the
  M7-R2 block.
- **R2-6 (low):** repeated feature headings (for example `### Tasks`) in two milestones collapse into one entry, so one
  feature is never checked.
- **R2-7 (low):** M7-R5 was resolved by editing the F7 item without a recorded owner agreement; the claim that Codex has
  no project-level subagent file is unverified.
- **R2-8 (low):** wizard check paths also narrow the `release` task, so a README-only release skips test/lint/typecheck.

## Round-1 resolution status

| Finding    | Status                                                                          |
| ---------- | ------------------------------------------------------------------------------- |
| C1 / M7-R1 | Resolved; extra narrower or optional `merge` approvals still fail closed (P9)   |
| C2         | Resolved                                                                        |
| C3         | Resolved; existing ledger untouched, edited ledger kept on uninstall (P11, P12) |
| C4         | Resolved (see R2-8)                                                             |
| C5         | Partly resolved (R2-2)                                                          |
| C6         | Not resolved (R2-1)                                                             |
| C7 / S6    | Resolved for unique labels (R2-6); 64-hex candidates accepted                   |
| C8         | Resolved; leftover R2-3                                                         |
| M7-R2      | Resolved; edge case R2-5                                                        |
| M7-R3      | Resolved                                                                        |
| M7-R4      | Resolved                                                                        |
| M7-R5      | Resolved as scope clarification pending owner agreement (R2-7)                  |
| M7-R6      | Resolved                                                                        |
| S1         | Partly resolved (R2-4)                                                          |
| S2–S4      | Accepted known limits; S2 still reproduces                                      |
| S5         | Resolved                                                                        |

## Recommendation

REQUEST CHANGES. Fix R2-1 and R2-2; record owner agreement for R2-7; fix or explicitly accept R2-3…R2-6 and R2-8.
