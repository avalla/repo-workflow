# M5 isolated safeNext bugfix

## Feature

Local-only pilot branch `pilot/m5-bounded-bugfix` in `/tmp/repo-workflow-m5-af`.
Base `ea544fd23f9fa4f8af4aa718bea3da02a32edf00`; code candidate
`fa28b0ae69d094dec6a03ee45fcb8f7b004f0904`. Owner authorized isolated application
and documentation changes, independent review and fresh handoff, without merge or deployment.
No target PR, push, merge or deployment. No migration or UI changes.

## Reproducer and acceptance

Before fix, `safeNext("/a/..//evil.example")` returns `//evil.example`.
Resolving that result against `https://manager.example` navigates to `https://evil.example`.
The existing origin check happens before serializing pathname; dot-segment normalization can
produce a leading double slash. Manager login, password, locale and auth-confirm redirect callers
consume this string. The same-origin invariant is documented by accepted ADR-0007.

Acceptance: reject normalized network-path destinations with the trusted caller fallback;
retain legitimate normalized routes, query and fragment; existing unsafe-input cases still pass.
Three attack regressions failed before the fix (9 pass / 3 fail); after it, all core tests pass.
The fix checks normalized pathname in the shared pure function; no route-specific copies.
Fallback remains a caller-trusted input under the existing API contract.

## Fixes and tests

Code commit above includes the function, regression tests and core README.
Frozen dependency install without scripts PASS. `bun run typecheck` PASS across all workspaces.
`bun run test:unit` PASS across all workspace suites plus 131 tools tests; core 18 pass / 0 fail.
Targeted ESLint and Prettier PASS. Independent review is recorded in `m5-independent-review.md`.
Independent review PASS with no actionable findings; reviewer independently reproduced the before/after regression.

## Interventions and limitations

Repo Workflow was installed from a reviewed local plan using the earlier pilot configuration;
AGENTS gained a managed routing block; project-owned files were retained. CLI ran no project commands.
The command wrapper initially rejected the requested cwd and silently ran in repo-workflow instead:
those typecheck/dependency/test attempts are excluded. One formatter attempt also failed from a
missing cached plugin. Explicit `cd` and installed pinned dependencies corrected execution;
only logs with `-correct` and the targeted lint/core logs qualify final checks.
No markers were seeded. The implementing agent wrote this report and current-state update from
actual code and observed checks. A separate fresh receiving session is asked to recover state
only from project files, without the bug, outcome or next action supplied in its prompt.

## Not verified and next action

Browser login/auth flow, database/e2e, full ci:local, remote CI and remote Codex PR review NOT RUN.
Database and environment changes are outside this pure-function slice; browser end-to-end behavior
is still a delivery gap. The installed pull-request gate remains incomplete: owner authorized only
local target work. Independent review does not waive these gates. No application-release claim.

Next: inspect independent review, address any findings, then present the local patch and check gaps
to the owner for a decision on publishing an AF Next PR. Do not merge or deploy.
