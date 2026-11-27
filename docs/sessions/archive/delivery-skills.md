# Delivery and versioning procedures

Scope: add release-readiness, debug-investigation, architecture-review and software-versioning
as provider-neutral canonical skills, install them through the supported Bun renderer, and route
on demand from core workflows. Frozen Python M2 behavior is unchanged.

The procedures reuse core evidence, authority and independent-review rules. Versioning follows
declared project policy and separates software, schema, API and profile versions. No release tools,
automatic commands, version bump, tag, publication or deployment were introduced.

Validation: bun run check PASS: TypeScript and 36 tests, 0 failures, 2122 assertions.
Installation coverage checks each namespaced skill and index entry. Markdown links and
core-plus-largest-skill context budget PASS. git diff --check PASS.
Independent review: BLOCKED; no independent reviewer was invoked. Self-review is not independent review.
Native harness invocation and application-level execution of these procedures: NOT RUN.
M4 items stay unchecked pending required review. Existing assessment manifest remains historical;
delivery-skills-candidate.json identifies this follow-up candidate, excluding this report and the manifest.

## Review and delivery follow-up

The preceding validation/pending states describe the original snapshot and remain historical.
Independent review now PASS with no actionable findings; see [review](m4-independent-review.md)
for exact source hashes and independently observed checks (37 tests, 2309 assertions).
Implementation commit: `26153826db27d275acdff6663e7936e983929b27`.
Published branch: `feat/assessment-delivery-workflows`; [PR #1](https://github.com/avalla/repo-workflow/pull/1)
targets base `bd05d9a566717b5bfec8eb71c74c0d0d38a38da8` on main.
The PR records its live head; subsequent evidence-only commits do not change reviewed implementation.
M4 closes only installed-procedure and local-contract scope. Native multi-agent/application
execution remains NOT RUN. Remote CI is separate evidence; no merge or deployment performed.
