# ADR-0001: Composable local contracts

Status: accepted for Milestone 1 design, 2026-11-12.
Authority: user-authorized design implementation; no source-project policy change.

Context: a SaaS can also be a web monorepo; one preset per project type duplicates workflows.
Alternatives: exclusive presets; an orchestration platform; independent dimension modules.
Decision: provider-neutral core, scoped profiles, capability modules and thin adapters. Select exact
versions and attach origins to effective rules. Keep technical checks component-scoped. Use strict
JSON Schema with JSON examples, explicit settings extensions and project-owned command bindings.
Consequences: portable checked-in operation; semantic validation remains necessary. Unknown stacks
receive core guidance with an explicit coverage gap. No universal support claim or service dependency.
