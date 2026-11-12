# Usage

For project selection, monorepo configuration, daily work and harness qualification, see
[adoption and customization](ADOPTION.md). Run the CLI from this source checkout; it is not a
published registry package. `bun run cli --help` prints the command reference.

## Create project configuration

Run commands from this repository's root with Bun 1.4.0+:

```sh
bun install --frozen-lockfile
bun run cli init --root ../my-project
```

The Ink wizard asks for name, surface (`cli`, `library`, `web`, `other`), stack labels, harnesses
and documentation language. Enter advances; Ctrl+U clears; Esc or Ctrl+C cancels without writes.
Review the complete configuration and type `yes` to write it. Existing configuration is preserved;
a missing destination folder is created. Application scaffolding, Git initialization and package
installation are separate activities.

CLI/library and web select representative profiles. `other` keeps generic behavior and reports
missing technical gates. Configure actual commands, environments and gates in the generated JSON;
labels do not install technologies or invent checks. Independent review and publication approval
remain required. Documentation language is a setting; bundled instructions currently remain English.

For advanced profiles, monorepos or automation, edit a complete
[example](../tests/fixtures/projects/mixed-monorepo.json):

```sh
bun run cli init --root ../my-project --from /tmp/project-config.json --dry-run
bun run cli init --root ../my-project --from /tmp/project-config.json
```

`--dry-run` validates and prints a preview without creating files and requires `--from`.
Noninteractive terminals also require `--from`. Unknown fields and invalid bindings fail closed.
See [schemas](../schemas/README.md). Multiple independent repository roots remain unsupported.

## Review and install

```sh
bun run cli inspect --root ../my-project --task feature --affected src/main.ts
bun run cli plan --root ../my-project > /tmp/workflow-plan.json
bun run cli apply --root ../my-project --plan /tmp/workflow-plan.json
bun run cli doctor --root ../my-project --task feature --affected src/main.ts
```

Review ownership, complete before/after contents, diffs, diagnostics and conflicts. `apply`
reconstructs the plan and rejects changed inputs, edited plans, collisions and repeated application.
Source or target changes require a fresh plan. Store plans outside managed paths. Plans and journals
contain full contents. The tool never executes configured commands.

Installation preserves project documents and unrelated skills. It adds one managed AGENTS.md block,
selected `.repo-workflow/` content and `.agents/skills/repo-workflow-*` skills. CLAUDE.md is initialized
only when absent; add `@AGENTS.md` manually to an existing file if routing is needed. Selecting
`antigravity` uses shared instructions and canonical skills; IDE permissions and native discovery
need separate verification. See [adapters](../adapters/README.md).

Generated AGENTS.md and core policy require documentation updates alongside implementation,
including affected guides, current state and reports; links and examples must be verified before
handoff. Existing installations receive this guidance through a reviewed update plan.

`--affected` is repeatable with checkout-relative paths. Tasks: `feature`, `bugfix`, `docs`,
`research`, `release`. Load selected skills on demand. `doctor` reports drift, missing bindings,
budgets and interrupted transactions. Successful diagnostics do not mean required review,
CI, engine or hardware checks ran. No completion PASS is issued.

## Update, migrate and uninstall

Select the intended pinned source checkout and install its locked dependencies, then plan:

```sh
bun run cli update --root ../my-project > /tmp/update.json
bun run cli apply --root ../my-project --plan /tmp/update.json
bun run cli migrate --root ../my-project > /tmp/migration.json
# Review migration.json, then use apply with that file.
bun run cli uninstall --root ../my-project > /tmp/uninstall.json
# Review uninstall.json, then use apply with that file.
```

These commands only print plans. `plan --operation update|migrate|uninstall` is equivalent.
`migrate` normalizes supported schema-v1 locks, including M2 locks, through the current renderer;
it may include ordinary update changes. Unknown future schemas are rejected. Configuration schema
remains v1, framework content release 0.1.0, generator 0.2.0. Regenerate Python M2 plans with Bun.

Updates compare installed base, local contents and new output. Unchanged files receive new output;
local-only edits/deletions survive; divergent edits or modified removals conflict and prevent apply.
AGENTS comparisons cover its managed block. Initialize-once memory is never regenerated on updates.
Uninstall removes unchanged managed content and the lock; it retains modified files with diagnostics,
configuration, project memory and journals. Retained files may cause collisions on reinstall.

## Recover an interrupted operation

Keep the journal. Read its identifier from `.repo-workflow/transactions/<id>.json` and choose:

```sh
bun run cli recover --root ../my-project --transaction <id> --direction resume
# Or restore recorded before-images:
bun run cli recover --root ../my-project --transaction <id> --direction rollback
```

Recovery preflights recorded inputs and before/after hashes; unrelated edits stop recovery.
A live transaction process prevents another writer. Explicit recovery can reclaim a dead process
marker. Once recovery starts, its direction stays fixed. Replacement is atomic per file;
the whole operation is journaled, not multi-file atomic. Rollback restores bytes and modes but
may leave empty created directories. Valid interrupted M2 journals are accepted. Journals use 0600.

Outside the wizard output is JSON. Exit codes: 0 successful operation, 1 plan conflicts or blocked
doctor findings, 2 invalid input or execution failure. Exit 0 is not a delivery certificate.

## Troubleshooting

| Message or finding | Action |
| --- | --- |
| `interactive-terminal-required` | Use a real terminal or supply a complete config with `init --from` |
| `configuration-already-exists` | Edit the existing config deliberately; init never overwrites it |
| `unresolved-profile` / `profile-applicability` | Check pinned IDs, scope and component surface against the catalogue |
| `missing-technical-gates` | Add verified project bindings and gates; generic fallback cannot infer them |
| `stale-plan` | Inspect changes and generate a new plan; do not edit plan JSON |
| `unresolved-conflicts` | Reconcile local and incoming contents explicitly, then generate a new plan |
| `managed-content-drift` | Inspect the local edit; preservation by update does not make it generated content |
| `incomplete-transaction` / `previous-transaction` | Inspect the journal and use recover; keep before-images |
| `recovery-user-edit` / `recovery-input-changed` | Compare actual files to journal inputs before attempting recovery again |
| `already-applied-plan` | The plan was consumed; inspect current state and create a new plan if needed |

For a clean uninstall, review modified retained files individually. Uninstall intentionally leaves
configuration, project memory and transaction evidence. Reinstallation can conflict with retained
managed paths; archive or reconcile them deliberately before planning again.
