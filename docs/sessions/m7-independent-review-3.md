# M7 independent review, round 3

Verdict: **PASS**: all round-2 findings are resolved; 3 low findings, no critical/high/medium; 5 suggestions.
Transcribed by the coordinator from the reviewer's hand-back (the reviewer role was read-only).

## Reviewer and independence

Claude code-reviewer subagent, fresh context, read-only; did not author or integrate the candidate; the author's notes
were treated as claims. Probes ran in temporary projects outside the repository.

## Candidate

`99082cf3dcba54732634d604da89694bc2ba0aad` on `docs/m7-agentic-delivery-roadmap`; base `origin/main` `7255f32`.

## Checks run (observed)

| Check                                                         | Result                                                                                |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `bun run typecheck`                                           | PASS                                                                                  |
| delivery, wizard and contracts tests with the default timeout | PASS 18/18 (14.2 s)                                                                   |
| `bun src/cli.tsx roadmap --root .`                            | exit 0, 61% (28/46), no findings                                                      |
| Context budget                                                | AGENTS 1583/2048; core + largest skill 7983/8000                                      |
| Prettier on Markdown changed in `99082cf`                     | PASS (archived sessions predate M7)                                                   |
| Codex custom-agent docs                                       | `.codex/agents/*.toml` with `name`, `description`, `developer_instructions` confirmed |
| `delivery.base` vs `git check-ref-format --branch` (22 names) | Agrees except `HEAD` (accepted) and `@`/`a@b` (rejected)                              |
| Codex native lifecycle probes                                 | Install, no-op update, disable, uninstall, collisions as expected                     |
| Ledger checkout probes                                        | Symlink, absolute, case variant, `.` vs `null` all BLOCKED                            |

Not run: full suite, `codex review`, `doctor --remote` against GitHub, native Codex or Claude sessions.

## Findings

- **R3-1 (low):** `unfenced` treats an inline triple-backtick span at line start as a fence opener; the rest of the file
  is dropped (`roadmap-missing-summary`, or `roadmap-format-not-adopted` under `doctor`).
- **R3-2 (low):** `.codex` is generator-owned but missing from the component and state ownership guards in
  `src/compose.ts`.
- **R3-3 (low):** "has not been merged", "isn't merged" and "was never merged" still read as merge claims.

## Suggestions

- **S-a:** reject `HEAD` as `delivery.base`.
- **S-b:** `approval-merge` is recorded by the owner, not produced by integration.
- **S-c:** strip inline code per paragraph.
- **S-d:** document the conservative multi-PR attribution as a known limit.
- **S-e:** planned worktrees differing only in case are not matched on case-insensitive filesystems.

## Round-2 resolution status

R2-1/D1, R2-2/D4, R2-4, R2-5/D5, R2-6, R2-7, R2-8, D2, D3, D6, D7 resolved; R2-3 resolved for the reported phrases (R3-3
remains).
