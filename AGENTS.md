# Repository contract

Read docs/STATUS.md and the current task first. Use REPO_GRAPH.md to locate the owning
contract; load only relevant profiles, workflows and ADRs. Keep evidence on disk.

This repository currently defines Milestone 1. Do not implement the CLI, adopt into source
projects, publish, deploy, or infer authorization from configured commands. Preserve existing files.
Use the smallest coherent change. Keep core provider-neutral; adapters cannot weaken gates.
Unknown fields fail. Policies have declared merge rules; never use last-writer-wins.

Project-owned architecture, bindings, approval policy, ADRs and evidence survive upgrades.
Required gates stay incomplete when prerequisites or independent review are unavailable.
Self-review is not independent review. Report the actual candidate and what was not run.

Run the README contract validation after changes. Update STATUS and the relevant owning
report; update the map only for structural changes. Read core/WORKFLOWS.md for task routing.
Do not load the whole catalogue on resume. This file is project-owned in this source repository.
