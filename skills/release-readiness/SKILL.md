---
name: release-readiness
description: Evaluate a frozen release candidate against project gates, compatibility, packaging and recovery requirements before publication.
---

# release-readiness

Use for a release readiness request or the release workflow. Read core policy, project release
policy, applicable profiles and accepted ADRs. Preparation grants no publication or deployment authority.

1. Identify release scope, previous release, exact candidate revision and affected/new file hashes,
   target environments, intended artifacts and owners. Include dirty files; freeze the candidate
   before collecting final evidence. Use software-versioning for version and compatibility decisions.
2. Build an applicability table from project gates: required check, prerequisite, environment,
   evidence and actual result. Inspect local, CI, native and packaging results separately. Verify
   artifact identity and provenance against the candidate; green checks on another candidate do not count.
3. Check install/upgrade paths, supported consumers, migration ordering, changelog and recovery plan.
   State irreversible changes and recovery limits. Run applicable authorized checks in disposable
   environments where possible; configured commands alone confer no execution authority.
4. Obtain required independent review through review-change and resolve findings with re-review.
   Confirm project approvals separately. Missing access, credentials, hardware or reviewer leaves
   its required gate incomplete; do not replace it with a weaker local check.
5. Persist a dated readiness report in the configured evidence path: candidate and artifact hashes,
   version, compatibility/migration notes, gate matrix, unresolved risks, approvals and next action.
   Use core evidence states. Declare ready only when all applicable required gates and approvals
   are satisfied; otherwise name blockers. Invalidate affected evidence after candidate edits.

The report does not publish, tag, merge or deploy. Perform those actions only under actual project
authority, and record their observed outcome separately from readiness.
