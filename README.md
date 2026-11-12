# Repo Workflow

A small, checked-in operating contract for bounded delivery across coding harnesses.
Milestones 1–2 provide contracts, composable profiles and a deterministic local initial-install tool.
Generic Markdown, Codex, Claude Code routing and Google Antigravity share the same core.
Native harness discovery remains unverified; see [status](docs/STATUS.md).

Use Python 3.11+ from this source checkout:

```sh
python3 -m venv .venv
.venv/bin/pip install -r requirements-dev.txt
.venv/bin/python -m repo_workflow inspect --root /path/to/target --task feature --affected src/example.py
.venv/bin/python -m repo_workflow plan --root /path/to/target > /tmp/workflow-plan.json
# Review the JSON changes, diffs and conflicts before applying.
.venv/bin/python -m repo_workflow apply --root /path/to/target --plan /tmp/workflow-plan.json
.venv/bin/python -m repo_workflow doctor --root /path/to/target --task docs --affected README.md
```

First create the target's project-owned `.repo-workflow.json` using an
[example](tests/fixtures/projects/library-cli.json) and the [schema contract](schemas/README.md).
Use a clean, pinned source checkout. The tool operates locally without fetching content or executing
configured commands. Dependencies require separate installation. Plans contain complete before/after
content and hashed inputs; keep them local and review them as project data.

Existing owned files produce conflicts; project memory is preserved. Updates, uninstall, migrations
and interrupted-install recovery belong to Milestone 3. Inspect the retained journal after an
interrupted installation; retrying as a fresh install is rejected.

```sh
.venv/bin/python tests/validate_contracts.py
.venv/bin/python -m unittest discover -s tests -p 'test_*.py'
```

Read [composition](docs/COMPOSITION.md), [ownership](docs/OWNERSHIP.md),
[harness discovery](adapters/README.md), [provenance](docs/SOURCES.md) and [roadmap](ROADMAP.md).
Diagnostics do not execute gates, consume passing evidence or certify completion.
