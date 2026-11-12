# Task routes

Every route starts with scope, owning documents, candidate identity, applicable gate plan and actual
authority. Every route ends with persisted evidence, limitations and next eligible action.
Project review and approval requirements remain in force on every route.

| Task / workflow | Bounded sequence | Technical applicability |
| --- | --- | --- |
| feature / reviewed-slice | acceptance → implement → verify → independent review → fix/review → handoff | affected components/paths |
| bugfix / reproduce-fix-verify | reproduce → cause → minimal fix → regression → review/fix/review | reproducer and affected regressions |
| docs / documentation-change | inspect sources → edit → links/schema/consistency → independent review | no database, engine or deploy by default |
| research / investigation | question → sources → alternatives/evidence → review → findings | no feature completion claim |
| release / release-readiness | freeze → CI/native/package checks → review → approval report | missing access blocks gate; report does not deploy |

Branches/PRs follow project policy. Record base and final candidate; bring base changes in without
rewriting history unless authorized. Green local checks and green CI are distinct facts. Publishing,
push, merge, remote database access and deployment require actual authority, never a preset.
