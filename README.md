# Repo Workflow

A shared operating contract for coding agents: where to find current work, which checks apply,
how to deliver a bounded change, and what evidence must survive between sessions. Generic Markdown,
Codex, Claude Code and Google Antigravity use the same core through small discovery adapters.

Repo Workflow installs instructions and project memory. Application scaffolding, dependency
installation, test execution and deployment remain separate activities. Native discovery remains
unverified; see [current status](docs/STATUS.md) for implemented versus qualified behavior.

## Start a project

Use Bun 1.4.0+ from this source checkout:

```sh
bun install --frozen-lockfile
bun run cli init --root /path/to/new-project
bun run cli plan --root /path/to/new-project > /tmp/workflow-plan.json
# Review changes, diffs and conflicts before applying.
bun run cli apply --root /path/to/new-project --plan /tmp/workflow-plan.json
bun run cli doctor --root /path/to/new-project
```

`init` uses Ink to create `.repo-workflow.json`; application code is configured separately.
Automation uses `init --from <complete-config.json>`. Configured commands are never executed.
Use a pinned source checkout. Plans contain project contents; review and store them locally.

The [usage guide](docs/USAGE.md) covers creation, updates, removal, recovery and troubleshooting.
The [adoption guide](docs/ADOPTION.md) covers configuration choices, existing instructions,
daily work, session handoff and harness qualification, including Antigravity.
[Status](docs/STATUS.md) distinguishes verified behavior from remaining M3 pilot work.
Bun is the supported CLI; Python sources remain as the frozen M2 reference.

```sh
bun run check
```

Read [composition](docs/COMPOSITION.md), [ownership](docs/OWNERSHIP.md),
[harness discovery](adapters/README.md), [provenance](docs/SOURCES.md) and [roadmap](ROADMAP.md).
Diagnostics do not execute gates or certify completion.

## Structure of an installed project

With the default state paths, installation produces the following structure. Application paths
are illustrative: the tool does not generate your application.

```text
my-project/
├── .repo-workflow.json          # Project configuration and command bindings
├── AGENTS.md                   # Project instructions plus one managed routing block
├── CLAUDE.md                   # If selected and absent: imports AGENTS.md
├── .repo-workflow/
│   ├── core/                   # Shared policy and task workflows
│   ├── profiles/               # Selected, scoped profile snapshots
│   ├── index.md                # Index of selected content and canonical skills
│   ├── effective.json          # Resolved policy and origins
│   ├── lock.json               # Source identity, generated baselines and hashes
│   └── transactions/           # Apply/recovery journals
├── .agents/skills/
│   └── repo-workflow-*/SKILL.md # Canonical procedures, loaded on demand
├── docs/
│   ├── STATUS.md               # Current task, evidence, blockers and next action
│   ├── adr/                    # Decisions recorded during project work
│   └── sessions/               # Verification and handoff reports
├── ROADMAP.md                  # Milestone checklists, counts and percentages
├── REPO_GRAPH.md               # Map of responsibilities and owning documents/files
└── src/                        # Your application, maintained separately
```

Missing STATUS, roadmap and map files are initialized from templates. Decisions and session
reports are written as work produces them; the installer does not populate those directories.
The `state` configuration changes their paths. Selected profiles may add other declared files.

| Content | Owner | Update behavior |
| --- | --- | --- |
| Core, selected profiles/skills, index and generated policy | Generator | Three-way comparison against installed baselines |
| AGENTS.md | Project, with one managed block | Only the delimited block is managed |
| Configuration, bindings, state, roadmap, map, ADRs and reports | Project | Existing content is preserved |
| New CLAUDE.md and initialized memory | Project after creation | Never regenerated on update |

Local-only edits survive updates; divergent changes produce conflicts. An existing CLAUDE.md
is preserved. See [ownership](docs/OWNERSHIP.md) before adopting into a repository with existing
instructions or memory.

## Configuration and project types

`.repo-workflow.json` describes components, paths, harnesses, pinned profiles or presets,
workflow routes, command bindings, environments, gates and approvals. Unknown fields fail
validation. The [schemas](schemas/README.md) define supported fields.

Profiles add policy for a layout, surface, technology or capability. Presets select compatible
modules; neither creates package scripts. Project-wide and scoped component policies combine
through declared merge rules, preserving required gates. `inspect` shows the resolved policy
and its origins. See [composition](docs/COMPOSITION.md).

