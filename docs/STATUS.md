# Current status

M1–M2 contracts and the local tool are implemented. M3 lifecycle tooling and the requested Bun/Ink
creation flow are implemented; M3 pilot adoption and native harness verification remain outstanding.
Bun is the supported runtime. Python M2 sources remain as a frozen compatibility reference.

The Ink wizard creates validated project configuration, including Antigravity selection. JSON CLI
commands cover inspect, doctor, reviewed install/update/migrate/uninstall and interrupted-operation
resume/rollback. Project memory and local edits follow ownership and three-way rules.
No configured project command is executed. No diagnostic certifies delivery completion.
Generated project guidelines explicitly require documentation updates with implementation changes
and link/example verification before handoff; existing projects receive them through reviewed updates.
The [roadmap](../ROADMAP.md) uses milestone checklists with count-based percentage summaries.
New project roadmaps use the same convention; existing project-owned roadmap bytes are preserved.

Evidence: [Bun/Ink report](sessions/m3-bun-ink.md), [M2 report](sessions/m2-local-tool.md),
[M1 report](sessions/m1-contracts.md), [source inventory](source-inventory.json),
[acceptance coverage](../tests/fixtures/README.md), [instruction snapshot experiments](sessions/m3-pilot-snapshots.md).
Three disposable instruction snapshots passed install/update/persisted-memory checks. These used
representative configs, not full application copies or verified project bindings.
Two subsequent [tracked-source experiments](sessions/m3-tracked-copies.md) passed install/update
on complete pinned Git archives of Agile Factory Next and Pizza Hit with source-verified command
existence. All original regular files except the managed AGENTS target retained their hashes;
source worktree status stayed unchanged. Agile Factory's existing STATUS triggered a budget warning.
Application commands were not executed; these experiments do not close the full pilot gates.
Native Codex, Claude Code and Antigravity discovery is NOT RUN. Real resume/slice/review/handoff,
full source-project pilots, CI and engine/hardware validation are NOT RUN.
An independent tooling review found worktree identity and recovery edge cases; fixes and
regressions are recorded in the [review report](sessions/m3-independent-review.md).
The README now explains generated project structure, ownership, composition and harness integration.
No source projects were modified.

The owner removed AutoÉpoque adoption from active scope on 2026-11-12 and selected Agile Factory
Next as the current pattern source. Historical extraction remains provenance, not an active pilot.
No blocking decision affects this CLI implementation. Weakening overrides and multi-repository
roots remain unsupported. Unknown prerequisites and unavailable review keep gates incomplete.
Next work: finish M3 pilots on disposable source-project copies and measure startup context,
conflicts and resume behavior. See [roadmap](../ROADMAP.md), [usage](USAGE.md) and [adoption](ADOPTION.md).
