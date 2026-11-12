# Current status

M1–M2 contracts and the local tool are implemented. M3 lifecycle tooling and the requested Bun/Ink
creation flow are implemented; M3 pilot adoption and native harness verification remain outstanding.
Bun is the supported runtime. Python M2 sources remain as a frozen compatibility reference.

The Ink wizard creates validated project configuration, including Antigravity selection. JSON CLI
commands cover inspect, doctor, reviewed install/update/migrate/uninstall and interrupted-operation
resume/rollback. Project memory and local edits follow ownership and three-way rules.
No configured project command is executed. No diagnostic certifies delivery completion.

Evidence: [Bun/Ink report](sessions/m3-bun-ink.md), [M2 report](sessions/m2-local-tool.md),
[M1 report](sessions/m1-contracts.md), [source inventory](source-inventory.json),
[acceptance coverage](../tests/fixtures/README.md).
Native Codex, Claude Code and Antigravity discovery is NOT RUN. Real resume/slice/review/handoff,
source-project pilots, CI, engine/hardware validation and independent review are NOT RUN.
No source projects were modified. Architectural review here is self-review.

No new blocking architecture decision was identified. Weakening overrides and multi-repository
roots remain unsupported. Unknown prerequisites and unavailable review keep gates incomplete.
Next work: finish M3 pilots on disposable source-project copies and measure startup context,
conflicts and resume behavior. See [roadmap](../ROADMAP.md) and [usage](USAGE.md).
