# Deterministic composition contract

Compose core + independent project dimensions + component profiles + capability packs + task
workflow + project policy + adapter. Delivery, surface and layout are independent. Presets
select exact module versions; they never embed a second workflow. IDs are extensible strings;
unknown stacks receive core guidance and a missing-technical-gates diagnostic. An unresolved named
profile is an error, not an unknown-stack fallback. Capability names describe intent; selecting a
name alone does not install a pack or establish verification coverage.

The project-owned config is `.repo-workflow.json`. `localProfiles` lists checkout-relative JSON
profile files explicitly; local profiles use the same schema. Reject duplicate ID/version definitions
across local and bundled catalogues rather than shadowing one. Plans hash these files as inputs.
Normal operation reads the selected checked-in installation; it does not fetch this source repository.

Resolution stages (implementation belongs to Milestone 2):

1. Validate strict schemas, including unknown fields. JSON is the initial interchange format.
2. Expand presets and exact-version transitive requirements. Reject cycles, missing versions,
   conflicting versions in one scope, duplicate scoped selections and declared conflicts.
   Configuration `presets` selects ID/version plus an existing component ID. Substitute that ID for
   `<selected-component>` in preset scopes; leave project-scoped selections unchanged. To target
   multiple components, select the preset separately for each. Expansion is a set union: identical
   selections from distinct presets coalesce with all origins retained; explicit duplicates fail.
3. Scope is `project` or `component:<id>`. Requirements inherit the selecting scope.
   Component selections must use their containing component's scope. Check applicability:
   nonempty surfaces/layouts are allowed values; nonempty stacks require every listed stack.
   Reject surface/stack requirements at project scope. Empty lists mean unrestricted.
4. Check paths and bindings. Paths are relative POSIX paths; `.` is allowed only as a component
   root or command cwd. No absolute paths, backslashes, traversal, controls, symlink ancestors or
   case-folded collisions. Reject overlapping component roots; use separate shared-package components.
   Managed targets must fall within the reserved managed/skill namespaces or the declared entry block;
   reject `.git/`, source files and project-owned targets. Internal framework references are not install targets.
   Multi-repository layout is reserved: until a local root manifest is defined, fail as unsupported.
5. Merge only the fields below; report conflicts and missing prerequisites before any write.
6. Explain every effective rule with origin `(module ID, version, scope, source field)` and decision
   reference. Canonical output is UTF-8 JSON, sorted keys, two-space indentation, LF and final newline.
   Sort set-like lists by stable ID/scope/path; preserve argv and workflow step order. Reject duplicate
   contributed targets even for identical bytes. Identical inputs and generator version yield identical
   bytes. Ambient time, home files, network and directory iteration order are not inputs.

## Field semantics

| Field | Merge |
| --- | --- |
| invariants, prerequisites, resources, references, skills | Set union within scope |
| scoped gate IDs | required is logical OR; applicability is union of selector clauses |
| gate category, binding, environment, procedure | Equal or conflict; null contributes no value |
| gate resources | Set union |
| command binding by ID | One project-owned binding; no inference from stack |
| profile version, component path/surface/settings | Equal or conflict |
| state paths, languages, review provider, context budget | Project configuration only |
| external review | Additional gate; core independent review always required |
| contributed file targets | Unique ownership or collision error |

Project gates extend profile gates. Null bindings remain adoption gaps; they never erase a binding.
Applicable required unbound gates block completion, not schema validation. Core always contributes
`independent-review` for every task, with a manual procedure and required=true. Configured external
review adds `external-review` when required. No task route suppresses these gates or owner approvals.

Within one applicability clause use AND across nonempty component/path/task lists and OR within a
list; empty lists mean all. When contributions share a gate ID, retain the OR of whole clauses;
never union individual lists and create unintended cross-products. Paths are literal file/directory
prefixes at segment boundaries, not globs. Component-profile paths are relative to that component;
project gate paths are checkout-relative. Deleted paths count as affected. Effective identity is
`<scope>/<gate ID>`. Component applicability IDs must name existing components.

## Decisions and authority

Local invariants add constraints in scope. Overrides record field, scope, replacement value, accepted
ADR path, responsible authority and reason. Only `gates.<id>.required`, `review.external.policy` and
`approvals.<id>.policy` may be proposed for weakening; component gate fields use
`components.<id>.gates.<id>.required`. Reject other override fields. An accepted decision must name
old/new values and actual owner authorization; a file's existence or an LLM claim is insufficient.
Core independent review cannot be disabled in version 1. Adapter overrides are forbidden. Supersede
old decisions explicitly. Semantic validation is required beyond JSON Schema.

Approval records are project-owned, identified by ID, scope, applicability, required policy and authority.
No preset grants authority. A configured approval means a gate requiring actual authorization evidence.
An applicable required approval contributes `approval-<id>`; only its authorized PASS closes it.

Each gate uses a command binding or a manual procedure, never both; an unbound gate is a visible gap.
Binding/environment IDs must exist and agree. Environment requirements are descriptions, not secrets.
Inspect/plan/doctor/install never execute configured commands. Ordered argv avoids implicit shell
interpolation; a shell must be explicitly bound as argv[0] and remains subject to task authorization.
