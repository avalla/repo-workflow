---
name: orchestrate-delivery
description:
  Coordinate parallel workers in isolated worktrees through a staged, reviewed pipeline when the project selects
  orchestrated execution.
---

# orchestrate-delivery

Read effective execution (mode, maxParallel, maxReviewIterations), delivery, status, roadmap and the task ledger. In
single-agent mode use deliver-slice. The principal owns scope, the ledger, integration, evidence and handoff; the CLI
launches no agents.

1. Plan: split work into ledger tasks with kind, acceptance criteria, owned paths, dependencies and applicable gates.
   Active tasks must not own overlapping paths; serialize shared resources and dependent work. Persist the plan and
   obtain owner plan approval before fan-out; record it and move tasks to `approved`.
2. Isolate: give each writing task one worktree and branch from the current base, named `<kind>/<task-id>`, outside
   other worktrees. Record branch and worktree in the ledger. Never let two workers write the same checkout.
3. Fan out at most maxParallel writing tasks whose dependencies are `merged` or `done`. Brief each worker with its task,
   owned paths, relevant contracts and gates only. Workers implement, run authorized checks and report diff and
   evidence; they never merge, push or edit the ledger.
4. Verify: inspect each actual diff and evidence against its acceptance criteria; a completion message is not proof.
   Record candidate identity and move the task to `reviewing`.
5. Review: obtain review-change from a context that authored neither the task nor its integration. Then run
   external-review when configured. Findings move the task to `fixing`; the worker fixes, the principal re-verifies and
   reviewers re-review affected behavior. Count iterations; at maxReviewIterations stop, mark `blocked` with the
   unresolved findings and escalate to the owner.
6. Integrate with integrate-delivery once its start criteria hold; it produces the delivery gates. Docs ship with each
   candidate; afterwards record status, roadmap and ledger.

Ledger stages: planned → approved → implementing → verifying → reviewing → external-review → fixing → integrating →
pr-open → merged → done; `blocked` and `abandoned` need a reason. Update the ledger after every transition so a fresh
session can resume. On resume, reconcile the ledger with actual branches, worktrees and PR states before continuing;
never restart work that has a candidate. Clean up worktrees only after merge or recorded abandonment; preserve unmerged
work.

Never weaken gates, infer merge or deployment authority, or mark missing capabilities PASS. If agent tooling is
unavailable, record the blocker and ask for a mode decision; do not silently downgrade to single-agent. Load applicable
core policy and profile extensions on demand. No provider or harness is required.
