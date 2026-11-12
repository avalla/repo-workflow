# Repo Workflow

A small operating contract for bounded delivery across coding harnesses. Generic Markdown,
Codex, Claude Code and Google Antigravity share the same core. Native discovery remains unverified.

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

The [usage guide](docs/USAGE.md) covers creation, updates, removal and recovery.
[Status](docs/STATUS.md) distinguishes verified behavior from remaining M3 pilot work.
Bun is the supported CLI; Python sources remain as the frozen M2 reference.

```sh
bun run check
```

Read [composition](docs/COMPOSITION.md), [ownership](docs/OWNERSHIP.md),
[harness discovery](adapters/README.md), [provenance](docs/SOURCES.md) and [roadmap](ROADMAP.md).
Diagnostics do not execute gates or certify completion.
