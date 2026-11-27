# Roadmap

Progress: **93% — 43/46 checklist items complete; 4/7 milestones complete.** Items have equal weight; this measures
completed scope, not effort, time or delivery certification. Count only checked items below. Round
`100 × completed / total` to the nearest whole percent. Blocked or unverified items stay unchecked; update counts
whenever scope or evidence changes.

| Milestone                                   | Items | Progress | State                                                |
| ------------------------------------------- | ----- | -------- | ---------------------------------------------------- |
| M1 — contracts and extracted content        | 5/5   | 100%     | Complete                                             |
| M2 — deterministic local tool               | 4/5   | 80%      | Native verification outstanding                      |
| M3 — safe updates and pilot adoption        | 9/9   | 100%     | Bounded documentation adoption complete              |
| M4 — assessment and review procedures       | 6/6   | 100%     | Installed procedures independently reviewed          |
| M5 — review follow-up and application pilot | 2/3   | 67%      | Local pilot passed; target delivery gates incomplete |
| M6 — documentation and design requirements  | 2/2   | 100%     | Independently reviewed; PRs #2 and #4 merged         |
| M7 — configurable agentic delivery          | 15/16 | 94%      | PR #5 merged; `pr`-mode pilot outstanding            |

## Milestone 1 — contracts and extracted content

- [x] Define strict configuration and content schemas.
- [x] Define composition, compatibility, gates and ownership rules.
- [x] Extract a small source-verified core and author six modules/four presets.
- [x] Define core workflows, evidence and release/update contracts.
- [x] Add representative configurations, acceptance fixtures and local contract validation.

Evidence: [M1 report](docs/sessions/archive/m1-contracts.md). Declarative scenarios are not all executable; see
[coverage](tests/fixtures/README.md) for current behavior and explicit gaps.

## Milestone 2 — deterministic local tool

- [x] Implement inspect/doctor with selected content and honest missing-check diagnostics.
- [x] Test deterministic resolution, origins, scoping, compatibility and gate retention.
- [x] Implement reviewed install plans, stale/collision rejection and project-byte preservation.
- [x] Provide generic Markdown, Codex, Claude Code and Antigravity discovery contracts without executing configured
      commands.
- [ ] Verify discovery in native Codex, Claude Code and Antigravity sessions.

Evidence: [M2 report](docs/sessions/archive/m2-local-tool.md). Filesystem contracts are verified; Codex startup and
explicit Claude routing were exercised. [Claude qualification](docs/sessions/archive/m2-claude-native.md) now observes
automatic entry loading and explicit canonical-skill reading; native skill registration is not claimed. Antigravity
remains NOT RUN. Closure still requires native Antigravity evidence. Claude uses the documented canonical-path fallback;
explicit skill reads must not be reported as native skill registration.

## Milestone 3 — safe updates and pilot adoption

- [x] Migrate to Bun/TypeScript and implement the Ink configuration wizard.
- [x] Implement three-way updates and compatible schema-v1 lock migration.
- [x] Implement removal/uninstall and journaled resume/rollback; verify every write boundary.
- [x] Document creation, adoption, maintenance, recovery and generated project guidelines.
- [x] Verify disposable instruction-snapshot coexistence and persisted memory for all three sources.
- [x] Complete an Agile Factory Next documentation pilot on a full disposable copy with verified bindings.
- [x] Complete a Pizza Hit documentation pilot on a full disposable copy with verified bindings.
- [x] Verify real resume/slice/review/handoff sessions; measure trace-visible output, entry sizes, context-loss
      incidents and conflicts.
- [x] Obtain independent review and applicable local checks for documentation pilots; record engine/hardware checks as
      inapplicable.

Evidence: [M3 tooling](docs/sessions/archive/m3-bun-ink.md),
[snapshot observations and reconciliation](docs/sessions/archive/m3-pilot-snapshots.md),
[tracked-source qualification](docs/sessions/archive/m3-tracked-copies.md), [usage](docs/USAGE.md). The
[native pilot report](docs/sessions/archive/m3-native-pilots.md) closes bounded documentation adoption. This is not
application delivery certification. Total harness startup context is not observable in these traces; measurements cover
trace-visible output and on-disk entry sizes. Antigravity remains unverified. AutoÉpoque adoption was removed from
active scope by the owner on 2026-11-12; Agile Factory Next is the current pattern source. Historical AutoÉpoque
extraction remains documented for provenance. Unavailable checks keep delivery gates incomplete.

## Milestone 4 — assessment and review procedures

- [x] Deliver installed security assessment and expanded independent review procedures with contract checks and
      independent review evidence.
