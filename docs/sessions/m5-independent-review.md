# M5 independent review

Review UTC: 2026-11-12T17:14:31Z. Reviewer: `/root/m5_review`, separately spawned execution context; did not author this candidate. Applied `skills/review-change/SKILL.md`. Base and HEAD: `572dfd996decc9fb38942fb9507958dec18a4cd8`; candidate is the dirty tree identified below, including untracked reports. No deletions. This report is reviewer evidence, outside its own frozen candidate.

Scope: M5 coverage reconciliation, unknown affected-path applicability and doctor diagnostics, tests, usage, status and roadmap. Read AGENTS, STATUS, ROADMAP, REPO_GRAPH, core POLICY/WORKFLOWS, owning M5 reports and original bounded M3 native-pilot report. The external application pilot is outside this review and requires separate independent evidence plus a documentation addendum.

## Findings

- **M5-R1 — medium — completion counts precede required delivery evidence.** `ROADMAP.md:86` and `ROADMAP.md:87` check the two M5 items; STATUS reports 26/28. Core POLICY permits checked outcomes only with required-gate evidence. The dirty M5 candidate is not the published PR head; the follow-up report explicitly records the head must be updated before gate completion. Trigger: treating current 2/3 and 93% as completed delivery. Impact: roadmap overstates completed scope before mandatory current-candidate PR evidence. Record published PR URL/base/current head and applicable gate evidence, or leave items unchecked pending that evidence. Arithmetic is correct: 26/28 rounds to 93%, 2/3 to 67%.
- **M5-R2 — low — current authorization text is stale.** `docs/STATUS.md:43` and `docs/STATUS.md:47` say authorization is missing and should be obtained. The current task now authorizes an isolated application pilot. The follow-up report has equivalent pending-authorization text. Refresh current state when adding pilot evidence; distinguish authorization from observed completion.

No actionable implementation defect found. Whole-clause union preserves task exclusion; unknown dominates excluded clauses but a complete matching clause dominates unknown. Both path and component predicates remain required within a clause. Prefix boundaries and command nonexecution are preserved. Missing-binding BLOCKED results remain separate from applicability. Coverage accurately retains the coordinator-seeded retrieval limitation from M3.

## Independently observed checks

- PASS: `bun run check`, Bun 1.4.0: TypeScript plus 39 tests, 2347 assertions, zero failures. Includes README-required Markdown links and contract validation. Supplemental ephemeral log: `/tmp/repo-workflow-m5-review-check.log`; result persisted here.
- PASS: `git diff --check`.
- Stale relationship graph updated successfully; production callers inspected: inspect/doctor consume gateReport; doctor CLI maps BLOCKED findings to exit 1.

Overall review: FAIL pending the documentation/completion-evidence findings. Source/test behavior: PASS for frozen hashes. No application delivery, remote CI, automatic Claude discovery, Antigravity, owner approval, PR delivery or deployment certification. Reviewer ran no external project pilot, native harness, configured command, remote CI or deployment. M2 and third M5 item remain open. Later edits invalidate affected evidence and require re-review.

## Frozen SHA-256 candidate

- `README.md`: `ea1730a4f98521a7b0babfd06553e34afa2f8886a0d5149652f29f7d961fd943`
- `ROADMAP.md`: `35bd10e8832d65355e0d6eaf3174af6bbe1afcda09981d91bf7ba3f49917194d`
- `docs/STATUS.md`: `35b2d93b33ba8d9ea6d57797bb3a12904258258fab1012f7bdb17aac3695bb3d`
- `docs/USAGE.md`: `46ec7521f8c85f6876d23b8be6a5d0e5ebe7f04bdcf7f54c1819da2cb05222e1`
- `src/cli.tsx`: `b5af3c3b1ac659711556d9223209f316397c4d67db39d4c70505ce7f55c3308f`
- `src/compose.ts`: `c6355faf1802aaf46400990bdd8ebc8b33a3b1d17e4ee3dc4d8b4d5ee2a2839c`
- `tests/fixtures/README.md`: `d9edbb1aab92a2a0766de4438bb38b2c6843c08644a77843450fed443ab926b5`
- `tests/tool.test.ts`: `c249edfc0e88f5893fbbae6540741a852aae2d11be3f80a72b5eb951e91243d9`
- `docs/sessions/m5-follow-up.md`: `7aba2334cc5b6d075404fd147ec34d1ca644219b6d4aeba5da0c6709e69174a6`
- `docs/sessions/m5-planning.md`: `ff34cf2f19c59c6466630eea40088211c35c77b73f9a05c146c569c11e05d9d5`
