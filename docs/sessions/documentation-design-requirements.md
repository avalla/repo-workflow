# Documentation and design requirements

Date: 2026-11-13. Scope: repository rules and installed guidance; no adoption into other projects.

Core policy, handoff and generated entry instructions require a README.md per logical module, documentation refresh at
every work-session end and Prettier 3 write/check on added or edited Markdown. The repository Markdown override matches
../brawlergame/.prettierrc.json: proseWrap always, printWidth 120. Existing target configuration must be preserved. No
untouched Markdown is reformatted and no project configuration is overwritten by installation.

The web profile requires a project-owned design system plus Impeccable and Hallmark usage evidence. The Supabase profile
installs the official skill setup guide and declares external skills as prerequisites. The official Supabase
documentation was consulted on this date; no upstream skill is vendored or auto-executed. Impeccable/Hallmark versions
and invocation procedures must be verified in the consuming project; no unverified CLI syntax is prescribed. Existing
browser, accessibility, database and documentation gates remain in force.

Validation: `bun run check` PASS (TypeScript, 39 tests, 2,365 assertions), including links, profile resolution,
installation/lifecycle and context budgets. Prettier 3 write/check applies to all changed Markdown. Initial
context-budget failures (8,802, 8,186 and 8,043 bytes) were corrected by moving detail to handoff and condensing core
wording; the limit remains 8,000 bytes. Independent review found DD-001 (M6 summary row outside its table); corrected
and awaiting re-review. PR publication is pending. External tool execution, native skill discovery and consuming-project
delivery: NOT RUN. Historical M4/M5 reviews do not cover this candidate. M6 stays unchecked until required evidence
exists.

Next: obtain independent review and PR evidence for the actual candidate.

The README requirement applies to logical modules; this change establishes policy and installed guidance, not a
retroactive README coverage audit or retrofit. Existing-module coverage is not certified. Disposable web and library-CLI
installations include the generated session/README/Prettier instructions; the mixed-monorepo installation includes the
Supabase setup guide.
