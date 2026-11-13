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

Google Antigravity documentation describes AGENTS.md/GEMINI.md as always-on project instructions and `.agents/skills/`
as the canonical skill directory. No redundant GEMINI.md, legacy `.agent/` copy or rules wrapper is needed. Sources:
[rules](https://antigravity.google/docs/rules.md), [skills](https://antigravity.google/docs/skills). Retrieved
2026-11-12 through Context7.

Executable fixtures verify generated files, routing and preservation. Native Codex retrieved a project-instruction token
and read canonical skills. Claude explicitly followed CLAUDE.md → AGENTS.md → index → skill in M3. The
[M2 follow-up](../docs/sessions/m2-claude-native.md) observes automatic loading of the installed entry pair without read
tools, with an empty-directory control; native skill registration is not claimed. Antigravity native discovery is **NOT
RUN** because it is absent locally. See [native evidence](../docs/sessions/m3-native-pilots.md). Documentation-backed
support is distinct from native compatibility verification.

Adapters provide discovery only; they cannot change architecture, requirements or approvals. Installed content has no
home-instruction, subscription or runtime framework-checkout dependency.
