---
name: integrate-delivery
description:
  Integrate reviewed candidates one at a time and finish delivery as a PR, auto-merge or direct merge according to
  project configuration.
---

# integrate-delivery

Read effective delivery (`integration`, `base`, `mergeMethod`), applicable gates, approvals and the task ledger.
Integrate only candidates whose required task gates, independent review and configured external review are PASS or
explicitly recorded as NOT RUN where optional.

1. Serialize: integrate one task at a time. Update from the current base, rebase or merge the task branch, resolve
   conflicts without discarding either side, and record the new candidate. A conflict that changes reviewed behavior
   invalidates that review; return the task to `reviewing`.
2. Verify the integrated candidate: rerun applicable gates. Read actual CI check states; QUEUED, RUNNING, CANCELLED and
   SKIPPED are not PASS. Never report PASS from an earlier candidate.
3. Finish per integration mode:
   - `pr`: push the branch when authorized and open a PR against `base`. Record URL, base, head, checks, reviews and
     unresolved findings. Stop; merging is a separate owner decision. Stage `pr-open`.
   - `pr-auto-merge`: as `pr`, then enable platform auto-merge with `mergeMethod` only after approval-merge is recorded
     and every other required gate is PASS. A queued auto-merge is not merged; record the merge commit when it lands.
   - `direct-merge`: no PR. With approval-merge recorded and every other required gate PASS, merge the integrated
     candidate into `base` with `mergeMethod`, then rerun or confirm post-merge checks. Record base before, candidate
     head, merge commit and evidence.
4. Move the task to `merged`, then `done` after docs, status, roadmap and ledger are updated. Remove the worktree only
   after merge; keep the branch unless deletion is authorized.

Missing remote access, credentials, branch protection permission or approval leaves the delivery gate BLOCKED with the
reason; never bypass branch protection, force-push shared branches or rewrite published history without explicit
authority. Load applicable core policy and profile extensions on demand. No provider or harness is required.
