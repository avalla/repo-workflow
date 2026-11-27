# Current status

Roadmap: see [roadmap](../ROADMAP.md); `bun run cli roadmap --root .` recomputes it. M1, M3, M4 and M6 are complete for
their declared scope; M2, M5 and M7 each keep one open item.

## M7 — configurable agentic delivery

Merged into `main` via [PR #5](https://github.com/avalla/repo-workflow/pull/5) on 2026-11-27 (`e3d0ec1`, tree identical
to reviewed head `47c499a`): delivery integration modes (`pr`, `pr-auto-merge`, `direct-merge`) with owner merge
approval, parallel and review-iteration limits, optional Codex review, a validated task ledger, the reworked Ink wizard,
orchestration/integration/external-review/technical-assessment/ update-docs procedures, the handoff split, roadmap and
drift diagnostics, optional Claude Code subagents and Codex custom agents, retirement of the Python reference and
archived M1–M6 evidence. Decisions: [ADR 0006](adr/0006-configurable-delivery-integration.md),
[ADR 0007](adr/0007-retire-python-reference.md). Evidence, candidate, checks and reviews:
[M7 report](sessions/m7-agentic-delivery.md). Five review rounds (independent and Codex); the final independent review
passed and its findings were fixed and checked locally without a further round. A disposable pilot delivered two
parallel tasks through direct-merge; `pr` and `pr-auto-merge` were not exercised, so the pilot item stays open (15/16).
Native execution of the generated agents is not qualified.

## Earlier milestones

Bun/TypeScript CLI and Ink wizard, strict composition, reviewed install/update/migrate/uninstall and journaled recovery
are implemented; configured commands are never executed by the CLI. Documentation-adoption pilots on full copies of
Agile Factory Next and Pizza Hit passed ([native pilots](sessions/archive/m3-native-pilots.md)); they do not certify
database, production, Unreal or hardware delivery. M4 procedures passed independent review
([review](sessions/archive/m4-independent-review.md)). M6 documentation/design and Supabase SaaS guidance passed
independent review ([M6](sessions/archive/documentation-design-independent-review.md),
[Supabase](sessions/archive/supabase-saas-review.md)). PRs #1–#4 were merged into `main` on 2026-11-12/13 (last merge
`7255f32`); no deployment was performed.

Open from earlier scope: M2 native Antigravity qualification (absent locally; Claude has bounded evidence, see
[Claude qualification](sessions/archive/m2-claude-native.md)); M5 Agile Factory Next pilot, whose reviewed patch still
needs a target PR decision and PR/browser/accessibility gates ([pilot](sessions/archive/m5-application-pilot.md)).

## Next

1. Exercise `pr` (and optionally `pr-auto-merge`) on a disposable project with a GitHub remote to close the M7 pilot.
2. Present the reviewed AF Next patch for a target PR-publication decision; finish its required gates.
3. Complete native Antigravity qualification when available.
