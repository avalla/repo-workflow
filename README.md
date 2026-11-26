# Repo Workflow

A shared operating contract for coding agents: where to find current work, which checks apply, how to deliver a bounded
change, and what evidence must survive between sessions. Generic Markdown, Codex, Claude Code and Google Antigravity use
the same core through small discovery adapters.

Repo Workflow installs instructions and project memory. Application scaffolding, dependency installation, test execution
and deployment remain separate activities. Codex startup and explicit Claude routing have bounded native evidence;
Antigravity remains unverified. See [current status](docs/STATUS.md) for implemented versus qualified behavior.

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

`init` uses Ink to create `.repo-workflow.json`; application code is configured separately. Automation uses
`init --from <complete-config.json>`. Configured commands are never executed. Use a pinned source checkout. Plans
contain project contents; review and store them locally.

The [usage guide](docs/USAGE.md) covers creation, updates, removal, recovery and troubleshooting. The
[adoption guide](docs/ADOPTION.md) covers configuration choices, existing instructions, daily work, session handoff and
harness qualification, including Antigravity. [Status](docs/STATUS.md) distinguishes verified behavior from remaining
native qualification. Bun is the only implementation; the former Python M2 reference was retired
([ADR 0007](docs/adr/0007-retire-python-reference.md)).

```sh
bun run check
```

Read [composition](docs/COMPOSITION.md), [ownership](docs/OWNERSHIP.md), [harness discovery](adapters/README.md),
[provenance](docs/SOURCES.md) and [roadmap](ROADMAP.md). Diagnostics do not execute gates or certify completion.

## Structure of an installed project

With the default state paths, installation produces the following structure. Application paths are illustrative: the
tool does not generate your application.

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

Missing STATUS, roadmap and map files are initialized from templates. Decisions and session reports are written as work
produces them; the installer does not populate those directories. The `state` configuration changes their paths.
Selected profiles may add other declared files.

| Content                                                        | Owner                           | Update behavior                                  |
| -------------------------------------------------------------- | ------------------------------- | ------------------------------------------------ |
| Core, selected profiles/skills, index and generated policy     | Generator                       | Three-way comparison against installed baselines |
| AGENTS.md                                                      | Project, with one managed block | Only the delimited block is managed              |
| Configuration, bindings, state, roadmap, map, ADRs and reports | Project                         | Existing content is preserved                    |
| New CLAUDE.md and initialized memory                           | Project after creation          | Never regenerated on update                      |

Local-only edits survive updates; divergent changes produce conflicts. An existing CLAUDE.md is preserved. See
[ownership](docs/OWNERSHIP.md) before adopting into a repository with existing instructions or memory.

## Configuration and project types

`.repo-workflow.json` describes components, paths, harnesses, pinned profiles or presets, workflow routes, command
bindings, environments, gates and approvals. Unknown fields fail validation. The [schemas](schemas/README.md) define
supported fields.

Profiles add policy for a layout, surface, technology or capability. Presets select compatible modules; neither creates
package scripts. Project-wide and scoped component policies combine through declared merge rules, preserving required
gates. `inspect` shows the resolved policy and its origins. See [composition](docs/COMPOSITION.md).

| Project shape   | Starting example                                                   | Adapt before adoption                                 |
| --------------- | ------------------------------------------------------------------ | ----------------------------------------------------- |
| Library or CLI  | [library-cli.json](tests/fixtures/projects/library-cli.json)       | Actual typecheck, test and package commands           |
| Web application | [web.json](tests/fixtures/projects/web.json)                       | Browser, database, authorization and CI prerequisites |
| Unreal project  | [unreal.json](tests/fixtures/projects/unreal.json)                 | Engine, build, controller and hardware checks         |
| Mixed monorepo  | [mixed-monorepo.json](tests/fixtures/projects/mixed-monorepo.json) | Component paths and scoped profiles                   |

These are representative configurations, not verified application setups. For a monorepo, components point at paths such
as `apps/web` and `apps/worker`. Task and affected-path arguments select relevant policy. Without affected paths,
path/component selectors remain unknown (`applicable: null`); required unknown scope blocks `doctor`. See
[diagnostic semantics](docs/USAGE.md). One configuration describes one repository root; independent multi-repository
roots remain unsupported. The wizard's stack labels do not install technologies, and its language setting does not
translate the bundled English instructions.

## Integration with harnesses

Select one or several harness IDs in configuration. All share the installed core and canonical skills, so switching
harnesses does not require duplicating project memory.

| Harness ID    | Instruction entry                  | Skill access                                     |
| ------------- | ---------------------------------- | ------------------------------------------------ |
| `generic`     | Read AGENTS.md explicitly          | Paths listed in `.repo-workflow/index.md`        |
| `codex`       | Root AGENTS.md                     | `.agents/skills/repo-workflow-*/SKILL.md`        |
| `claude-code` | New CLAUDE.md imports `@AGENTS.md` | Canonical paths; optional `.claude/` subagents   |
| `antigravity` | Root AGENTS.md                     | Shared `.agents/skills/repo-workflow-*/SKILL.md` |

For an existing CLAUDE.md, reconcile its instructions and add `@AGENTS.md` deliberately if appropriate. Claude-specific
skill copies are not generated; `nativeEntryPoints` adds only thin subagent and command wrappers over canonical skills.
Antigravity uses shared paths; no extra GEMINI.md or legacy `.agent/` directory is generated. The
[adapter contracts](adapters/README.md) record discovery assumptions and native verification limits, including
Antigravity's absence locally.

The intended reading sequence is AGENTS.md → current STATUS and relevant map entry → core policy and task route →
selected profiles or skills as needed. This supports selective reading while keeping decisions and evidence in
repository files. Installed instructions are repository-local; reading them does not require a running service or access
to this generator checkout.

