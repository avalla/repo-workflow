# M7 independent review, round 4

Verdict: **PASS with one open item** (M4-1, medium); 3 low findings; no critical or high. Transcribed by the coordinator
from the reviewer's hand-back (the reviewer role was read-only).

## Reviewer, candidate and checks

Claude code-reviewer subagent, fresh context, read-only, not an author. Candidate
`3e7636e0bd2aa9471a1026512c4194bba5d254ff`; base `origin/main` `7255f32`.

| Check                                                     | Result                                                                |
| --------------------------------------------------------- | --------------------------------------------------------------------- |
| `bun run typecheck`                                       | PASS                                                                  |
| `bun test tests/delivery.test.ts tests/contracts.test.ts` | PASS 15/15 (14.2 s)                                                   |
| Context budget                                            | 7983/8000                                                             |
| `roadmap --root .`                                        | exit 0, no findings                                                   |
| `delivery.base` vs `git check-ref-format --branch` (54)   | Agrees except `@`, `a@b`, `a/@` (conservatively rejected)             |
| `unfenced`, drift and lookup probes                       | As specified                                                          |
| GitHub auto-merge documentation                           | Auto-merge is disabled only by pushes from users without write access |

Not run: Prettier (not installed for the reviewer), full suite, `codex review`, live `doctor --remote`. One read-only
`gh pr view` against a placeholder URL was made by a probe.

## Findings

- **M4-1 (medium):** X1 partly fixed. `--match-head-commit` is checked only when auto-merge is enabled; a later push by
  a user with write access keeps auto-merge enabled, so an unreviewed head can merge. The flag also needs a SHA value.
- **M4-2 (low):** "has not yet been merged", "hasn't yet been merged", "will not be merged", "won't be merged" and
  "aren't merged" still read as merge claims.
- **M4-3 (low):** the recorded lookup argv differs from the executed one (`--jq .state` missing).
- **M4-4 (low, docs):** USAGE promises warnings for unsafe memory files, but a symlinked state file still aborts
  `doctor` (`symlink-collision`) by design of `configuration()`.

## Suggestions

Case-insensitive ownership guards; 17-byte budget headroom; name the tasks in `task-integration-concurrent`.

## Round-3 resolution status

X2, X3, X5/S-a, X6, R3-1, R3-2, S-b, S-c, S-d resolved; X1 partly (M4-1); X4 resolved for entry files (M4-4); X7
resolved (M4-3); R3-3 resolved for the reported phrases (M4-2); S-e accepted.