- [x] Deliver release-readiness with contract checks and independent review evidence.
- [x] Deliver debug-investigation with contract checks and independent review evidence.
- [x] Deliver architecture-review with contract checks and independent review evidence.
- [x] Deliver software-versioning with contract checks and independent review evidence.

Implementation and validation: [assessment skills report](docs/sessions/archive/assessment-skills.md). Additional
procedures: [delivery skills report](docs/sessions/archive/delivery-skills.md).

- [x] Deliver documentation and PR gates plus selectable agent orchestration with contract checks and independent review
      evidence.

See [delivery workflow report](docs/sessions/archive/delivery-workflow.md). Independent review PASS:
[review report](docs/sessions/archive/m4-independent-review.md). Scope: installed procedures and local contracts; native
agent/application execution remains NOT RUN. PR: [#1](https://github.com/avalla/repo-workflow/pull/1); no merge or
deployment performed.

## Milestone 5 — review follow-up and application pilot

Added after the 2026-11-12 review of `bd05d9a566717b5bfec8eb71c74c0d0d38a38da8`. The lower overall percentage reflects
added scope; completed M1/M3/M4 evidence is unchanged. The first two items are implemented with local regression
evidence; independent review is recorded in the M5 report.

- [x] Reconcile acceptance-coverage documentation with completed bounded native pilots. Update tests/fixtures/README.md
      to distinguish automated fixture coverage, observed native handoffs and still-unverified application delivery;
      verify consistency with STATUS and the native pilot report.
- [x] Make missing affected-path scope explicit in inspect/doctor. Report omitted scope as unknown or incomplete rather
      than silently presenting scoped gates as inapplicable; document the chosen semantics and add regression coverage
      for omitted scope, matching paths and genuinely unrelated paths.
- [ ] Complete one bounded real application bugfix pilot on Agile Factory Next in an isolated branch/worktree, subject
      to project authorization. Record a reproducer, acceptance criteria, candidate identity, applicable checks,
      independent review and fixes, agent-written documentation/memory, and a fresh-session handoff. The receiving
      session must recover the actual result and next action without coordinator-seeded markers or manual reconstruction
      of the handoff; record interventions and unavailable checks explicitly.

Prioritize the documentation correction and scope diagnostic before the application pilot. Keep native harness
qualification in M2; this milestone does not duplicate that acceptance item. The application pilot must respect the
target project's instructions and permissions; this roadmap does not itself authorize modifying another repository,
publishing, merging or deploying. Record pilot evidence in a dedicated session report and link it here before checking
the item.

Planning reconciliation: [planning report](docs/sessions/archive/m5-planning.md). Implementation:
[M5 follow-up](docs/sessions/archive/m5-follow-up.md). Local application pilot executed with review/handoff PASS:
[evidence](docs/sessions/archive/m5-application-pilot.md). Its target PR/browser/accessibility gates remain incomplete;
the checklist item stays unchecked.

Release publication is outside this checklist and needs separate authorization plus verified compatibility evidence.

## Milestone 6 — documentation and design requirements

- [x] Deliver module README requirements, end-of-session documentation updates, Prettier Markdown rules, web design
      system with Impeccable/Hallmark, and official Supabase skill routing; validate installation and obtain independent
      review.

Candidate and verification: [requirements report](docs/sessions/archive/documentation-design-requirements.md).

- [x] Deliver Supabase SaaS schema snapshots and typed migration guidance with explicit pre-live/live rules; validate
      installed guidance and obtain independent review.

Evidence: [Supabase SaaS follow-up](docs/sessions/archive/supabase-saas-guidance.md).

## Milestone 7 — configurable agentic delivery

Added after the 2026-11-26 project review against the target delivery flow: a principal agent fans out parallel workers
for features and bugfixes, each candidate passes independent review and, when configured and available, an external
Codex review; the project chooses at installation whether delivery ends at a PR or at a direct merge. The lower overall
percentage reflects added scope; completed M1–M6 evidence is unchanged. The CLI keeps launching no agents (ADR
0004/0005); harnesses execute, while this repository provides configuration, procedures, ledgers and deterministic
checks. Items are grouped by feature; `roadmap` recomputes the feature table below.

| Feature                          | Items | Progress |
| -------------------------------- | ----- | -------- |
| F1 — configuration and wizard    | 3/3   | 100%     |
| F2 — orchestration pipeline      | 4/4   | 100%     |
| F3 — external review             | 1/1   | 100%     |
| F4 — handoff and documentation   | 2/2   | 100%     |
| F5 — technical assessment        | 1/1   | 100%     |
| F6 — progress tracking           | 2/2   | 100%     |
| F7 — harness-native entry points | 1/1   | 100%     |
| F8 — closure and pilot           | 1/2   | 50%      |

### F1 — configuration and wizard

- [x] Add `delivery.integration` (`pr` | `pr-auto-merge` | `direct-merge`) with merge method and merge prerequisites
      (required gates PASS, CI PASS, findings resolved). Non-PR modes require an explicit owner `merge` approval in
      `approvals`; compose maps the mode to pull-request/merge gates without weakening core gates. Record the decision
      in an ADR; add schema, composition and regression tests.
- [x] Add `execution.maxParallel` and define `review.external.policy: optional` semantics: an unavailable provider
      records NOT RUN with the reason and never PASS; `required` blocks completion. Accept `codex` as a provider binding
      without making core provider-specific; add composition and inspect tests.
- [x] Rework the Ink wizard with selection inputs; ask execution mode, maximum parallel workers, external review
      provider/policy, integration mode and test/lint/typecheck command bindings. Clarify or remove the documentation
      language question; update wizard tests and usage documentation.

### F2 — orchestration pipeline

- [x] Define explicit stages in orchestrate-delivery: plan → owner plan approval before fan-out → implement → verify →
      independent review → external review when configured → integrate → PR or merge per `delivery.integration`. Bound
      review/fix iterations and escalate to the owner when the limit is reached.
- [x] Replace the shared-checkout rule with one isolated worktree and branch per worker task; define branch naming, path
      ownership, cleanup of merged or abandoned worktrees and preservation of unmerged work.
- [x] Add a file-based task ledger (schema and template): task ID, kind, acceptance criteria, owner, owned paths,
      dependencies, worktree/branch, stage, candidate identity and evidence links. `doctor` validates it and reports
      overlapping owned paths among active tasks.
- [x] Define serial integration: rebase or merge one task at a time onto the target branch, rerun applicable gates on
      the integrated candidate and read actual CI check states (QUEUED/RUNNING/PASS/FAIL) before PR completion or merge.

### F3 — external review

- [x] Deliver an installed external-review procedure for Codex: availability detection, frozen candidate brief without
      implementer conclusions, invocation, findings with stable IDs, dispositions and re-review after fixes. External
      review complements, and never replaces, independent review; contract checks cover routing and states.

### F4 — handoff and documentation

- [x] Split handoff: keep resumable state there and extend it to orchestration resume (in-flight tasks, worktrees,
      stages, pending reviews); move module README, session documentation refresh and Prettier rules to a dedicated
      update-docs procedure referenced by documentation-current.
- [x] Add drift diagnostics to `doctor`: PR/merge states cited in STATUS/ROADMAP versus actual GitHub state when access
      exists (NOT RUN otherwise), roadmap links to missing evidence, and stale task authorizations in entry files.

### F5 — technical assessment

- [x] Deliver an installed technical-assessment procedure covering architecture boundaries, technical debt, test
      coverage, dependency health, performance risks and documentation quality, with severity-ranked findings and
      remediation priorities; keep assess-project as plan-versus-state comparison and route both in core workflows.

### F6 — progress tracking

- [x] Extend roadmap policy and template to Milestone → Feature → item with completed/total and rounded percentages per
      feature, milestone and project; keep flat milestones valid for existing roadmaps without features.
- [x] Add a deterministic roadmap check (CLI command and `doctor` diagnostic) that recomputes counts and percentages
      from checkboxes and fails on mismatched summaries; add regression tests, including this repository's roadmap.

### F7 — harness-native entry points

- [x] Optionally generate harness-native orchestration entry points: Claude Code worker/reviewer subagents and a
      delivery command, plus the Codex equivalent, as generator-owned files under three-way update. Do not claim native
      qualification until observed in a native session. Codex equivalent (review M7-R5, R2-7): project-scoped custom
      agents under `.codex/agents/`; Codex has no project command file.

### F8 — closure and pilot

- [x] Reconcile this repository: STATUS PR states (PRs #1–#4 merged), remove the stale Milestone 3 authorization from
      AGENTS.md, decide on the frozen Python reference with an ADR, archive milestone session evidence, and delete
      merged branches only with owner authorization.
- [ ] Run an orchestrated pilot on a disposable project with at least two parallel workers, independent review, external
      Codex review when available, and both `pr` and `direct-merge` modes; obtain independent review of the M7 candidate
      and record evidence in a dedicated session report.

Recommended order: F8 reconciliation and F1 first, since they define the configuration the rest reads; then F2 and F3;
then F4–F7; the F8 pilot last. This roadmap does not authorize merging, publishing, deploying or modifying other
repositories.
