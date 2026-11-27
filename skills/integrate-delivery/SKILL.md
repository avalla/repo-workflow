---
name: integrate-delivery
description:
  Integrate reviewed candidates one at a time and finish delivery as a PR, auto-merge or direct merge according to
  project configuration.
---

# integrate-delivery

Read effective delivery (`integration`, `base`, `mergeMethod`), applicable gates, approvals and the task ledger. Start
only with candidates whose local required gates, independent review and configured external review are PASS (or NOT RUN
where optional). Delivery gates (`pull-request`, `merge`, `approval-merge`) and remote CI are produced below.

1. Serialize: integrate one task at a time. Update from the current base, rebase or merge the task branch, resolve
   conflicts without discarding either side, and record the new candidate. If its diff changed or the base changed code
   it relies on, even without conflicts, the review no longer covers it; return the task to `reviewing`.
2. Verify locally: rerun applicable gates on the integrated candidate. Never report PASS from an earlier candidate.
3. Finish per integration mode. Remote CI is verified on the exact pushed head; QUEUED, RUNNING, CANCELLED and SKIPPED
   are not PASS.
   - `pr`: push the branch when authorized and open a PR against `base`, then wait for its checks on that head. Record
     URL, base, head, checks, reviews and unresolved findings. Stop; merging is a separate owner decision. Stage
     `pr-open`.
   - `pr-auto-merge`: as `pr`; once those checks PASS, approval-merge is recorded and every other required gate is PASS,
     enable platform auto-merge with `mergeMethod`. A queued auto-merge is not merged; record the merge commit.
   - `direct-merge`: no PR. With approval-merge recorded and every other required gate PASS (including CI on a pushed
     candidate branch when CI runs on branches), merge into `base` with `mergeMethod`, then confirm post-merge checks on
     `base`. Record base before, candidate head, merge commit and evidence.
4. Move the task to `merged`, then `done` after docs, status, roadmap and ledger are updated. Remove the worktree only
   after merge; keep the branch unless deletion is authorized.

Missing remote access, credentials, branch protection permission or approval leaves the delivery gate BLOCKED with the
reason; never bypass branch protection, force-push shared branches or rewrite published history without explicit
authority. Load applicable core policy and profile extensions on demand. No provider or harness is required.
