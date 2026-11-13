# Task routes

Start with scope, owning documents, candidate identity, gate plan and actual authority.
End with persisted evidence, limitations and next action. All routes retain project review
and approvals, documentation-current (update affected docs, verify links/examples, justify
unaffected documents) and pull-request (record URL, base and current head) gates.

| Task / workflow | Sequence and on-demand skills |
| --- | --- |
| feature / reviewed-slice | acceptance → deliver-slice → verify → independent review → fix/re-review → handoff |
| bugfix / reproduce-fix-verify | debug-investigation → cause → fix → affected regressions → review |
| docs / documentation-change | sources → edit → links/schema/consistency → review; no database/engine/deploy by default |
| research / investigation | question → sources → alternatives/evidence → review → findings; no feature completion |
| release / release-readiness | software-versioning → freeze → CI/native/package checks → review → approval report; no deploy |

Design decisions use architecture-review; security uses security-assessment; independent
candidate review uses review-change.

Read effective execution.mode: default single-agent; orchestrated uses orchestrate-delivery
for principal/worker ownership, safe parallel work and integrated verification. Authoring
workers and the principal do not satisfy independent review. CLI launches no agents.

Record base/final candidate; preserve history unless authorized. Distinguish local/CI evidence.
Push, merge, publish, remote access and deploy require actual authority.
