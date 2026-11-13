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
