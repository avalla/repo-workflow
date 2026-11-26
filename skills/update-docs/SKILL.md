---
name: update-docs
description:
  Refresh affected documentation, module READMEs, status, roadmap and reports, and verify formatting and links.
---

# update-docs

Use with every change and at the end of every work session, including research, interrupted or blocked work. Its
evidence belongs to the documentation-current gate.

1. Identify affected documents: usage, configuration, API and workflow guides, module READMEs, status, roadmap, task
   ledger, repository map, ADRs and the owning report. Record why any candidate document needs no change.
2. Every logical module (application, package or independently owned subsystem) must have a local README.md covering
   purpose, boundaries, public interfaces, dependencies, checks and links to owning documents.
3. Update status with actual results, pending checks and at most three next actions; move detail to the owning report.
   Refresh roadmap counts and percentages per feature, milestone and project and verify them with the roadmap check
   (`repo-workflow roadmap` or `doctor`) when available.
4. Format every added or edited .md file with Prettier 3, then verify with `--check`. Use proseWrap: always and
   printWidth: 120 with aligned tables; long URLs and tables may exceed that width. Preserve existing configuration by
   merging Markdown overrides; do not reformat untouched files.
5. Verify relative links and examples. Remove or correct stale claims, such as PR states, authorizations or completion
   statements that no longer match observable facts.

Record module README coverage, files updated, formatting and link checks in documentation-current. Load applicable core
policy and profile extensions on demand. No provider or harness is required.
