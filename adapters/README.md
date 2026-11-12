# Harness discovery contract

Generic Markdown readers start at AGENTS.md and follow paths explicitly. Codex uses that shared
entry and repository-local `.agents/skills/repo-workflow-<name>/SKILL.md` canonical skills.
Claude Code starts at CLAUDE.md routing to AGENTS.md; local `.claude/skills/` links may expose
individual canonical skills where supported. Otherwise read the canonical file explicitly.
No discovery behavior is claimed tested in Milestone 1.

Adapters contain discovery paths and invocation conventions only. They cannot change requirements,
architecture or approvals. No dependency on home instructions, external symlinks, subscriptions,
or runtime access to the framework repository.
