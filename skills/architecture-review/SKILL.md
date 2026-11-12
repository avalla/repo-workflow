---
name: architecture-review
description: Review a bounded design or change for ownership, dependencies, invariants, compatibility and operational tradeoffs.
---

# architecture-review

Use for a requested design review or a change that requires an architectural decision under project
policy. Load core policy, owning architecture and accepted ADRs. This review does not silently accept
a proposed ADR or replace independent candidate review.

1. State the objective, constraints, affected components and candidate or design revision. Reconstruct
   the relevant data/control flows from actual callers, contracts and storage ownership. Identify
   sources of truth, dependency direction, trust boundaries and invariants before proposing changes.
2. Compare the current approach, the smallest coherent alternative and any materially different
   viable option. Evaluate compatibility, failure/recovery behavior, concurrency, testability,
   operational cost and reversibility where applicable. Separate measured facts from assumptions.
3. Look for duplicated authority, hidden coupling, weakened gates, ambiguous ownership and changes
   that force unrelated components to know internal details. Follow concrete effects through callers
   and consumers; avoid speculative abstractions for requirements that do not exist.
4. Record actionable findings with affected paths/contracts, violated invariant, concrete consequence,
   severity and evidence. Separate defects, open questions and optional improvements. Recommend the
   smallest design meeting the accepted requirements and explain its material tradeoffs.
5. Persist scope, candidate, alternatives, recommendation, unknowns and verification needs under the
   configured evidence path. Route durable decisions through record-decision and the project's actual
   acceptance authority. Use review-change if independent review is required; record independence
   separately. Revisit affected conclusions after design or candidate edits.

An architecture recommendation is not implementation evidence, gate completion or owner approval.
