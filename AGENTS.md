# Repository contract

Read docs/STATUS.md and the current task first. Use REPO_GRAPH.md to locate the owning
contract; load only relevant profiles, workflows and ADRs. Keep evidence on disk.

The current task authorizes Milestone 3, a Bun migration and an Ink creation wizard.
Publishing to avalla/repo-workflow is authorized. Do not adopt into source projects, deploy, or infer
authorization from configured commands. Preserve existing files.
Use the smallest coherent change. Keep core provider-neutral; adapters cannot weaken gates.
Unknown fields fail. Policies have declared merge rules; never use last-writer-wins.

Project-owned architecture, bindings, approval policy, ADRs and evidence survive upgrades.
Required gates stay incomplete when prerequisites or independent review are unavailable.
Self-review is not independent review. Report the actual candidate and what was not run.

Run the README contract validation after changes. Update STATUS and the relevant owning
report; update the map only for structural changes. Read core/WORKFLOWS.md for task routing.
Keep ROADMAP.md as milestone checklists with completed/total counts and percentage summaries;
refresh them after task or scope changes and leave unverified work unchecked.
Do not load the whole catalogue on resume. This file is project-owned in this source repository.
