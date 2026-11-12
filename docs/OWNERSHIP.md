# Ownership, releases and updates

These are adoption contracts; this source repository contains authored content, not an installation.
A target reserves `.repo-workflow/` for pinned content and the lock. AGENTS.md remains project-owned,
with at most one managed `<!-- repo-workflow:start -->` / `<!-- repo-workflow:end -->` block.
The installation lock is `.repo-workflow/lock.json`; `.repo-workflow.json` and any explicitly listed
local profile source files are project-owned, outside the managed namespace.
Preserve all bytes outside it. Missing/duplicate delimiters in an installed block are conflicts.
CLAUDE.md is initialize-once if absent; an existing file remains project-owned and is preserved.
Add routing manually when needed; see USAGE.md.
Installed canonical skills live in `.agents/skills/repo-workflow-<name>/`; install one owned skill
at a time, never replace a directory. Optional discovery links must stay repository-local; existing
files/links are collisions, never followed or overwritten implicitly.

| Ownership | Examples | Upgrade/removal |
| --- | --- | --- |
| managed | pinned core, selected profiles/skills, entry block, index, lock | Three-way comparison |
| project | bindings, environments, approvals, architecture, STATUS, roadmap, map, ADRs, reports | Never regenerated |
| initialize-once | templates for missing project documents | Project-owned immediately after creation |

Lock records release + resolved immutable 40-hex source commit, generator/schema versions, scoped
exact profiles, generated paths, original UTF-8 base contents and SHA-256 hashes, overrides/decisions.
Base bytes must hash to the recorded hash. Binary managed content is outside version 1. Milestone 1
does not issue an install lock. A release tag without a commit is insufficient.

Local operations: inspect discovers read-only; plan outputs config, ownership, diff, conflicts and
precondition hashes; apply consumes a reviewed plan; doctor checks configuration, links, budgets and
prerequisites without starting services; update plans against an explicit selected release.

Three-way rule per path: B=installed base, L=local, N=new output. If L=B, replace with N or remove
if unselected. If L=N, keep. If N=B, preserve the local edit. Otherwise conflict and write nothing.
Locally modified removed files remain with a conflict. Missing managed files are local edits, not
permission to restore. Never remove project-owned files. Uninstall removes only unchanged identifiable
owned bytes/blocks and preserves everything else.

A plan records every read dependency, target existence/hash, symlink state, configuration and release
identity. Immediately before apply recheck all preconditions, including absent targets and parents.
Refuse stale and already-applied plans explicitly. Prepare outputs and a recoverable transaction
journal before mutation; abort on unresolved conflicts. Use same-filesystem atomic file replacement
with before-images and progress. Recovery verifies current hashes before resume/rollback and refuses
unrelated edits. Multi-file atomicity is not promised. Report a complete manifest and recovery state.
No daemon, database, auto-update, auto-merge or force-push. Ordinary local diff review approves
adoption changes; configured commands and deployment still need actual authority.
