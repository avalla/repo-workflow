# Representative profiles

Six modules cover monorepo coordination, web/browser/accessibility, Supabase SQL/RLS, outbox workers,
Unreal native/hardware checks, and library/CLI consumers/packaging. They are specification-derived
examples informed by verified sources in [provenance](../docs/SOURCES.md), not tested support claims.
No exact command is inferred. Empty contributed-file lists avoid inventing installer behavior.

Presets are authoring selections: replace `<selected-component>` explicitly for each applicable
component. Never apply web rules to a worker automatically. SaaS delivery remains a separate dimension.
A Supabase worker selects database/outbox modules without web. An Unreal client can share a repository
with a SaaS API. Local custom profiles use the same schema and pinned IDs/versions; never auto-fetch.
Unknown stacks receive core guidance plus missing technical-gate coverage until a real profile exists.

Compatibility rejects mismatched scope/applicability, incompatible versions/settings, overlapping
roots, duplicate targets and declared conflicts. `conflicts` is symmetric within a scope even when
declared on one side only. `requires` inherits scope and exact version. Empty requirements/conflicts
are intentional for these independent modules; synthetic cases exercise those relationships.
