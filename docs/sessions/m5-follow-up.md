# M5 review follow-up

2026-11-12. Base: `572dfd996decc9fb38942fb9507958dec18a4cd8`.
Scope: acceptance-coverage correction and omitted affected-path diagnostics in the Bun CLI.
Frozen Python M2 reference is unchanged. Candidate hashes and independent review are recorded
in `m5-independent-review.md` after freezing the candidate.

## Behavior and evidence

Coverage now separates automated contract/lifecycle tests from observed native documentation
handoffs, coordinator-seeded memory and still-unverified application delivery. M3 native evidence
remains bounded; no new native pilot success is claimed.

Gate selector clauses use three-valued applicability. A task mismatch excludes its clause;
a task-eligible path/component selector without affected paths is unknown (`null`). Any matching
clause makes the gate applicable; otherwise unknown dominates false. Empty API arrays mean omitted
scope. Consumers must handle nullable `applicable`; this corrects the former false negative and
adds a per-gate diagnostic. No release publication/version bump is performed in this development slice. Unknown required gates add BLOCKED doctor findings; informational inspect remains exit 0.
Execution results remain NOT RUN or existing missing-binding BLOCKED; commands never run.
Global selectors resolve without paths. Supplied paths use existing boundary-aware matching.

Tests cover inspect and doctor with omitted, matching and unrelated paths; task mismatch,
unconditional selector union, boundary-prefix mismatch and combined path/component constraints.
Initial regression run exposed an incorrect test expectation: the fixture browser gate already
lacks a binding, so its result correctly remains BLOCKED. Corrected expectation; targeted tests PASS.
Full `bun run check` PASS: TypeScript, 39 tests / 2347 assertions. Independent source/test
review PASS; completion-evidence findings require final documentation and current PR-head evidence.

## Remaining work and limits

Owner explicitly authorized the isolated Agile Factory Next application/documentation pilot after
being asked for target-project permission. The bounded pilot is now executed with a real safeNext redirect fix, independent review PASS
and a fresh native file-recovery handoff PASS. See [application pilot](m5-application-pilot.md) for
candidate, portable patch, evidence and interventions. Target PR/browser/accessibility gates stay
incomplete; the pilot checklist remains unchecked. No target push, merge or deploy performed.
Native Antigravity executable lookup found none; Claude is installed, but automatic imports/skill
discovery is not qualified by executable availability. M2 stays open. Remote CI is NOT RUN for this
candidate. PR #1 is the existing delivery route; its current head must be updated before gate completion.

No structural map change is needed: composition still owns applicability and CLI owns diagnostics.
README/usage, coverage, roadmap and status are updated together. Historical M3/M4 reports remain
snapshots; their check counts describe their own candidates.
