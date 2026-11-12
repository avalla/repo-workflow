---
name: debug-investigation
description: Investigate a reproducible defect through evidence, discriminating experiments, a minimal fix and regression verification.
---

# debug-investigation

Use for bug investigation or the bugfix workflow. Read core policy, relevant contracts, recent
changes and the project's current task. Preserve unrelated work and redact sensitive diagnostics.

1. Record expected versus observed behavior, minimal trigger, candidate identity, environment,
   frequency and affected boundary. Establish a baseline reproducer before editing where possible.
   If reproduction is unavailable, state the missing prerequisite and preserve collected evidence.
2. Trace the failing path across its callers, state transitions and external boundaries. Separate
   observations from hypotheses. Rank a small set of plausible causes; for each choose a test whose
   outcomes distinguish it from alternatives. Prefer narrow instrumentation and reversible experiments.
3. Run authorized experiments one at a time, recording input, result and what the result rules out.
   Do not treat a passing retry as a cause. For intermittent failures, record repetition conditions
   and uncertainty. If evidence contradicts the hypothesis, revise it before changing more code.
4. Fix the demonstrated cause at its owning boundary with the smallest coherent change. Restore
   temporary instrumentation unless it has an explicit production purpose. Add a meaningful
   regression check that fails on the original defect and passes on the fix when feasible.
5. Verify the reproducer and affected regressions on the final candidate. Use review-change for
   required independent review. Persist cause, evidence, fix, actual checks and remaining limits in
   the configured evidence path; update status and owning documentation.

Distinguish a confirmed fix from a workaround or an unverified hypothesis. Missing reproduction,
environment access or review remains explicit and cannot silently pass a required gate.
