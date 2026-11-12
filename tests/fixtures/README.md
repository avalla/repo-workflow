# Acceptance fixtures

Executable now: strict schema definitions, four valid project examples, six profiles, four presets,
five invalid configurations, nested unknown-field rejection, command/environment references,
lock base hash, evidence states/dates, catalogue references, local links and byte budgets.
Gate binding/procedure exclusivity, external reviewer binding and forbidden override fields are also checked.
Run `bun run check` with pinned Bun dependencies. Python validation remains as M1/M2 reference.
The synthetic command binding deliberately fails if run; validation reads it as data only.
The lock/evidence examples use placeholder identities and are not installation or passing gate records.

`scenarios.json` contains 40 declarative acceptance cases with inputs and expected outcomes.
Their inventory/structure is checked. `tests/test_tool.py` executes M2 composition and initial-install
behavior on disposable targets. Bun tests execute M3 updates, removal, uninstall and interrupted transaction recovery.
Compact synthetic dependency graphs specify relationships, not full profile-schema objects.
Fixtures requiring files specify literal UTF-8 content or preconditions for a disposable test harness.

| Acceptance area | Representative scenarios | Execution milestone |
| --- | --- | --- |
| Determinism and origins | deterministic-render | 2 |
| Compatibility and scoping | mixed-scope, incompatible-surface, missing-profile, transitive-requirement, requirement-cycle, conflicting-versions, declared-conflict | 2 |
| Generic fallback | unknown-stack | 2 |
| Gate retention/authority | required-gate-retained, selector-clause-union, unaccepted-override, adapter-weakening | 2 |
| Paths/ownership/install | duplicate-target, symlink-collision, path-escape, casefold-collision, entry-block-preservation, unrelated-skill | 2 |
| Stale/idempotent apply | stale-plan, repeat-applied-plan | 2 |
| Three-way outcomes | unchanged-managed, local-only-edit, converged-edit, divergent-edit, local-deletion | 3 |
| Removal and memory | unchanged-removal, modified-removal, project-memory-preserved, uninstall-modified | 3 |
| Recovery | partial-failure, recovery-user-edit | 3 |
| Resume and context | resume-without-history, startup-context | 2 |
| Honest gaps and safe docs | missing-prerequisites, docs-only, commands-never-run, pending-ci-not-pass, reviewer-unavailable | 2 |
| Explicit support limits | unsupported-multi-repo | 2 |

Executable Bun and historical M2 tests compare real outputs/bytes; the scenario inventory itself is not a one-to-one
executable runner. Evidence ingestion (including pending CI), native resume and real independent
review remain NOT RUN. A successful fixture
inventory check is not evidence of deterministic rendering, safe installation, controller support,
review independence, or update recovery.

Current Bun coverage: `tests/contracts.test.ts` checks contracts/catalogue; `tests/tool.test.ts` checks
composition and lifecycle; `tests/wizard.test.tsx` drives Ink with simulated TTY input. Seven
base/local/incoming cases run directly from scenarios.json. Other areas use dedicated tests; this
is not a claim that all 40 cases have one-to-one runners. Native resume and pilots remain outstanding.
