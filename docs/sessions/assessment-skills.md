# Assessment and independent review procedures

Scope: add security-assessment, expand existing review-change without introducing an alias,
install security-assessment in the supported Bun renderer and document usage.
The frozen Python M2 implementation is unchanged.

Security assessment covers trust boundaries, reachable abuse paths, evidence-based findings,
safe local validation, remediation and retesting. Review records independent context,
candidate identity, findings and re-review. Neither changes gate policy or executes commands.

Validation: bun run check PASS: TypeScript and 36 Bun tests, 0 failures, 1504 assertions.
Installation test verifies the namespaced security skill and its installed index entry.
Markdown links and the core-plus-largest-skill context budget pass. git diff --check PASS.
Independent review: BLOCKED; no independent reviewer was invoked. Self-review is not independent.
Native harness invocation and real application security assessment: NOT RUN.
M4 remains unchecked until independent review evidence is available.

Candidate hashes are recorded in assessment-skills-candidate.json; the manifest covers changed
implementation, tests and documentation except this report and the manifest itself.
