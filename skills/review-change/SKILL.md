---
name: review-change
description: Independently review a frozen change for correctness, regressions and contract compliance; re-review fixes.
---

# review-change

Use for independent review before handoff or when requested. Load applicable core policy and profile
extensions on demand. No provider or harness is required; availability does not establish independence.

1. Freeze scope: original task and acceptance criteria, base revision when available, candidate revision
   and exact hashes of affected/new files, deletions and relevant evidence. Include untracked files;
   a commit alone does not identify dirty work. Read owning contracts and relevant callers/tests.
2. Establish a fresh execution context independent of authorship. Record reviewer identity, context
   and authorship relationship. A different model name or an author's second pass is insufficient.
   Give the reviewer task, candidate, policy and evidence without implementer conclusions as the brief.
   If an independent context is unavailable, persist BLOCKED; self-review may help but cannot pass the gate.
3. Check acceptance, boundary invariants, regressions, error paths, compatibility and meaningful test
   coverage. Inspect the complete candidate, including new files. Run only authorized applicable checks;
   distinguish observed results from supplied evidence. Use security-assessment for a requested security audit.
4. Persist findings with stable IDs, severity and rationale, file/line, concrete trigger, impact and
   supporting evidence. Separate actionable defects from questions or optional suggestions. State
   reviewed scope, checks not run and limitations even when there are no findings.
5. Return findings to the author; do not silently fix the candidate while reviewing it. After fixes,
   freeze the new candidate and independently re-review affected behavior and regressions. Track each
   finding's disposition with evidence; unresolved findings remain explicit.

Write the report under the project's configured evidence path with UTC time and candidate identity.
Use core evidence states; no-findings covers only the reviewed candidate and scope. Invalidate affected
review evidence after edits. Review PASS does not imply technical gates or owner approval PASS.
