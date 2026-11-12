# Adopt and customize

Use the [usage guide](USAGE.md) for commands and [schemas](../schemas/README.md) for field definitions.
The tool distributes workflow instructions; project commands and delivery evidence stay project-owned.

## Choose a configuration

Start with the Ink wizard for a new single-component project. For an existing project, first work on
a disposable copy and start from the closest complete [fixture](../tests/fixtures/projects/web.json).
The examples are representative configurations, not extracted application setups or verified command bindings.

| Project shape | Starting configuration | Confirm before adoption |
| --- | --- | --- |
| Library or CLI | [library-cli](../tests/fixtures/projects/library-cli.json) | actual package, typecheck and test commands |
| Web application | [web](../tests/fixtures/projects/web.json) | browser, database, permissions and CI prerequisites |
| Unreal project | [unreal](../tests/fixtures/projects/unreal.json) | engine version, build route, device and controller evidence |
| Mixed monorepo | [mixed-monorepo](../tests/fixtures/projects/mixed-monorepo.json) | component paths, scoped profiles and cross-component gates |
| Unrecognized stack | wizard surface `other` | explicit technical gates; generic fallback cannot infer them |

Set actual component paths and stack labels, then select pinned profiles or presets. Presets expand
to modules; they do not create project scripts. Keep project-wide policy separate from component
policy. Profile IDs/versions must exist in this checkout or in declared local profile files.
Unknown settings, incompatible scope and weakening overrides fail rather than silently winning.
See [composition](COMPOSITION.md) for merge rules and origins.

Add real command bindings, environments and applicable gates only after inspecting the project.
An argv binding is data: this CLI never runs it. Declaring a command does not establish availability,
successful execution, review independence or permission to publish. Record actual evidence separately
using the [evidence schema](../schemas/evidence.schema.json). Evidence is not ingested or certified by this CLI.

## Reconcile existing instructions

Inventory AGENTS.md, CLAUDE.md, skills, state, roadmap, map and ADRs. Read their authority rules
before adopting anything. Resolve conflicting approval or deployment instructions explicitly in the
project's owning policy; an installer cannot choose authority by file order.

Configure `state.current`, `state.roadmap` and `state.evidence` to the project's existing memory
locations before planning installation. For example, a project that resumes through a roadmap and
iteration records should point at the active iteration record rather than initialize a competing
`docs/STATUS.md`. Preserving existing bytes does not by itself reconcile two instruction routes.

Review the installation plan, including its managed AGENTS block, before applying it. Existing
CLAUDE.md stays byte-identical; add routing deliberately if needed. Preserve unrelated skills and
existing memory. Initialize-once files are templates for absent paths, not replacements for the
project's architecture or history. Updates use generated baselines, not the last locally edited text.
See [ownership](OWNERSHIP.md).

The [snapshot report](sessions/m3-pilot-snapshots.md) shows why preservation alone is insufficient:
large instructions remain large, and contradictory policies remain contradictory. No automatic
compaction, policy rewrite, application scaffold or full project migration is provided.

## Work and resume

1. Read AGENTS.md, current STATUS and the relevant map entry. Select only owning contracts and skills.
2. Run `inspect` with task and affected paths. Confirm applicable gates, diagnostics and actual authority.
3. Record a bounded acceptance criterion and candidate identity; implement the slice in the project.
4. Run the project's checks through its normal workflow and record actual results and missing checks.
5. Obtain required independent review, resolve findings, and persist a handoff with next eligible action.

At session end, update the configured state file and a project-owned session report. Include scope,
candidate/base, changed paths, verification evidence, review status, blockers and next action. A new
session must recover those facts from files; `inspect` reconstructs policy, not conversation history.
Use the [context](../skills/maintain-context/SKILL.md) and [handoff](../skills/handoff/SKILL.md) procedures on demand.

Maintain the roadmap as one flat checklist per milestone. Keep a summary with completed/total items
and rounded percentage for each milestone and overall; refresh it after task or scope changes.
Count each item once with equal weight, including blocked items in the total. An empty scope is N/A.
Link evidence for checked outcomes; implementation alone does not satisfy unavailable review or checks.
The CLI initializes this format for missing roadmaps and preserves existing project-owned roadmaps.

## Qualify a harness

Select `generic`, `codex`, `claude-code` or `antigravity` in configuration; combinations share the
same policy. Check the [adapter contracts](../adapters/README.md) for expected entry and skill paths.
In the actual harness, verify root discovery, one selected skill, a fresh-session resume and a
documentation slice. Record harness version, candidate, files actually read and missing capabilities.
An on-disk file check does not establish IDE discovery, permissions or successful independent review.

Before adopting into an original repository, repeat the pilot on a full disposable copy with real
bindings and authorized checks. Record startup bytes/files, context-loss incidents and conflicts.
Leave unavailable native, CI, database or hardware checks incomplete. There is no release or deploy
command, and successful `doctor` output grants no authority.
