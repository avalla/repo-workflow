---
name: handoff
description: Persist resumable state.
---

# handoff

Persist objective, candidate identity, checks with actual states, environment gaps, blockers and at most three next
actions in the existing owning status/report. Link details. A fresh session must resume without chat history.

Every logical module (application, package or independently owned subsystem) must have a local README.md covering
purpose, boundaries, public interfaces, dependencies, checks and links to owning documents. At the end of every work
session, including research, interrupted or blocked work, refresh affected documentation, current status and the owning
report with actual results, pending checks and next actions. Format every added or edited .md file with Prettier 3
before handoff, then verify with --check. Use Markdown proseWrap: always and printWidth: 120, with aligned tables; long
URLs/tables may exceed that width. Preserve existing configuration by merging Markdown overrides; do not reformat
untouched files. Include module README coverage, session updates and formatting evidence in documentation-current. Load
applicable core policy and profile extensions on demand. No provider or harness is required.
