# Task routes

Start with scope, owning documents, candidate identity, gate plan and actual authority. End with persisted evidence,
limitations and next action. All routes keep review, approvals, documentation-current and configured delivery gates.

- feature / reviewed-slice: acceptance → deliver-slice → verify → independent review → external review if configured →
  fix/re-review → integrate-delivery → handoff.
- bugfix / reproduce-fix-verify: debug-investigation → cause → fix → affected regressions → review → integrate-delivery.
- docs / documentation-change: sources → edit → links/schema/consistency → review; no database/engine/deploy by default.
- research / investigation: question → sources → alternatives/evidence → review → findings; no feature completion.
- release / release-readiness: software-versioning → freeze → CI/native/package checks → review → approval; no deploy.

On demand: architecture-review (design), technical-assessment (technical health), security-assessment, review-change
(independent review), external-review (configured provider), update-docs.

Execution defaults to single-agent; orchestrated uses orchestrate-delivery (task ledger, one worktree per worker, at
most maxParallel writers) and integrate-delivery. Workers and the principal never satisfy independent review. The CLI
launches no agents. Record base/final candidate; preserve history unless authorized. Distinguish local/CI evidence.
Push, merge, publish, remote access and deploy require actual authority.