Adapters provide discovery. Actual harness permissions, available tools, independent review and publication/deployment
authority must be established in the project environment.

## Daily workflow and handoff

Canonical on-demand procedures include `security-assessment` for bounded threat analysis, validated findings and
remediation evidence, and `review-change` for independent review of a frozen candidate. Both are listed in the installed
index. An unavailable independent reviewer keeps review BLOCKED; an assessment does not certify security or satisfy
unrelated gates. Neither procedure executes automatically.

Additional installed procedures: `debug-investigation` for evidence-driven bug fixes, `architecture-review` for design
tradeoffs and boundaries, `technical-assessment` for architecture, debt, test, dependency, performance and documentation
health, `software-versioning` for compatibility, version changes and release notes, and `release-readiness` for the
final gate report. `orchestrate-delivery`, `integrate-delivery` and `external-review` cover agentic delivery;
`update-docs` owns documentation refresh and `handoff` owns resumable state. They follow project policy; version
preparation and readiness do not authorize publication.

1. Read current state; identify a bounded task, acceptance criteria and affected paths.
2. Inspect applicable policy and gates; confirm actual commands and prerequisites.
3. Implement the slice and update affected documentation alongside the change.
4. Run applicable project checks, record actual evidence and obtain required independent review.
5. Persist results, blockers and next action in STATUS and a session report before handoff.

Keep the project roadmap as milestone checklists, optionally grouped by feature, with completed/total counts and rounded
percentages per feature, milestone and project; `bun run cli roadmap` recomputes and verifies them. Refresh progress
when tasks or scope change; blocked or unverified items stay unchecked. Progress describes completed scope, not delivery
certification. A new session resumes from files, not assumed conversation history. See [workflows](core/WORKFLOWS.md)
and [adoption](docs/ADOPTION.md).

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
`recover --transaction <id> --direction resume|rollback` recovery. Uninstall preserves project memory and locally
modified files. Read [usage and recovery](docs/USAGE.md) before resolving conflicts or recovering an operation. This is
a source-checkout tool, not a published registry package.

## Structure of this repository

| Path                                | Responsibility                                                                       |
| ----------------------------------- | ------------------------------------------------------------------------------------ |
| `core/`, `skills/`                  | Shared policy, task routes and bounded procedures                                    |
| `profiles/`, `presets/`, `schemas/` | Composable content and strict contracts                                              |
| `adapters/`, `templates/`           | Harness discovery and initial project memory                                         |
| `src/`                              | Bun/TypeScript CLI, Ink wizard, composition, rendering and safe lifecycle operations |
| `tests/`                            | Contracts, lifecycle and wizard checks; acceptance fixtures                          |
| `docs/`                             | Usage, ADRs, provenance, status and evidence                                         |

`bun run check` runs TypeScript checking and Bun tests, including Markdown link and contract validation. See
[acceptance coverage](tests/fixtures/README.md) for gaps and [provenance](docs/SOURCES.md) for specification-derived
versus extracted content.

GitHub Actions runs the same checks on pushes and pull requests using a frozen Bun installation. The
[native pilot report](docs/sessions/archive/m3-native-pilots.md) records documentation adoption on full disposable
copies of Agile Factory Next and Pizza Hit, with source-specific checks and native handoffs. It distinguishes observed
routing from automatic discovery, and documentation adoption from application delivery. The [roadmap](ROADMAP.md) tracks
native qualification and independent review of the assessment procedures.

## Agentic delivery

The wizard asks how agents deliver, and the answers become configuration:

- `execution.mode`: `single-agent` (default) or `orchestrated`. In orchestrated mode a principal agent plans tasks in a
  JSON task ledger, asks the owner to approve the plan, and runs at most `maxParallel` workers, each in its own worktree
  and branch. The principal verifies every diff and integrates candidates one at a time.
- Review: every candidate needs independent review from a context that did not author it, then the configured external
  review (`codex`, `optional` or `required`). Fix/re-review loops stop at `maxReviewIterations` and escalate.
- `delivery.integration`: `pr` (default; open a PR), `pr-auto-merge` (PR plus platform auto-merge after gates PASS) or
  `direct-merge` (merge into the base branch without a PR). Merge modes require an explicit owner `merge` approval.
- `execution.nativeEntryPoints`: with `claude-code`, adds worker/reviewer subagents and a `/repo-workflow-deliver`
  command.

The CLI installs guidance, checks the ledger and reports gates; it does not launch agents, open PRs or merge. Required
core gates include documentation-current and the configured delivery gates; unavailable access leaves them incomplete.
See [usage](docs/USAGE.md), [adoption](docs/ADOPTION.md) and
[ADR 0006](docs/adr/0006-configurable-delivery-integration.md).

## Documentation and design requirements

Every logical module must own a README.md describing its purpose, boundaries, interfaces, dependencies and checks.
Update affected documentation, status and the owning report at the end of every session, including blocked or research
work. Run `npx prettier@3 --write <changed .md files>` followed by `npx prettier@3 --check <changed .md files>`;
Markdown uses `proseWrap: always`, `printWidth: 120` and aligned tables, as in brawlergame. Preserve existing
configuration and leave untouched documents alone. These checks are part of documentation-current evidence.

Web projects must maintain a design system and use Impeccable and Hallmark for UI design/review, recording tool
versions, findings and fixes with browser/accessibility evidence. Missing prerequisites leave delivery verification
incomplete. The Supabase profile requires the [official Supabase skills](docs/SUPABASE-SKILLS.md), loaded on demand.
External skills are project-scoped prerequisites, not bundled code or automatically executed commands.
