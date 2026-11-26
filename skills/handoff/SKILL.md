---
name: handoff
description:
  Persist resumable state, including in-flight orchestration, so a fresh session continues without chat history.
---

# handoff

Persist in the existing owning status and report: objective, candidate identity, checks with actual states, environment
gaps, blockers and at most three next actions. Link details instead of copying them.

In orchestrated mode also make the task ledger current: every task's stage, owner, branch, worktree, candidate, review
iterations, pending reviews and blocker. Record which worker contexts ended and which tasks have unintegrated work. The
next session reconciles the ledger with actual branches, worktrees and PR states before resuming.

Run update-docs before handoff. A fresh session must recover the actual result and next action from files alone, without
coordinator-seeded markers. Load applicable core policy and profile extensions on demand. No provider or harness is
required.
