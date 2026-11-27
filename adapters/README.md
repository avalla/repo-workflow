# Harness discovery

| Harness ID    | Entry                                  | Skills                                         |
| ------------- | -------------------------------------- | ---------------------------------------------- |
| `generic`     | Read AGENTS.md explicitly              | Follow canonical paths explicitly              |
| `codex`       | AGENTS.md                              | `.agents/skills/repo-workflow-<name>/SKILL.md` |
| `claude-code` | New CLAUDE.md routes with `@AGENTS.md` | Read canonical paths explicitly                |
| `antigravity` | AGENTS.md                              | `.agents/skills/repo-workflow-<name>/SKILL.md` |

## Roadmap maintenance in every harness

Generic, Codex, Claude Code and Antigravity must follow the shared AGENTS.md roadmap instructions. At the end of every
work session, and after changes to scope, progress or verification evidence, update the configured project-owned
roadmap. Preserve milestone checklists; refresh completed/total counts and rounded percentages for each milestone and
overall. Link evidence for completed work and keep blocked or unverified items unchecked. Use the existing roadmap path
from the generated entry; do not create a competing roadmap. Persist the next eligible action in the owning
status/report so another harness can resume.

## Entry and skill discovery

The installer generates one shared entry block and one canonical copy per skill. Existing CLAUDE.md is a collision
requiring project reconciliation; the tool never replaces it. Claude native skill links are not generated. Explicit path
reading is the fallback.

## Native orchestration entry points

With `execution.nativeEntryPoints: true` and the `claude-code` harness, installation adds three generator-owned files
from [`claude-code/`](claude-code/): `.claude/agents/repo-workflow-worker.md` (one ledger task in its own worktree; no
merge, push or ledger edits), `.claude/agents/repo-workflow-reviewer.md` (independent review of a frozen candidate;
refuses candidates it authored) and `.claude/commands/repo-workflow-deliver.md` (entry to orchestrated or single-agent
delivery). They only route to canonical skills and add no authority. They follow the same three-way update and uninstall
rules as other managed files. With the `codex` harness it also adds project-scoped custom agents from
[`codex/`](codex/): `.codex/agents/repo-workflow-worker.toml` and `.codex/agents/repo-workflow-reviewer.toml` (`name`,
`description`, `developer_instructions`, same rules). Codex has no project-level command file; the canonical skills
under `.agents/skills/` remain the entry, and external review uses `codex review`. Native execution of these agents is
qualified separately from file generation.

Google Antigravity documentation describes AGENTS.md/GEMINI.md as always-on project instructions and `.agents/skills/`
as the canonical skill directory. No redundant GEMINI.md, legacy `.agent/` copy or rules wrapper is needed. Sources:
[rules](https://antigravity.google/docs/rules.md), [skills](https://antigravity.google/docs/skills). Retrieved
2026-11-12 through Context7.

Executable fixtures verify generated files, routing and preservation. Native Codex retrieved a project-instruction token
and read canonical skills. Claude explicitly followed CLAUDE.md → AGENTS.md → index → skill in M3. The
[M2 follow-up](../docs/sessions/archive/m2-claude-native.md) observes automatic loading of the installed entry pair
without read tools, with an empty-directory control; native skill registration is not claimed. Antigravity native
discovery is **NOT RUN** because it is absent locally. See
[native evidence](../docs/sessions/archive/m3-native-pilots.md). Documentation-backed support is distinct from native
compatibility verification.

Adapters provide discovery only; they cannot change architecture, requirements or approvals. Installed content has no
home-instruction, subscription or runtime framework-checkout dependency.
