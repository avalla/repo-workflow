---
name: technical-assessment
description:
  Assess technical health of a bounded system — architecture, debt, tests, dependencies, performance and documentation —
  with ranked findings.
---

# technical-assessment

Use when a technical assessment is requested or planning needs one. assess-project compares state with plans;
security-assessment owns security. This procedure adds no gate and grants no execution authority.

1. Bound the scope: components, paths, candidate revision and exclusions. Read owning architecture, accepted ADRs,
   module READMEs, roadmap and configured gates.
2. Inspect each applicable dimension with evidence:
   - Architecture: module boundaries, dependency direction, cycles, ownership and drift from accepted ADRs.
   - Technical debt: duplication, dead code, workarounds, TODO/FIXME clusters, oversized or tangled modules.
   - Tests: which behaviors and error paths are covered, flaky or skipped tests, missing regression coverage. Run
     configured test or coverage commands only when authorized; otherwise record NOT RUN.
   - Dependencies: outdated or unmaintained packages, lockfile hygiene, duplicate versions, license constraints. Verify
     advisories against current authoritative sources or mark UNKNOWN.
   - Performance and operations: hot paths, unbounded work, resource use, build time, observability and error handling.
   - Documentation: module README coverage, accuracy against behavior, stale status or roadmap claims.
3. Record findings with stable IDs, dimension, severity with rationale, confidence, file/line or measurement, impact and
   the smallest coherent remediation. Separate measured facts from judgment and unverified leads.
4. Prioritize remediation by impact, risk and effort; propose roadmap items or ADRs, but do not add them without the
   owner's decision.
5. Persist a report under the evidence path with candidate, scope, methods, checks run and not run, findings and UTC
   time. No findings means none found within the stated scope, not a quality certification.

Use architecture-review for a specific design decision and review-change for independent review of a candidate. Load
applicable core policy and profile extensions on demand. No provider or harness is required.
