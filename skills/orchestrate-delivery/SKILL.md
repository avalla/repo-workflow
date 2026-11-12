---
name: orchestrate-delivery
description: Coordinate delivery with a principal agent and bounded workers when the project selects orchestrated execution.
---

# orchestrate-delivery

Read effective execution mode, status, task and owning contracts. In single-agent mode deliver directly using deliver-slice. In orchestrated mode the principal owns scope, task dependencies, integration, evidence and handoff. This skill describes agent behavior; the CLI does not launch agents.

Split work into bounded tasks with acceptance criteria, owning files, dependencies and applicable gates. Assign explicit ownership; tell workers they share the checkout and must preserve others' edits. Run independent tasks in parallel only when file and resource ownership do not conflict; serialize shared writes and dependent work. Give workers only relevant contracts and context. Record assignments and outcomes in the owning report.

Inspect each worker's actual diff and evidence against its acceptance criteria; do not accept a completion message as proof. Integrate changes, resolve conflicts without discarding work, and run applicable gates on the integrated candidate. Update affected documentation, status and roadmap. Record a PR URL, base and current head, checks and findings.

Obtain review from an independent context that did not author the candidate; neither workers nor the principal's integration review satisfy this gate. Fix findings and repeat affected verification and review after changes. Preserve one candidate identity across evidence and PR. Never weaken gates, infer deployment/merge authority, or mark missing capabilities PASS. If agent tooling is unavailable, record the blocker and seek a project mode decision; do not silently downgrade orchestrated execution.

Load applicable core policy and profile extensions on demand. No provider or harness is required.
