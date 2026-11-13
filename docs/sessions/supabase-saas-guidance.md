# Supabase SaaS guidance

Base: `da4e791` on `docs/supabase-saas-database-guidance`.

Scope: extend the existing installed Supabase guide and profile invariant. SaaS projects must regenerate and commit
`supabase/schema.sql` after structural changes for LLM understanding; migrations remain authoritative. Separate ordered
migration files by type. Permit development history rewrites and disposable resets before explicit go-live; preserve
applied history once live or when status is unknown. No configuration schema or runtime changes.

The existing profile installation path distributes this guide. Other documentation and the repository map retain their
current ownership; no structural change was introduced. Sources checked through Context7: official Supabase CLI dump,
reset and migration documentation. CLI syntax must be checked against the receiving project's installed version.

Validation PASS: `bun run check` (TypeScript, 39 tests, 2,373 assertions, including README Markdown/link and contract
validation); changed Markdown formatted with Prettier 3; `git diff --check` PASS. Independent
[review](supabase-saas-review.md) PASS on candidate `4f5326c`, with no actionable findings. Scoped rendered guide
inclusion and absence for unrelated projects were independently verified. No database commands, target-project adoption,
merge or deployment.

PR: [#4](https://github.com/avalla/repo-workflow/pull/4), base `test/claude-native-qualification`. Subsequent closure
documentation records M6 2/2 and overall 28/30 (93%), with M2 and M5 still incomplete. Final closure consistency review
is recorded in the independent report. No merge performed.
