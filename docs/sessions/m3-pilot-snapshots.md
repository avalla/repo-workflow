# M3 disposable instruction snapshots

Date: 2026-11-12. Tooling base: `fbae6ee8747a1ea7b6351454e085aa6b6ec72512`.
Machine-readable observations and exact instruction hashes: [observations](m3-pilot-observations.json).

## Method and results

Read pinned instruction blobs with `git show <commit>:<path>`. Copy only those documents into a
temporary directory, add the corresponding complete web/Unreal fixture with Antigravity selected,
then run the Bun CLI in separate processes: plan → apply → persist a small docs STATUS/handoff →
inspect docs → update plan → apply → doctor docs. Delete the temporary directory afterwards.
The projects' code, dependencies, commands, credentials and databases are outside this experiment.
No source checkout was changed. The fixture configuration is specification-derived.

All three runs had zero install/update conflicts, preserved original instruction bytes outside the
managed block, retained STATUS/handoff across update and retained required independent review.
Fresh-process inspection succeeded; doctor returned no findings. No configured command ran.
This demonstrates filesystem coexistence and persisted state, not completed delivery or native resume.

| Snapshot | Commit | Declared five-file startup bytes |
| --- | --- | --- |
| Agile Factory Next | `012667f26bf97c3ccbecad6574e822c95c3afe87` | 13,272 |
| Pizza Hit | `bdfe95753bdf6ae98b627166bd6057439be4360d` | 13,856 |
| AutoÉpoque | `81e427a1e18894db8b53fed5670320bbe8b90ef2` | 19,781 |

The declared read set is AGENTS, synthetic STATUS, initialized map, core POLICY and WORKFLOWS.
These are byte counts, not token estimates or observed harness reads. Original AGENTS files alone
are 8,809 / 9,393 / 15,318 bytes; preservation does not meet a small-entry adoption target automatically.
AutoÉpoque additionally routes to CLAUDE and AI-OFFICE, so its real startup cost would be larger.
Lost-context incidents were not measured; a fresh CLI process is not an independent agent session.

## AutoÉpoque reconciliation

Verified from pinned AGENTS.md, CLAUDE.md and AI-OFFICE.md, without running AI Office or touching
its state. The snapshot retains all three. This report recommends an adoption boundary; it does not
change the source project's policy or claim to resolve its runtime authorization.

| Observed tension | Required adoption treatment |
| --- | --- |
| AGENTS asks for confirmation before all non-trivial implementation; canonical AI-OFFICE allows autonomous code changes while reserving architecture approval | Owner reconciles the current instruction hierarchy explicitly; preserve stricter approval until clarified |
| CLAUDE describes three database environments; AI-OFFICE says the test environment is decommissioned | Do not bind or execute commands against that test environment; confirm current usable targets |
| CLAUDE describes manual production operations; AI-OFFICE requires explicit approval | Keep production migration, config push, deploy and restart behind actual approval |
| AI Office owns runtime assignments, action requests and enforced stage transitions | Repo Workflow can supply shared instructions; it cannot replace or bypass that authority |
| Historical memory is embedded in AGENTS | Move history only through an explicitly reviewed project change; preserve it during this installer experiment |

The existing AF Next staging-policy tension and Pizza Hit publishing-policy tension remain documented
in [provenance](../SOURCES.md). No portable preset grants either authority.

## Remaining qualification

Full source copies with real bindings, actual resume/slice/review/handoff sessions, independent review,
native Codex/Claude Code/Antigravity discovery, CI and engine/hardware checks remain NOT RUN.
M3 tooling is implemented; these limited snapshots do not close the full M3 pilot acceptance criteria.
