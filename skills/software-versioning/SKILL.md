---
name: software-versioning
description: Plan and apply project version changes with explicit compatibility, changelog, migration and artifact identity rules.
---

# software-versioning

Use when preparing a version change, compatibility decision or release notes. Read core policy,
the project's existing version/release policy and accepted ADRs. Preserve the established scheme;
do not introduce a release tool or bump versions merely because files changed.

1. Identify independently versioned units, their authoritative version fields, previous released
   artifacts/tags and the candidate revision/hashes. Distinguish software release, schema/data format,
   API/protocol and workflow profile versions; they need not advance together. Check consumers and
   pinned references before editing any version.
2. Classify actual consumer-visible changes: compatible fix, compatible addition or incompatibility.
   Consider behavior, configuration, persisted data, CLI output, defaults and supported environments,
   not just function signatures. Record compatibility assumptions and required migration steps.
3. Apply the declared scheme. If the project uses Semantic Versioning for a stable public contract,
   use patch for compatible fixes, minor for compatible additions and major for incompatible changes.
   Follow declared pre-1.0 and prerelease rules rather than assuming they match stable releases.
   If policy is absent or ambiguous, propose a bounded policy/ADR and leave the release version
   undecided until the project's acceptance authority resolves it; continue compatibility analysis.
4. Update authoritative fields and required derived metadata together using existing project tooling
   where available. Keep lockfiles consistent without unrelated dependency upgrades. For independently
   versioned modules, update affected pins/dependency ranges only as required by compatibility policy.
   Never overwrite an already published version or move its tag to different bytes.
5. Write release notes from the actual difference since the previous release: user-visible changes,
   breaking behavior, deprecations, upgrade/migration actions and known limits. Do not claim unverified
   fixes or copy commit lists without checking their effect. Verify version consistency, supported
   upgrade paths and artifact metadata using applicable authorized checks.
6. Persist the version decision, changed units, compatibility rationale, candidate identity and checks
   under the configured evidence path. Use release-readiness for final release gates and review-change
   for required independent review. Candidate edits invalidate affected evidence.

Version preparation does not authorize tagging, publishing, merging or deploying. Record actual
release/tag/artifact identity only after an authorized operation succeeds.
