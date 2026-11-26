# M3 tracked-source qualification

Date: 2026-11-12. Tooling candidate: `6eed4d3`.
Exact revisions, bindings and results: [observations](m3-tracked-copy-observations.json).

## Scope and method

Export each pinned source revision with `git archive` into a new temporary directory, preserving
tracked files and symlinks. Do not copy ignored dependencies, credentials, databases or build output.
These archives contained no Git LFS pointer files; external assets and native prerequisites were
not qualified. Delete each temporary directory after collecting results.

Start from the web/Unreal acceptance configuration, select all four harnesses, set the project
layout to monorepo and use the actual component path. Verify one command binding against the
pinned source: Agile Factory Next's root `typecheck` package script and Pizza Hit's Python
candidate-admission test script. This verifies binding existence, not successful execution or
complete gate coverage. Configuration choices remain authored; they are not extracted policies.

Run the Bun CLI in fresh processes: install plan → apply → update plan → apply → inspect docs →
doctor docs. Plans are applied only inside the disposable directory. Hash every original regular
file before and after, and compare source worktree status before and after the experiment.
No configured application command runs, and no source project receives an installation or push.

## Results

| Copy | Original regular files | Original bytes | Install/update conflicts | Doctor |
| --- | --- | --- | --- | --- |
| Agile Factory Next | 673 | 6,607,391 | 0 / 0 | STATUS budget warning |
| Pizza Hit | 1,536 | 673,078,023 | 0 / 0 | No findings |

Both install/apply/update/inspect/doctor sequences returned exit code zero. The only original
regular file whose hash changed was `AGENTS.md`, the installer's declared managed-block target.
All other original regular files, including existing project memory and instructions, retained
their hashes. Both source worktree status snapshots remained unchanged.

Agile Factory Next's existing `docs/STATUS.md` exceeds the warning budget. The tool preserves it
and reports `status-budget-exceeded`; this does not authorize rewriting project memory.
`doctor` warnings do not make its exit code nonzero; blocked diagnostics do.

## Delivery boundary and next action

The development deliverables are implemented and the local suite passes: strict TypeScript,
30 tests and 1,314 assertions after adding this report's links. This experiment extends the earlier instruction snapshots to
complete tracked-source archives. It does not close the full pilot acceptance criteria.

Native Codex/Claude Code/Antigravity discovery, actual agent resume/slice/review/handoff sessions,
observed startup reads/context-loss counts, application CI/engine/hardware checks and independent
review remain NOT RUN. Binding existence cannot substitute for those outcomes.

The owner explicitly elected to keep AutoÉpoque's approval hierarchy undecided and continue other
development. Its adoption remains deferred; no policy precedence is inferred.
Next: qualify the two disposable candidates in the actual harnesses, obtain required review and
application evidence, then update the existing M2/M3 checklist. No later milestone was implemented.
