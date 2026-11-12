# Schema contract v1

JSON Schema draft 2020-12, local references only. `common` defines paths, scoped selections and gates;
`config`, `profile`, `preset`, `lock`, and `evidence` reject unknown object fields. Component `settings`
is an explicit scalar extension bag: selected profiles must recognize each key or reject it semantically.
Technology IDs are open, so an unknown stack can receive honest generic fallback.

Configuration explicitly declares command argv/cwd/affected paths/effects/authority, environment
requirements, required/optional gates with applicability, approval boundaries and recorded overrides.
Review bindings name providers only outside core. Examples deliberately leave technical bindings unset;
they are valid authoring configurations, not runnable installations. Confirm real scripts during adoption.

The brief's illustrative YAML is not copied as a runnable config: `rendering` and `queueBackend` belong
in component `settings`; explicit `profiles`, `commands`, `environments`, `gates`, `approvals`, and
`overrides` complete the contract. `presets` binds pinned selections to named components; the web example
exercises this authoring form. JSON avoids a runtime YAML dependency. Schema version 1 is a draft
authoring contract, not a backward-compatibility claim for a released product.

Semantic checks include referential integrity, version cycles/conflicts, selector scope, recognized
settings, safe canonical paths, environment agreement, accepted override authority, lock base hashes,
review context and candidate evidence. Schemas alone cannot establish these facts. The M1 validator
checks schema examples and catalogue integrity. The supported Bun tool additionally checks configuration
composition and lifecycle inputs; evidence schemas do not constitute an evidence-ingestion engine.
See [acceptance coverage](../tests/fixtures/README.md) for implemented checks and explicit gaps.
