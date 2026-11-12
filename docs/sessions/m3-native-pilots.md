# M3 bounded native documentation pilots

2026-11-12. Tooling base: `d3d53879981ab8942cfac18ff56956bcf7128d7a`.
Scope: adopt instructions and persist/retrieve documentation handoffs on complete tracked-source
copies. No application feature, original-project commit, deployment or original-source edit.

## Candidates and actual checks

| Candidate | Pinned source | Checks in disposable copy | Result |
| --- | --- | --- | --- |
| Agile Factory Next | `012667f26bf97c3ccbecad6574e822c95c3afe87` | Frozen dependency install without scripts; root typecheck; test:unit; Markdown formatting | Passed |
| Pizza Hit | `bdfe95753bdf6ae98b627166bd6057439be4360d` | Python candidate-admission suite (12 tests); Markdown formatting | Passed |

Both full Git archives passed reviewed install/update with zero conflicts. Only the managed AGENTS
entry changed existing files during initial install; later pilot documentation edits were deliberate.
Source worktree status remained unchanged. The coordinator executed source-verified bindings,
not the Repo Workflow CLI. Database, deployment, Unreal build/cook, controller and hardware checks
are inapplicable to these documentation edits and remain unqualified for technical delivery.

Pizza defaults initially created competing memory. Final configuration routes current/evidence to
`docs/prototypes`, roadmap to `docs/ROADMAP.md`, and map to `docs/harness/README.md`.
Conflict-free updates reconciled policy. Only pilot-created duplicate memory files confirmed absent
from the pinned source were removed. Application priorities were retained. AF already matched
its canonical state routes; its report respects Italian documentation requirements.

## Native slices and handoffs

Codex 0.167.0 and Claude Code 2.1.285 exercised read-only native sessions. An isolated smoke test
retrieved a random AGENTS instruction token in Codex and read the canonical maintain-context skill.
Claude explicitly read CLAUDE.md, AGENTS.md, the index and canonical skill. This proves usable explicit
routing, not automatic Claude imports or native skill registration. Antigravity was unavailable.

AF used a Codex slice, resumed Codex handoff and fresh Claude handoff. Pizza used a Claude slice,
resumed Claude handoff and fresh Codex handoff; final probes used reconciled canonical routes.
All corrected handoff probes recovered the persisted marker and next action. The coordinator
persisted the agent-proposed draft and seeded the marker: this tests file retrieval, not autonomous
memory generation. One initial Codex probe per project failed because its prompt prohibited commands
required for file reading. These are retained as protocol failures; exit zero was not success.
No lost-context incident was observed among corrected probes; this sample is not a reliability guarantee.

## Measurements and limits

[Structured observations](m3-native-pilot-observations.json) contain command exits, timings, source
revisions, trace hashes, entry sizes and trace-visible tool output per probe. Output includes failed
probes, compression, formatting, broad searches and possible truncation. Referenced paths include
attempted or heuristic references, including nonexistent files: they are not confirmed reads or a
lower bound on loaded files. Global instructions, automatic injection and history are not fully
visible. These are **not total startup bytes/files or token usage**. Broad scans and AF's existing
large STATUS demonstrate why installation alone cannot guarantee small context.

The [AF record](m3-agile-factory-next-pilot.md) and [Pizza record](m3-pizza-hit-pilot.md) are exact
pre-review snapshots retaining then-pending review markers. Final acceptance is recorded separately
here, preserving historical native responses and snapshot hashes.

## Acceptance

Independent final review by `/root/independent_review` on 2026-11-12 found no remaining blocking
findings after canonical route reconciliation and conservative metric naming. Review was read-only
and covered temporary evidence, final records, observations, summary and CI workflow.

Local `bun run check`: passed TypeScript checking and 36 tests, 1,366 assertions.
`git diff --check`: passed. Remote CI execution is separate and is not claimed by these local results.
M3 measures bounded documentation adoption, not full application delivery. The overall roadmap
remains below 100% until remaining native harness qualification is evidenced.
