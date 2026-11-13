# Official Supabase skills

For projects selecting technology-supabase, use the official
[Supabase agent skills](https://supabase.com/docs/guides/ai-tools/ai-skills) from
[supabase/agent-skills](https://github.com/supabase/agent-skills). Load `supabase` for Supabase tasks; load
`supabase-postgres-best-practices` before database changes or diagnosis, including schema, migrations, RLS, SQL and
performance work.

During authorized project setup, install the official skills at project scope:

```sh
npx skills add supabase/agent-skills --skill supabase
npx skills add supabase/agent-skills --skill supabase-postgres-best-practices
```

Record the reviewed source revision, installed paths and harness discovery evidence in the owning project report. Read
the installed SKILL.md and its applicable references before work. Recheck upstream guidance during upgrades; review
updates before adopting them. Preserve project-owned rules, permissions and independent review gates. Missing skills
must be reported explicitly; do not claim their checks passed.

The workflow CLI installs this setup guide with the selected profile. It does not fetch, vendor or execute external
skills, run these commands, grant database access or install into other projects automatically.

## SaaS database structure and migrations

For SaaS projects, keep a generated, version-controlled schema snapshot at `supabase/schema.sql`. Regenerate it after
every database structure change, including tables, constraints, indexes, functions, triggers, grants and RLS policies,
and commit it with the migrations before handoff. LLMs must read this snapshot to understand the current data model,
then consult the migrations and project documentation for intent and history. Migrations remain the source of truth; do
not edit the generated snapshot manually.

Generate a schema-only dump from a local development database with the current migrations applied. With a CLI version
supporting these flags:

```sh
supabase db dump --local --file supabase/schema.sql
```

Verify the installed CLI's target selection and flags before running it. Review the generated diff for completeness and
sensitive literals: schema-only excludes row data but SQL definitions can still contain secrets. Record the included
application schemas and any dump exclusions in the project README; Supabase-managed schemas such as auth and storage may
be excluded by default. Document application-owned policies or triggers on excluded schemas in migrations and the README
so LLMs can find them. This snapshot is structural documentation, not a database backup. Never include production rows,
credentials or secrets.

Separate migrations by type in distinct, timestamp-ordered SQL files under `supabase/migrations/`, using descriptive
names: tables/constraints, indexes, functions/triggers, RLS/policies/grants, and data transformations. Keep fixtures and
repeatable development seed data in the configured seed files, separate from structural migrations. Preserve dependency
order across types; use multiple files of the same type when needed. Do not group them into type subdirectories that the
CLI will not apply. Validate that the complete migration sequence rebuilds the intended schema and regenerate the
snapshot from the applied result.

Before the project is live, existing migrations may be edited, reordered or consolidated and the development database
may be reset to replay them. Record the explicit pre-live status, coordinate with collaborators and use an isolated,
disposable development database whose data can be discarded. Rebuild, validate applicable database checks and regenerate
`supabase/schema.sql` after rewriting history. A project's pre-live status does not authorize resetting a shared or
production database or discarding valuable data.

Once live, preserve applied migration history and make changes through new forward migrations. Do not reset a live
database as a development workflow. Record go-live status in project-owned documentation; if it is unknown, preserve
history and resolve the status before any rewrite or reset.

References: [Supabase CLI database commands](https://supabase.com/docs/reference/cli/supabase-db-dump) and
[database migrations](https://supabase.com/docs/guides/deployment/database-migrations). These are instructions for
receiving projects; this documentation change executes no database commands.
