# Repo Workflow — isolated documentation adoption

Date: 2026-11-12. Outcome: implemented; independent review pending. Base: bdfe95753bdf6ae98b627166bd6057439be4360d;
tooling d3d53879981ab8942cfac18ff56956bcf7128d7a.

## Goal and scope

Qualify shared workflow instructions on a complete tracked-source copy without changing gameplay, assets, approval
policy or original repositories. This is a documentation task, with no player-count impact. Unreal build, cook,
controllers, hardware and production delivery are not certified; those technical checks were not run and are not
applicable to this documentation edit.

## Plan and ownership

Keep project-owned roadmap and iteration records authoritative. Configure state.current to this record, state.roadmap to
docs/ROADMAP.md and state.evidence to docs/prototypes and state.map to docs/harness/README.md. The initial
representative fixture created a competing docs/STATUS.md: the coordinator removed only that newly generated pilot file,
corrected configuration, reviewed a conflict-free update and applied it inside this copy. The original repository had no
docs/STATUS.md. Existing roadmap content is retained with a pilot annex.

## Agent handoffs

The native Claude session proposed a documentation draft; the coordinator implemented this record and memory
reconciliation. Native Claude resume and fresh Codex sessions validate recovery from these files. The separate
independent_review agent reviews the evidence and documentation; its result is pending here. No delegated application
implementation, original-project commit or push occurred.

## Acceptance and regression checks

- Initial install and update: passed, zero conflicts; original bytes preserved except managed AGENTS block.
- Memory-path reconciliation update: passed, zero conflicts.
- python3 scripts/art/test-tamarro-candidate-profiles.py: passed, 12 tests, no engine required.
- Changed Markdown: formatted and checked with the project's Prettier 3 configuration before handoff.
- Native read-only sessions: recorded separately; exit zero alone is not an acceptance result.
- Independent review: pending.

## Review and correction

The initial handoff prompt prohibited all commands, preventing Codex's file-read tool from working. Corrected probes
allow read-only file commands, but prohibit application checks, edits and network. The memory-path correction addresses
the existing harness guide's prohibition on duplicate status systems. No production readiness claim follows from a
documentation pilot or a passing admission test.

## Handoff

Read AGENTS.md, docs/harness/README.md and the pilot annex in docs/ROADMAP.md, then this record. Use
.repo-workflow/index.md for canonical skills. This record owns only this isolated qualification; the existing roadmap
iterations retain application priorities. Keep next action and evidence here. Next eligible action: independent review
of this documentation pilot. Independent review: pending. Handoff marker: 2b1fb9586f474243877bd720ef145b1e
