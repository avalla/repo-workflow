# M5 isolated application pilot

2026-11-12. Owner explicitly authorized the local isolated AF Next application/documentation
pilot and independent review; no target push, PR, merge or deployment was authorized or performed.
Source checkout remains clean and unchanged at `ea544fd23f9fa4f8af4aa718bea3da02a32edf00`.
Shared local clone: `/tmp/repo-workflow-m5-af`; branch `pilot/m5-bounded-bugfix`.
Code candidate: `fa28b0ae69d094dec6a03ee45fcb8f7b004f0904`.

## Reproducer, acceptance and implementation

`safeNext("/a/..//evil.example")` previously returned `//evil.example`, which a subsequent
redirect resolves to an external origin. The existing origin comparison preceded serialization;
URL dot-segment normalization could create a network-path destination. Four Manager redirect
callers share this pure function. Accepted ADR-0007 requires same-origin next redirects.

Reject normalized pathnames starting with `//`; keep the existing trusted fallback and preserve
legitimate normalized routes, query and fragment. Three regressions fail before the fix and pass
after. No database, UI, dependencies or architecture boundary changes.
The [portable code patch](m5-af-safe-next.patch) contains function, tests and package documentation.
The [implementing agent report](m5-af-implementation.md) is a snapshot of the actual target report;
paths within it are target-relative. Project-owned STATUS and REPO_GRAPH were updated in the copy.
Installed workflow files are local-only; target review binds their hashes.

## Observed checks and independent review

- Before fix: [regression log](m5-af-before.log), 9 PASS / 3 FAIL as expected.
- After fix: [core suite](m5-af-after.log), 18 PASS / 0 FAIL / 27 assertions.
- [Frozen dependency install without scripts](m5-af-deps-correct.log): PASS.
- [Workspace typecheck](m5-af-typecheck-correct.log): PASS across all 19 workspaces.
- [Unit summary](m5-af-unit-correct.log): PASS, 1,229 tests across workspaces and tools, zero failures.
- [Targeted ESLint](m5-af-lint.log) and [Prettier](m5-af-format-correct.log): PASS.
- [Independent review](m5-af-independent-review.md): PASS, no actionable findings; reviewer did
  not author code and independently reproduced the before/after behavior. Final document addendum
  reconciles PASS wording; code and lock hashes unchanged.

The source project was never edited; final `git status --short` remained empty. All local project
commands were executed by the agent, not the Repo Workflow CLI. The reviewed install plan added a
managed AGENTS block plus namespaced skills; project-owned memory and rules were retained.

## Fresh-session handoff

[Receiver observation](m5-af-handoff.json) preserves exact prompt, session ID, observed Read tool
inputs, trace digest, snapshot hashes and returned answer. One new Claude session with only Read
was asked to recover current work via AGENTS/current-state routes; the prompt supplied no defect,
expected result, marker, report filename or next action. No conversation resume was used.

PASS for this bounded sample: receiver recovered the actual defect, exact code candidate, checks,
remaining gates and owner publication decision directly from project files. The implementing agent
wrote the documentation/memory from its own work; no other agent draft was manually reconstructed
or marker seeded. No corrective prompt, result editing or retrieval intervention was needed.

The receiver correctly noticed the prior STATUS review hash was stale after pending-to-PASS wording
changed. An independent docs addendum then covered the final bytes. Its original response is retained,
not rewritten. The receiver also stated it saw launch-script context: the launch script contained
no defect, expected outcome or next action. This is one file-recovery observation, not a reliability,
automatic harness discovery, total startup context or release-certification claim.

## Interventions, gaps and closure

Initial wrapper commands rejected the requested cwd and fell back to repo-workflow. Those dependency,
typecheck and unit attempts are excluded. A cached formatter plugin also failed. Explicit `cd` and
pinned installed dependencies corrected execution; only named final logs qualify the checks above.
Source inventory still pointed to an older AF commit; current source HEAD and rules were re-read.

Target required browser/accessibility checks, full ci:local, e2e/database, remote CI and target PR
remain NOT RUN/BLOCKED as appropriate. Independent review PASS does not waive them. Native M2
Antigravity and automatic Claude discovery remain unverified. No merge, deploy or production claim.
M5 pilot checklist stays unchecked under core POLICY: bounded execution succeeded, required target
delivery gates remain incomplete. Updating repo-workflow PR #1 cannot satisfy the target PR gate.

Next: present the reviewed local patch and gaps for a decision on AF Next PR publication; if granted,
complete target-required checks/reviews on that exact candidate before any delivery claim. The
canonical AF source is unchanged; this copy is not an adopted source-project configuration.