| Project shape | Starting example | Adapt before adoption |
| --- | --- | --- |
| Library or CLI | [library-cli.json](tests/fixtures/projects/library-cli.json) | Actual typecheck, test and package commands |
| Web application | [web.json](tests/fixtures/projects/web.json) | Browser, database, authorization and CI prerequisites |
| Unreal project | [unreal.json](tests/fixtures/projects/unreal.json) | Engine, build, controller and hardware checks |
| Mixed monorepo | [mixed-monorepo.json](tests/fixtures/projects/mixed-monorepo.json) | Component paths and scoped profiles |

These are representative configurations, not verified application setups. For a monorepo,
components point at paths such as `apps/web` and `apps/worker`. Task and affected-path arguments
select relevant policy. One configuration describes one repository root; independent multi-repository
roots remain unsupported. The wizard's stack labels do not install technologies, and its language
setting does not translate the bundled English instructions.

## Integration with harnesses

Select one or several harness IDs in configuration. All share the installed core and canonical
skills, so switching harnesses does not require duplicating project memory.

| Harness ID | Instruction entry | Skill access |
| --- | --- | --- |
| `generic` | Read AGENTS.md explicitly | Paths listed in `.repo-workflow/index.md` |
| `codex` | Root AGENTS.md | `.agents/skills/repo-workflow-*/SKILL.md` |
| `claude-code` | New CLAUDE.md imports `@AGENTS.md` | Read canonical skill paths explicitly |
| `antigravity` | Root AGENTS.md | Shared `.agents/skills/repo-workflow-*/SKILL.md` |

For an existing CLAUDE.md, reconcile its instructions and add `@AGENTS.md` deliberately if
appropriate. Claude-specific skill copies are not generated. Antigravity uses shared paths;
no extra GEMINI.md or legacy `.agent/` directory is generated. The [adapter contracts](adapters/README.md)
record discovery assumptions and native verification limits, including Antigravity's absence locally.

The intended reading sequence is AGENTS.md → current STATUS and relevant map entry → core policy
and task route → selected profiles or skills as needed. This bounds startup context while keeping
decisions and evidence in repository files. Installed instructions are repository-local; reading
them does not require a running service or access to this generator checkout.

Adapters provide discovery. Actual harness permissions, available tools, independent review and
publication/deployment authority must be established in the project environment.

## Daily workflow and handoff

1. Read current state; identify a bounded task, acceptance criteria and affected paths.
2. Inspect applicable policy and gates; confirm actual commands and prerequisites.
3. Implement the slice and update affected documentation alongside the change.
4. Run applicable project checks, record actual evidence and obtain required independent review.
5. Persist results, blockers and next action in STATUS and a session report before handoff.

Keep the project roadmap as milestone checklists with completed/total counts and rounded
percentages. Refresh progress when tasks or scope change; blocked or unverified items stay unchecked.
Progress describes completed scope, not delivery certification. A new session resumes from files,
not assumed conversation history. See [workflows](core/WORKFLOWS.md) and [adoption](docs/ADOPTION.md).

## Maintain an installation

Updates and removal first produce reviewable plans:

```sh
bun run cli update --root ../my-project > /tmp/my-project-update.json
# Review the plan before applying.
bun run cli apply --root ../my-project --plan /tmp/my-project-update.json
bun run cli uninstall --root ../my-project > /tmp/my-project-uninstall.json
# Review and apply the uninstall plan separately.
```

Use `migrate` for supported older locks. Interrupted writes have journals and explicit
`recover --transaction <id> --direction resume|rollback` recovery. Uninstall preserves project
memory and locally modified files. Read [usage and recovery](docs/USAGE.md) before resolving
conflicts or recovering an operation. This is a source-checkout tool, not a published registry package.

## Structure of this repository

| Path | Responsibility |
| --- | --- |
| `core/`, `skills/` | Shared policy, task routes and bounded procedures |
| `profiles/`, `presets/`, `schemas/` | Composable content and strict contracts |
| `adapters/`, `templates/` | Harness discovery and initial project memory |
| `src/` | Bun/TypeScript CLI, Ink wizard, composition, rendering and safe lifecycle operations |
| `tests/` | Contracts, lifecycle and wizard checks; acceptance fixtures |
| `docs/` | Usage, ADRs, provenance, status and evidence |
| `repo_workflow/` | Frozen Python M2 reference |

`bun run check` runs TypeScript checking and Bun tests, including Markdown link and contract
validation. See [acceptance coverage](tests/fixtures/README.md) for gaps and [provenance](docs/SOURCES.md)
for specification-derived versus extracted content.
