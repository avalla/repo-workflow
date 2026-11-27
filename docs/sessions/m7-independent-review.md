# M7 independent review

Review time (UTC): 2026-11-26T23:54Z. Verdict: **FAIL** — 2 medium and 4 low actionable findings; 6 suggestions.

## Reviewer, context and independence

Reviewer: Claude agent (Opus 5.5), a background subagent started for this review with a fresh context. It did not
author, edit or integrate any part of the candidate and received only the task, the candidate identity, the policy
pointers and the review scope, not the implementer's conclusions. The candidate's own session report
(`docs/sessions/m7-agentic-delivery.md`) was read as a claim to verify, not as evidence. No repository file other than
this report was modified. Probes ran only against temporary projects under the OS temp directory.

## Candidate and base

- Candidate: `20431ab8f7fa022d640a91612b2b153ea7d17eb7` on `docs/m7-agentic-delivery-roadmap` (HEAD at review time). The
  working tree had no tracked changes. The only untracked path was `.omc/` (not part of the candidate), and the ignored
  `repo_workflow/__pycache__/` was a local leftover.
- Base: `7255f32` (origin/main, merge of PR #4).
- Diff: 89 files, +1678/−1792, including the renames into `docs/sessions/archive/`.

## Scope

The task is `ROADMAP.md` Milestone 7, F1–F8, with decisions in ADR 0006 and ADR 0007. I reviewed the full
`git diff 7255f32..20431ab`, covering these areas:

- the schemas (`config`, `tasks`);
- `src/compose.ts`, `src/render.ts`, `src/diagnostics.ts`, `src/init.tsx` and `src/cli.tsx`;
- the templates;
- the new and changed skills (`orchestrate-delivery`, `integrate-delivery`, `external-review`, `technical-assessment`,
  `update-docs`, `handoff`);
- the Claude Code adapter files;
- `core/`, README, USAGE, ADOPTION, `adapters/README.md` and `schemas/README.md`;
- the tests;
- the Python removal.

For the archived session files I checked only that their links resolve.

## Checks run (observed)

| Check                                                                                           | Result                                                                                         |
| ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `bun run typecheck`                                                                             | PASS (`tsc --noEmit`, exit 0)                                                                  |
| `bun test tests/contracts.test.ts tests/delivery.test.ts tests/wizard.test.tsx --timeout 60000` | PASS: 17 pass, 0 fail, 280 expect() calls (53.6 s)                                             |
| `bun src/cli.tsx roadmap --root .`                                                              | exit 0, no findings: 61% — 28/46; 4/7 milestones; M7 0/16 with F1–F8 rows matching             |
| `bun test tests/tool.test.ts --timeout 600000`                                                  | PASS: 32 pass, 0 fail, 2967 expect() calls (303 s)                                             |
| Context budget (`tests/contracts.test.ts`)                                                      | PASS: AGENTS.md 1583 ≤ 2048 B; core 5005 B + largest skill 2978 B = 7983 ≤ 8000 B              |
| Markdown link resolution, all `.md` including the archive (contracts test)                      | PASS                                                                                           |
| Prettier 3.10.1 `--check` on added/modified `.md` outside the archive                           | PASS. Archive files that fail were already unformatted at base (pure renames)                  |
| Behavioral probes in temporary projects (scripts outside the repo)                              | See findings. Native entry-point removal on toggle-off and pre-existing file collision were OK |

The core budget has 17 bytes of headroom: any growth of `core/` or `security-assessment` breaks it.

## Actionable findings

### M7-R1 — Medium — merge approval can be narrowed so a merge gate applies without the approval applying

- Location: `schemas/config.schema.json:623-675` (the merge-mode `if/then`), with `src/compose.ts:126-129`.
- Trigger: a config with `delivery.integration: direct-merge` (or `pr-auto-merge`) and an approval
  `{id: merge, scope: project, policy: required, applicability: {tasks: ["release"]}}`. A path-scoped approval such as
  `paths: ["never-touched"]` does the same.
- Evidence: the probe ran `inspect(root, 'feature', ['src/a.ts'])`. The result was `project/merge` required/applicable
  `true/true` and `project/approval-merge` required/applicable `true/false`, with no pull-request gate. A `bugfix` task
  with the path-scoped approval also gave merge applicable `true` and approval-merge `false`.
- Impact: the schema's `contains` pins only `id`, `scope` and `policy`, so the config passes validation. The gate report
  then tells the harness that the merge approval does not apply to feature or bugfix merges, while the merge gate does.
  ADR 0006 and F1 promise that merge modes "require an explicit owner `merge` approval". This is fail-open for every
  task the approval does not cover.
- Expected: require `applicability` to be global (empty components, paths and tasks), or make compose reject a merge
  mode whose `approval-merge` clauses do not cover every clause of `merge`. Add a regression test.

### M7-R2 — Medium — `doctor` now BLOCKS existing installations whose roadmap is not in the template's exact format

- Location: `src/cli.tsx:25`, `src/diagnostics.ts:31-45`.
- Trigger: an installed project whose configured roadmap has no line matching
  `Progress: **N% — a/b checklist items complete; c/d milestones complete.**`, or has no table row per milestone.
  Examples are a project-owned roadmap or iteration file, as in the M3 Pizza Hit reconciliation, or a roadmap written
  before this template. Probe: `## Iteration 3` with two checkbox items made doctor return
  `roadmap-missing-summary=BLOCKED` and `roadmap-missing-row:Iteration 3=BLOCKED`, so exit 1.
- Impact: `doctor` used to exit 0 for such projects and now exits 1 with no configuration change and no opt-out. That is
  a behavior change for existing configurations. It conflicts with F6 ("keep flat milestones valid for existing roadmaps
  without features") and with USAGE:93 ("Existing roadmaps are preserved…; adopt the format there deliberately"), which
  implies adoption is optional. The `roadmap` command is explicit, but `doctor` makes it mandatory.
- Expected: one of the following.
  - Report a missing summary or format in `doctor` as WARNING or NOT RUN (`roadmap-format-not-adopted`), and keep
    BLOCKED for real mismatches in roadmaps that carry the summary.
  - Gate the check on an explicit configuration opt-in.
  - Record the breaking behavior in ADR 0006 and the release notes.

### M7-R3 — Low — the drift link check aborts `doctor` (exit 2) on user prose instead of reporting a finding

- Location: `src/diagnostics.ts:95`: `fs.existsSync(target.track(resolved))`, where `Inputs.track` calls `checked`.
- Trigger: STATUS or ROADMAP links to a symlinked file (`symlink-collision`) or uses a different letter case from an
  existing entry (`path-collision`, common on case-insensitive macOS volumes).
- Evidence: `driftFindings` threw `symlink-collision: docs/sessions/link.md` and `path-collision: docs/sessions/X.md`.
  `main(['doctor', ...])` returned 2 with `{"error": "symlink-collision: …"}`.
- Impact: one Markdown link in project-owned memory hides every other doctor finding (ledger, managed drift,
  transactions). It still fails closed, but the diagnostic is lost.
- Expected: catch per link and emit `missing-linked-file` or `unsafe-linked-file` as WARNING. Add a test.

### M7-R4 — Low — active ledger tasks with no owned paths bypass the overlap check

- Location: `schemas/tasks.schema.json:46-52` (`paths` has no `minItems`), `src/diagnostics.ts:69-73`.
- Trigger: two `implementing` tasks with `paths: []`.
- Evidence: doctor findings were `[]`.
- Impact: F2 asks doctor to report overlapping owned paths among active tasks. A writer with no declared ownership
  cannot be checked and could write anywhere. orchestrate-delivery requires owned paths, but the validator does not.
- Expected: `minItems: 1`, or a BLOCKED or WARNING `task-missing-owned-paths` for active or writing stages.

### M7-R5 — Low — F7 asks for a Codex equivalent; the candidate generates Claude Code entry points only

- Location: `src/render.ts:25` (`NATIVE` has only `claude-code`), `adapters/README.md:32`, ROADMAP F7.
- Trigger and impact: the F7 item says "Claude Code worker/reviewer subagents and a delivery command, plus the Codex
  equivalent". The candidate documents "Codex needs no wrapper" instead. ADR 0006 mentions only Claude Code entry points
  and does not record a decision to drop the Codex part. Judged against the item, F7 is incomplete, or its scope changed
  without a recorded decision.
- Expected: either deliver the Codex entry points, or record the scope decision (an ADR 0006 amendment) and amend the F7
  item text with owner agreement.

### M7-R6 — Low — ADR 0006 overstates backward compatibility

- Location: `docs/adr/0006-configurable-delivery-integration.md:41`; `schemas/config.schema.json` allOf[0].
- Trigger: `review.external: {provider: null, policy: "optional"}` was valid at base, because only `required` needed a
  provider. It is now rejected (`tests/delivery.test.ts` asserts `schema-validation`). With a provider, `optional` also
  now adds a non-required `external-review` gate that did not exist before.
- Impact: the ADR says "Existing configurations resolve as before, except effective policy now exposes resolved
  `execution` defaults and `delivery`". Configurations of the base shape will fail to load after upgrade without
  warning. The behavior change itself is a reasonable decision.
- Expected: list this incompatibility and the new optional gate in the ADR consequences and USAGE.

## Suggestions and questions (not blocking)

- **S1:** `missing-linked-file` has false positives (WARNING only). They come from directory links (`sessions/`
  normalizes with a trailing slash and fails `relative`), and from links inside inline code or fenced code (probe: both
  flagged). The roadmap parser already skips fences, so the link scan could too.
- **S2:** `pr-state-drift` matches claims per paragraph, not per citation. A paragraph that says "#5 is open; #4 merged"
  flags both PRs (probe: two WARNINGs).
- **S3:** `task-parallel-limit-exceeded` counts only `implementing`, `verifying` and `fixing`. Three `reviewing` tasks
  plus one writer under `maxParallel: 2` produce no finding. Is that the intended meaning of "parallel workers"? Either
  way, document it.
- **S4:** F4 says update-docs is "referenced by documentation-current". `core/POLICY.md:11` does that, but the gate's
  own procedure text (`src/compose.ts:106`) does not name update-docs. Consider adding it, so the effective gate report
  is self-describing.
- **S5:** `execution.nativeEntryPoints: true` without the `claude-code` harness does nothing, silently. A diagnostic
  would make the misconfiguration visible.
- **S6:** the roadmap check flags missing rows only for milestones. A feature without a table row is not reported,
  although F6 asks for per-feature percentages. The `candidate` pattern accepts SHA-1 only (40 hex), so SHA-256
  repositories cannot record a candidate.

## Acceptance observations

- F1–F6 and F8 reconciliation are implemented as described, apart from R1, R2, R4, R5 and R6.
- STATUS records PRs #1–#4 as merged. The AGENTS.md authorization statement is gone. ADR 0007 retires Python, and its
  removal is complete in the tree. M1–M6 evidence is archived with links that resolve.
- Every M7 ROADMAP item stays unchecked, and `roadmap` verifies 0/16. That is consistent with policy, because the pilot
  and this review were outstanding.
- The F8 pilot (two parallel workers, Codex review, `pr` and `direct-merge`) has not been run. M7 cannot close until it
  has.
- Composition: `pr` keeps `pull-request` required and adds no merge gate. `pr-auto-merge` keeps `pull-request` and adds
  a required `merge`. `direct-merge` swaps `pull-request` for a required `merge`. The approval is required by schema
  (with the R1 caveat).
- Project gates with the same ID cannot lower `required`, because `required ||=` applies. A binding combined with the
  core procedure raises `gate-conflict`, and duplicate `merge` approvals raise `gate-conflict` (probe), so both fail
  closed.
- `single-agent` with `maxParallel ≠ 1` is rejected.
- `allowedTarget` admits only `.claude/{agents,commands}/repo-workflow-*.md` with `managed` ownership. Install, update
  and uninstall behave safely:
  - disabling `nativeEntryPoints` removes unchanged files on update;
  - uninstall keeps an edited worker file;
  - a pre-existing user file raises `ownership-collision`.
- The `gh` call uses an argv array without a shell. The URL is regex-bounded and starts with `https://`, so option
  injection is not possible. Stdin is ignored, there is a 20 s timeout, and failures map to UNKNOWN.
- In the wizard, conditional steps (`maxParallel`, `nativeEntryPoints`, `mergeMethod`, `checkPaths`) depend only on
  earlier answers. Every step re-validates through `resolve`. A merge mode adds a global required `merge` approval.

## Checks not run

- Native harness execution of the generated subagents and command. They are not qualified, and the candidate does not
  claim they are.
- `codex review`, and `doctor --remote` against real GitHub.
- The F8 orchestrated pilot, and remote CI.
- `bun run check`, beyond the commands listed above.
