# Repository map

- `core/`: shared authority, evidence and workflows.
- `schemas/`: configuration, profile, preset, lock, evidence and task-ledger contracts.
- `profiles/`, `presets/`: representative modules and pinned selections.
- `skills/`: canonical bounded procedures, loaded individually. `security-assessment` owns security assessment;
  `technical-assessment` owns technical health assessment; `review-change` owns independent candidate review;
  `external-review` owns configured external (Codex) review. `orchestrate-delivery` owns principal/worker planning,
  worktree isolation and the ledger; `integrate-delivery` owns serial integration and PR/merge finishing.
  `debug-investigation` owns defect investigation; `architecture-review` owns design review; `software-versioning` owns
  version decisions; `release-readiness` owns release gate reports; `update-docs` owns documentation refresh; `handoff`
  owns resumable state.
- `adapters/`: generic, Codex, Claude Code and Antigravity discovery; `adapters/claude-code/` holds optional native
  subagent and command wrappers.
- `templates/`: initialize-once project memory, including the feature/milestone progress roadmap and task ledger.
- `src/io.ts`: strict JSON, schemas, paths, snapshots and atomic writes.
- `src/compose.ts`: scoped resolution, origins, monotonic gates, execution and delivery defaults.
- `src/render.ts`: selected content, managed block and ownership boundaries.
- `src/lifecycle.ts`: three-way plans, locks, apply, migration, uninstall and recovery.
- `src/diagnostics.ts`: roadmap progress check, task-ledger validation and drift diagnostics.
- `src/init.tsx`: Ink wizard and noninteractive initialization.
- `src/cli.tsx`: JSON CLI routing and diagnostics.
- `package.json`, `bun.lock`, `tsconfig.json`: Bun/React/Ink toolchain.
- `.github/workflows/ci.yml`: frozen Bun installation and contract checks on GitHub.
- `docs/`: contracts, usage, provenance, ADRs, reports and status; `docs/sessions/archive/` holds M1–M6 evidence.
- `tests/*.test.ts*`: Bun contracts, lifecycle, delivery/diagnostics acceptance and real Ink input tests.
- `tests/fixtures/`: project examples, invalid inputs and scenario inventory.

ROADMAP.md owns milestone order. docs/STATUS.md owns evidence and remaining work.

Execution and delivery configuration: schemas/config.schema.json → src/init.tsx → src/compose.ts → src/render.ts →
src/diagnostics.ts; procedures: skills/orchestrate-delivery, skills/integrate-delivery, skills/external-review;
decision: docs/adr/0006-configurable-delivery-integration.md.

`docs/SUPABASE-SKILLS.md` owns official external Supabase skill setup and is installed by the Supabase profile.
`.prettierrc.json` owns source-repository Markdown formatting.
